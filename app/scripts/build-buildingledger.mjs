/* ===== build-buildingledger.mjs — 서강 물건 주소 → 건축물대장 실연동 배치 =====
 * 흐름: SEOGANG_LISTB 주소 → 도로명주소 검색 API(법정동코드·지번) → 건축HUB 표제부(연면적·층수·사용승인·구조·주용도)
 *       → 각 물건에 buildingLedger 병합 → pipelineSeogang.generated.js 재작성 (+ 캐시)
 *
 * 실행 (프로젝트 app 디렉터리에서):
 *   JUSO_KEY="도로명주소 승인키" BLD_KEY="건축HUB serviceKey(디코딩된 원본)" node scripts/build-buildingledger.mjs
 *
 * 주의: 키는 환경변수로만 받는다(코드/레포에 넣지 않음). BLD_KEY는 data.go.kr '일반 인증키(Decoding)'를 그대로.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dir = dirname(fileURLToPath(import.meta.url))
const SRC = resolve(__dir, '../src/pipelineSeogang.generated.js')
const CACHE = resolve(__dir, '../src/buildingLedger.cache.json')

const JUSO_KEY = process.env.JUSO_KEY
const BLD_KEY = process.env.BLD_KEY
if (!JUSO_KEY || !BLD_KEY) { console.error('환경변수 JUSO_KEY, BLD_KEY 를 설정하세요.'); process.exit(1) }

const sleep = (ms) => new Promise(r => setTimeout(r, ms))
const cache = existsSync(CACHE) ? JSON.parse(readFileSync(CACHE, 'utf8')) : {}

// SEOGANG_LISTB 배열만 추출 (파일 실행 없이 JSON만 파싱)
const raw = readFileSync(SRC, 'utf8')
const mStart = raw.indexOf('[', raw.indexOf('SEOGANG_LISTB'))
let depth = 0, end = -1, inStr = false, esc = false
for (let i = mStart; i < raw.length; i++) {
  const ch = raw[i]
  if (inStr) { if (esc) esc = false; else if (ch === '\\') esc = true; else if (ch === '"') inStr = false }
  else { if (ch === '"') inStr = true; else if (ch === '[') depth++; else if (ch === ']') { depth--; if (depth === 0) { end = i; break } } }
}
const rows = JSON.parse(raw.slice(mStart, end + 1))
const header = raw.slice(0, raw.indexOf('export const SEOGANG_LISTB'))

// 주소 정제 — 건물 단위로 정규화(동/호/층 제거), 괄호 보조정보 분리
function cleanAddr(addr) {
  let a = String(addr || '')
  const paren = (a.match(/\(([^)]*)\)/) || [])[1] || ''
  a = a.replace(/\([^)]*\)/g, ' ')
  a = a.replace(/\b[Bb]?\d+\s*층/g, ' ')          // 층
  a = a.replace(/\d+\s*동(?=\s*\d+\s*호)/g, ' ')    // 건물 동 (뒤에 호가 붙을 때만 — 법정동 오제거 방지)
  a = a.replace(/\d+\s*호\b/g, ' ')                // 호
  a = a.replace(/\s{2,}/g, ' ').replace(/\s*,\s*$/,'').trim()
  return { query: a, hint: paren }
}
// 건물 단위 dedup 키
const bkey = (r) => cleanAddr(r.address).query + '|' + (r.name || '')

async function jusoLookup(query) {
  const url = `https://business.juso.go.kr/addrlink/addrLinkApi.do?confmKey=${encodeURIComponent(JUSO_KEY)}&currentPage=1&countPerPage=5&keyword=${encodeURIComponent(query)}&resultType=json`
  const r = await fetch(url, { signal: AbortSignal.timeout(15000) })
  const j = await r.json()
  const list = j?.results?.juso || []
  if (!list.length) return null
  const t = list[0]
  return { admCd: t.admCd, bun: t.lnbrMnnm, ji: t.lnbrSlno, bdMgtSn: t.bdMgtSn, roadAddr: t.roadAddr, jibunAddr: t.jibunAddr }
}

async function ledgerLookup(admCd, bun, ji) {
  const sigunguCd = admCd.slice(0, 5), bjdongCd = admCd.slice(5, 10)
  const url = `https://apis.data.go.kr/1613000/BldRgstHubService/getBrTitleInfo?serviceKey=${encodeURIComponent(BLD_KEY)}`
    + `&sigunguCd=${sigunguCd}&bjdongCd=${bjdongCd}&platGbCd=0&bun=${String(bun).padStart(4,'0')}&ji=${String(ji||0).padStart(4,'0')}&_type=json&numOfRows=100&pageNo=1`
  const r = await fetch(url, { signal: AbortSignal.timeout(15000) })
  const j = await r.json()
  let items = j?.response?.body?.items?.item
  if (!items) return null
  if (!Array.isArray(items)) items = [items]
  if (!items.length) return null
  // 주건축물 우선, 없으면 연면적 최대 동
  items.sort((a, b) => (b.mainAtchGbCdNm === '주건축물' ? 1 : 0) - (a.mainAtchGbCdNm === '주건축물' ? 1 : 0) || (Number(b.totArea) || 0) - (Number(a.totArea) || 0))
  const it = items[0]
  const useDay = String(it.useAprDay || '')
  const yr = useDay.length >= 4 ? Number(useDay.slice(0, 4)) : null
  return {
    matched: true,
    gfa: Number(it.totArea) || null,
    grndFlr: Number(it.grndFlrCnt) || null,
    ugrndFlr: Number(it.ugrndFlrCnt) || 0,
    approvalDate: useDay.length === 8 ? `${useDay.slice(0,4)}-${useDay.slice(4,6)}-${useDay.slice(6,8)}` : null,
    approvalYrAgo: yr ? (new Date().getFullYear() - yr) : null,
    struct: it.strctCdNm || null,
    mainUse: it.mainPurpsCdNm || null,
    bldNm: it.bldNm || null,
  }
}

const byKey = new Map()
for (const r of rows) { const k = bkey(r); if (!byKey.has(k)) byKey.set(k, []) ; byKey.get(k).push(r) }
console.log(`물건 ${rows.length}건 · 건물 단위 ${byKey.size}곳 조회 시작`)

let ok = 0, miss = 0, i = 0
for (const [k, group] of byKey) {
  i++
  let bl = cache[k]
  if (!bl) {
    try {
      const { query } = cleanAddr(group[0].address)
      const juso = await jusoLookup(query)
      if (!juso) { bl = { matched: false, reason: 'juso 0건', query } }
      else {
        const led = await ledgerLookup(juso.admCd, juso.bun, juso.ji)
        bl = led ? { ...led, bdMgtSn: juso.bdMgtSn } : { matched: false, reason: '대장 0건', query }
      }
      cache[k] = bl
      writeFileSync(CACHE, JSON.stringify(cache, null, 1))
      await sleep(250)
    } catch (e) { bl = { matched: false, reason: 'error: ' + e.message }; }
  }
  bl.matched ? ok++ : miss++
  for (const r of group) r.buildingLedger = bl
  if (i % 10 === 0) console.log(`  ...${i}/${byKey.size} (매칭 ${ok} · 미매칭 ${miss})`)
}

const out = header + 'export const SEOGANG_LISTB = ' + JSON.stringify(rows) + ';\n\nexport function buildSeogangListB(){ return SEOGANG_LISTB.map(r => ({ ...r })); }\n'
writeFileSync(SRC, out)
console.log(`완료 — 매칭 ${ok} · 미매칭 ${miss}. pipelineSeogang.generated.js 갱신됨.`)
