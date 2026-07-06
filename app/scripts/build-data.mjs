/* build-data.mjs — 첨부 실데이터 → public/data/appdata.js (window.APPDATA + window.APP_ACCOUNTS)
 * - List A(신규 후보): 건축물대장 CSV(서울 중구), branch = postcode 매칭
 * - List B(업셀링): 자료1 인력경비 현황(호남 고객), branch = 지사
 * - 화재: 블루스캔 뉴스 CSV
 * - 계정: 자료1 영업담당자(지사) + postcode 1차담당자(수도권 지사) + admin, pw=1234
 */
import * as XLSX from 'xlsx'
import { readFileSync, writeFileSync } from 'node:fs'

const DIR = 'C:/Users/User/Desktop/26.6.9-12/빌더작업/데이터'   // 기존: 침수 shapefile·시군구 경계
const SRC = 'C:/Users/User/Downloads/데이터추가'                  // 추가된 최신 데이터(건축물대장·뉴스·POSTCODE·업셀링 B-1/B-2)
const OUT = 'C:/Users/User/Desktop/260610 프로젝트/app/public/data/appdata.js'
const TODAY = '2026-06-10'

const readCp949 = (p) => new TextDecoder('euc-kr').decode(readFileSync(p))
const readUtf8 = (p) => new TextDecoder('utf-8').decode(readFileSync(p)).replace(/^﻿/, '')
const xlsx = (p) => XLSX.read(readFileSync(p), { type: 'buffer' })
const rowsOf = (wb, sn) => XLSX.utils.sheet_to_json(wb.Sheets[sn], { header: 1, blankrows: false })

// CSV line splitter that respects quotes
function splitCsvLine(line) {
  const out = []; let cur = '', q = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (q) { if (ch === '"') { if (line[i + 1] === '"') { cur += '"'; i++ } else q = false } else cur += ch }
    else { if (ch === '"') q = true; else if (ch === ',') { out.push(cur); cur = '' } else cur += ch }
  }
  out.push(cur); return out
}

const normBranch = (s) => {
  s = (s || '').toString().trim()
  if (!s) return s
  if (/지사$|지점$|영업소$|센터$/.test(s)) return s
  return s + '지사'
}
const SIDO_SHORT = { '서울특별시': '서울', '부산광역시': '부산', '대구광역시': '대구', '인천광역시': '인천', '광주광역시': '광주', '대전광역시': '대전', '울산광역시': '울산', '세종특별자치시': '세종', '경기도': '경기', '강원특별자치도': '강원', '강원도': '강원', '충청북도': '충북', '충청남도': '충남', '전북특별자치도': '전북', '전라북도': '전북', '전라남도': '전남', '경상북도': '경북', '경상남도': '경남', '제주특별자치도': '제주' }
const shortSido = (s) => SIDO_SHORT[s] || s

// 동/가/리 추출
function extractDong(addr) {
  addr = (addr || '').toString()
  const paren = addr.match(/\(([^)]*동)[^)]*\)/)
  if (paren) { const m = paren[1].match(/[가-힣0-9]+동/); if (m) return m[0] }
  const m = addr.match(/([가-힣]+\d*동|[가-힣]+\d*가|[가-힣]+리)(?=\s|\d|\(|,|$)/)
  return m ? m[1] : ''
}
function parseRegion(addr) {
  const toks = (addr || '').toString().trim().split(/\s+/)
  const sido = shortSido(toks[0] || '')
  const gun = (toks[1] && /(구|군|시)$/.test(toks[1])) ? toks[1] : (toks[2] && /(구|군|시)$/.test(toks[2]) ? toks[2] : '')
  const dong = extractDong(addr)
  return { sido, gun, dong }
}

/* ---------------- POSTCODE → branch index ---------------- */
const pLines = readUtf8(SRC + '/POSTCODE_dummy.csv').split(/\r?\n/).filter(Boolean)
const postByKey = new Map()   // "서울 중구 순화동" -> {branch, mgr, mgrName}
const postByGu = new Map()    // "서울 중구" -> branch (fallback)
const postByCode = new Map()  // "04511" -> branch (우편번호 직접 매칭)
const firstMgrByBranch = new Map()
for (let i = 1; i < pLines.length; i++) {
  const c = pLines[i].split(',')
  const code = (c[0] || '').trim(), addr = c[1] || '', branch = c[5] || '', mgr = c[6] || '', mgrName = c[7] || ''
  const toks = addr.split(/\s+/)
  const sido = toks[0], gu = toks[1], dong = toks[2]
  if (code && branch && !postByCode.has(code)) postByCode.set(code, branch)
  if (sido && gu) {
    const guKey = `${sido} ${gu}`
    if (dong) { const k = `${guKey} ${dong}`; if (!postByKey.has(k)) postByKey.set(k, { branch, mgr, mgrName }) }
    if (!postByGu.has(guKey)) postByGu.set(guKey, { branch, mgr, mgrName })
  }
  if (branch && !firstMgrByBranch.has(branch)) firstMgrByBranch.set(branch, { mgr, mgrName })
}
function branchOf(sido, gun, dong) {
  return postByKey.get(`${sido} ${gun} ${dong}`) || postByGu.get(`${sido} ${gun}`) || null
}

/* ---------------- 화재 뉴스 → firePoints ---------------- */
const GEO = { // 시도/대표도시 centroid (대략)
  '서울': [37.5663, 126.9779], '부산': [35.1796, 129.0756], '대구': [35.8714, 128.6014], '인천': [37.4563, 126.7052],
  '광주': [35.1595, 126.8526], '대전': [36.3504, 127.3845], '울산': [35.5384, 129.3114], '세종': [36.48, 127.289],
  '경기': [37.4138, 127.5183], '강원': [37.8228, 128.1555], '충북': [36.6357, 127.4917], '충남': [36.5184, 126.8],
  '전북': [35.7175, 127.153], '전남': [34.8161, 126.4629], '경북': [36.4919, 128.8889], '경남': [35.4606, 128.2132], '제주': [33.4996, 126.5312],
  '경주시': [35.8562, 129.2247], '포항': [36.019, 129.3435], '부천': [37.5034, 126.766], '성남': [37.42, 127.1265], '평택': [36.9921, 127.1129], '안산': [37.3219, 126.8309], '고양': [37.6584, 126.832],
}
function newsDays(dateStr) {
  // dateStr 2026-06-10 ; days from TODAY
  const a = (dateStr || '').replace(/[.\/]/g, '-').split('-').map(Number)
  const b = TODAY.split('-').map(Number)
  if (a.length < 3 || !a[0]) return 0
  const da = Date.UTC(a[0], a[1] - 1, a[2]), db = Date.UTC(b[0], b[1] - 1, b[2])
  return Math.max(0, Math.round((db - da) / 86400000))
}
function geoOf(region) {
  const toks = (region || '').trim().split(/\s+/)
  const sido = shortSido(toks[0] || '')
  for (let i = 1; i < toks.length; i++) { const key = Object.keys(GEO).find(k => toks[i].includes(k)); if (key) return { ll: GEO[key], sido } }
  if (GEO[sido]) return { ll: GEO[sido], sido }
  return { ll: null, sido }
}
const nLines = readUtf8(SRC + '/data_incident_news.csv').split(/\r?\n/).filter(Boolean)
const nh = splitCsvLine(nLines[0])
const NIDX = { region: nh.indexOf('발생 지역'), biz: nh.indexOf('상호명(건물명)'), dmg: nh.indexOf('인명/재산 피해 규모'), date: nh.indexOf('발행일'), cnt: nh.indexOf('보도건수'), sum: nh.indexOf('사건요약'), title: nh.indexOf('제목'), cat: nh.indexOf('분류'), kw: nh.indexOf('검색어'), url: nh.indexOf('링크') }
const firePoints = []
for (let i = 1; i < nLines.length; i++) {
  const c = splitCsvLine(nLines[i]); if (!c[NIDX.region]) continue
  const { ll, sido } = geoOf(c[NIDX.region])
  const days = newsDays(c[NIDX.date])
  const scale = /전소|폭발|사망|중상|대형|전신/.test(c[NIDX.dmg] + c[NIDX.title]) ? '대형' : /부상|일부/.test(c[NIDX.dmg]) ? '중형' : '소형'
  const j = (i % 7) * 0.012 - 0.04
  firePoints.push({
    lat: ll ? +(ll[0] + j).toFixed(5) : null, lng: ll ? +(ll[1] + (j * 0.8)).toFixed(5) : null,
    sigungu: (c[NIDX.region] || '').split(/\s+/).slice(0, 2).join(' '), dong: '', sido,
    type: '화재', scale, date: (c[NIDX.date] || '').replace(/[.\/]/g, '-'), days,
    title: c[NIDX.title] || c[NIDX.sum] || '', source: '뉴스', url: c[NIDX.url] || '', biz: c[NIDX.biz] || '',
  })
}

/* ---------------- 도시침수(기왕최대) 폴리곤 로드 + point-in-polygon ---------------- */
const APP_DIR = 'C:/Users/User/Desktop/260610 프로젝트/app'
// convert-flood.mjs가 생성한 manifest로 전체 침수 시군구 자동 로드
let FLOOD_DEFS = []
try { FLOOD_DEFS = JSON.parse(readFileSync(APP_DIR + '/public/flood/manifest.json', 'utf8')) }
catch (e) { console.log('flood manifest 없음 — 침수 레이어 0'); FLOOD_DEFS = [] }
const floodLayers = []
for (const d of FLOOD_DEFS) {
  let fc; try { fc = JSON.parse(readFileSync(APP_DIR + '/' + d.file, 'utf8')) } catch (e) { continue }
  let minLng = 999, minLat = 999, maxLng = -999, maxLat = -999
  const scan = (c, depth) => depth === 1
    ? c.forEach(([lng, lat]) => { if (lng < minLng) minLng = lng; if (lng > maxLng) maxLng = lng; if (lat < minLat) minLat = lat; if (lat > maxLat) maxLat = lat })
    : c.forEach(x => scan(x, depth - 1))
  const polys = []
  for (const f of fc.features) { const g = f.geometry; if (!g) continue; if (g.type === 'Polygon') { polys.push(g.coordinates); scan(g.coordinates, 2) } else if (g.type === 'MultiPolygon') { g.coordinates.forEach(p => polys.push(p)); scan(g.coordinates, 3) } }
  // 침수 구역 내부/외부 샘플점 — 합성 좌표 건물을 실제 침수구역에 배치하기 위함
  const inside = [], outside = []
  // 각 폴리곤 중심점(내부 보장)
  for (const poly of polys) {
    const ring = poly[0]; let sx = 0, sy = 0; ring.forEach(([x, y]) => { sx += x; sy += y })
    const cx = sx / ring.length, cy = sy / ring.length
    if (ptInRingRaw(cx, cy, ring)) inside.push([+cx.toFixed(6), +cy.toFixed(6)])
  }
  const N = 120
  for (let p = 0; p <= N; p++) for (let q = 0; q <= N; q++) {
    const lng = minLng + (maxLng - minLng) * p / N, lat = minLat + (maxLat - minLat) * q / N
    let isin = false; for (const poly of polys) { if (ptInRingRaw(lng, lat, poly[0])) { isin = true; break } }
    ; (isin ? inside : outside).push([+lng.toFixed(6), +lat.toFixed(6)])
  }
  floodLayers.push({ label: d.label, path: d.path, bbox: [minLng, minLat, maxLng, maxLat], polys, inside, outside, geo: fc })
}
// 구(시군구명) → 침수 레이어 (건물 좌표를 실제 침수구역 샘플점에 배치하기 위함)
const floodByGun = {}
floodLayers.forEach(fl => { const g = (fl.label || '').split(/\s+/).pop(); if (g) floodByGun[g] = fl })
function ptInRingRaw(x, y, ring) { let inside = false; for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) { const xi = ring[i][0], yi = ring[i][1], xj = ring[j][0], yj = ring[j][1]; if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) inside = !inside } return inside }
function ptInRing(x, y, ring) { let inside = false; for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) { const xi = ring[i][0], yi = ring[i][1], xj = ring[j][0], yj = ring[j][1]; if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) inside = !inside } return inside }
function floodOf(lng, lat) {
  for (const fl of floodLayers) {
    const [a, b, c, d] = fl.bbox
    if (lng < a || lng > c || lat < b || lat > d) continue   // 이 레이어 범위 밖
    let inPoly = false
    for (const poly of fl.polys) { if (ptInRing(lng, lat, poly[0])) { inPoly = true; break } }
    return { level: inPoly ? '주의' : '안전', area: fl.label }
  }
  return null   // 커버리지 밖 = 데이터없음
}

/* ---------------- 화재 발생 시군구 행정구역 경계(빨간 점선용) ---------------- */
// 전국 시군구 경계 GeoJSON(단순화) → 화재가 발생한 구/시/군만 매칭해 inline emit
let SGG_FEATS = []
try {
  const sg = JSON.parse(readFileSync(DIR + '/skorea_sgg.geojson', 'utf8'))
  SGG_FEATS = sg.features.map(ft => {
    let minLng = 999, minLat = 999, maxLng = -999, maxLat = -999
    const scan = (c) => { if (typeof c[0] === 'number') { const [x, y] = c; if (x < minLng) minLng = x; if (x > maxLng) maxLng = x; if (y < minLat) minLat = y; if (y > maxLat) maxLat = y } else c.forEach(scan) }
    scan(ft.geometry.coordinates)
    return { name: (ft.properties.name || '').trim(), code: ft.properties.code || '', geometry: ft.geometry,
      bbox: [+minLng.toFixed(5), +minLat.toFixed(5), +maxLng.toFixed(5), +maxLat.toFixed(5)], cx: (minLng + maxLng) / 2, cy: (minLat + maxLat) / 2 }
  })
} catch (e) { console.log('시군구 경계 GeoJSON 없음 — 화재 행정구역 레이어 0 (', e.message, ')') }

// 화재 region 문자열 → 구/시/군 이름 (동 등은 소량 보정)
const DONG2SGG = [[/도곡|압구정/, '강남구'], [/서소문/, '중구'], [/종로/, '종로구'], [/상인동/, '달서구'], [/학동/, '동구'], [/대덕산업단지/, '대덕구'], [/센텀/, '해운대구'], [/부평/, '부평구']]
function admNameOf(f) {
  const toks = (f.sigungu || '').trim().split(/\s+/)
  for (let i = 1; i < toks.length; i++) { const tk = toks[i].replace(/[(),/].*$/, ''); if (/(구|시|군)$/.test(tk)) return tk }
  for (const [re, nm] of DONG2SGG) if (re.test(f.sigungu || '')) return nm
  return ''
}
// 동명이(同名異) 시군구는 화재 좌표(시도 centroid)에 가장 가까운 경계로 보정
function findSgg(name, lat, lng) {
  const cands = SGG_FEATS.filter(ft => ft.name === name)
  if (!cands.length) return null
  if (cands.length === 1) return cands[0]
  let best = cands[0], bd = Infinity
  for (const ft of cands) { const d = (ft.cy - lat) ** 2 + (ft.cx - lng) ** 2; if (d < bd) { bd = d; best = ft } }
  return best
}
const fireRegMap = new Map()
for (const f of firePoints) {
  if (f.type !== '화재' || f.lat == null) continue
  const nm = admNameOf(f); if (!nm) continue
  const ft = findSgg(nm, f.lat, f.lng); if (!ft) continue
  let r = fireRegMap.get(ft.code)
  if (!r) { r = { code: ft.code, name: ft.name, bbox: ft.bbox, geo: ft.geometry, count: 0, minDays: 9999, scale: '소형', fires: [] }; fireRegMap.set(ft.code, r) }
  r.count++; r.minDays = Math.min(r.minDays, f.days)
  if (f.scale === '대형' || (f.scale === '중형' && r.scale !== '대형')) r.scale = f.scale
  if (r.fires.length < 5) r.fires.push({ title: f.title, days: f.days, scale: f.scale, date: f.date })
}
const fireRegions = [...fireRegMap.values()]
console.log('fireRegions(화재 행정구역):', fireRegions.length, fireRegions.map(r => `${r.name}(${r.count})`).join(', '))

/* ---------------- 유지고_건축물대장 → List A ---------------- */
// 추가된 건축물대장: UTF-8 CSV, 일부 셀이 엑셀 ="..." 형식으로 이스케이프됨
const unescCell = (s) => { s = (s || '').toString().trim(); return s.startsWith('=') ? s.replace(/^=/, '').replace(/^"|"$/g, '').trim() : s }
const bLines = readUtf8(SRC + '/data_building_registry.csv').split(/\r?\n/).filter(Boolean)
const BH = splitCsvLine(bLines[0]).map(h => h.trim()); const bcol = n => BH.findIndex(h => h === n)
const BC = {
  상태: bcol('상태'), pk: bcol('건물 고유번호(관리대장PK)'), road: bcol('도로명 주소'), jibun: bcol('지번주소'),
  post: bcol('우편번호'), name: bcol('건물명'), 준공: bcol('준공연도'), 승인: bcol('사용승인일'), 연면적: bcol('연면적(㎡)'),
  지상: bcol('지상 층수'), 지하: bcol('지하 층수'), 용도: bcol('주용도'), 구조: bcol('구조'), 지사: bcol('지사명'),
  담당: bcol('1차담당자(전화)'), 담당명: bcol('1차담당자명'),
}
const brows = bLines.slice(1).map(l => splitCsvLine(l).map(unescCell))
// PRD 핵심 타깃 용도 (용도 적합도 가산)
const CORE_USE = ['업무시설', '공장', '창고시설', '물류창고', '판매시설', '자동차관련시설', '운수시설', '위험물저장및처리시설', '자원순환관련시설']
// 지역 중심 좌표(시도/주요 구·시) — 분포 지도용(대략) + 건물별 jitter
const GU_LL = {
  '서울특별시 종로구': [37.5735, 126.9788], '서울특별시 중구': [37.5636, 126.9979], '서울특별시 용산구': [37.5326, 126.9905],
  '서울특별시 성동구': [37.5634, 127.0369], '서울특별시 광진구': [37.5385, 127.0823], '서울특별시 동대문구': [37.5744, 127.0396],
  '서울특별시 중랑구': [37.6063, 127.0927], '서울특별시 성북구': [37.5894, 127.0167], '서울특별시 강북구': [37.6396, 127.0257],
  '서울특별시 도봉구': [37.6688, 127.0471], '서울특별시 노원구': [37.6542, 127.0568], '서울특별시 은평구': [37.6027, 126.9292],
  '서울특별시 서대문구': [37.5791, 126.9368], '서울특별시 마포구': [37.5663, 126.9019], '서울특별시 양천구': [37.5169, 126.8665],
  '서울특별시 강서구': [37.5509, 126.8495], '서울특별시 구로구': [37.4954, 126.8874], '서울특별시 금천구': [37.4569, 126.8954],
  '서울특별시 영등포구': [37.5264, 126.8963], '서울특별시 동작구': [37.5124, 126.9393], '서울특별시 관악구': [37.4784, 126.9516],
  '서울특별시 서초구': [37.4837, 127.0324], '서울특별시 강남구': [37.5172, 127.0473], '서울특별시 송파구': [37.5145, 127.1059],
  '서울특별시 강동구': [37.5301, 127.1238],
}
const SIDO_LL = {
  '서울특별시': [37.5663, 126.9779], '부산광역시': [35.1796, 129.0756], '대구광역시': [35.8714, 128.6014],
  '인천광역시': [37.4563, 126.7052], '광주광역시': [35.1595, 126.8526], '대전광역시': [36.3504, 127.3845],
  '울산광역시': [35.5384, 129.3114], '세종특별자치시': [36.48, 127.289], '경기도': [37.4138, 127.5183],
  '강원특별자치도': [37.8228, 128.1555], '강원도': [37.8228, 128.1555], '충청북도': [36.8, 127.7],
  '충청남도': [36.6, 126.8], '전북특별자치도': [35.82, 127.1], '전라북도': [35.82, 127.1], '전라남도': [34.9, 126.9],
  '경상북도': [36.3, 128.8], '경상남도': [35.3, 128.4], '제주특별자치도': [33.4996, 126.5312],
}
const fireBySido = {}; firePoints.forEach(f => { if (f.sido) (fireBySido[f.sido] = fireBySido[f.sido] || []).push(f) })
const SIDO_RE = { '서울': '서울특별시', '부산': '부산광역시', '대구': '대구광역시', '인천': '인천광역시', '광주': '광주광역시', '대전': '대전광역시', '울산': '울산광역시', '세종': '세종특별자치시', '경기': '경기도', '강원': '강원특별자치도', '충북': '충청북도', '충남': '충청남도', '전북': '전북특별자치도', '전남': '전라남도', '경북': '경상북도', '경남': '경상남도', '제주': '제주특별자치도' }

// 건축물대장 지사명 → 자료1(인력경비) 지사명 별칭 (같은 지역 통일)
const BRANCH_ALIAS = { '광주지사': '광주광역지사' }
const seenPk = new Map()
const listA = brows.filter(c => c[BC.pk] || c[BC.jibun]).map((c, i) => {
  const jibun = c[BC.jibun] || '', road = c[BC.road] || '', name = (c[BC.name] || '').trim() || `건물 ${i + 1}`
  const status = (c[BC.상태] || '').trim()
  const pk = (c[BC.pk] || '').trim()
  const { sido, gun, dong } = parseRegion(jibun)
  const sidoFull = SIDO_RE[sido] || sido
  const useRaw = (c[BC.용도] || '').trim()
  const gfa = +(c[BC.연면적] || 0) || null
  const floorsUp = +(c[BC.지상] || 0) || 0, floorsDn = +(c[BC.지하] || 0) || 0
  const approvalRaw = (c[BC.승인] || '').trim()
  const apprYear = approvalRaw.length >= 4 ? +approvalRaw.slice(0, 4) : null
  const apprDate = approvalRaw.length === 8 ? `${approvalRaw.slice(0, 4)}-${approvalRaw.slice(4, 6)}-${approvalRaw.slice(6, 8)}` : null
  const yrAgo = apprYear ? 2026 - apprYear : null
  const struct = c[BC.구조] || ''
  const owner = /단독주택|공동주택/.test(useRaw) ? '개인' : (/교육|종교|문화|노유자|의료/.test(useRaw) ? '법인·기관' : '법인')

  // ----- 점수 구성 (PRD 2026-06: 계약 1,204건 구간별 점수 합산, 만점 101→100 cap) -----
  // 1위(최다) 구간만 항목 만점, 2위부터 점수 간격을 크게 벌려 인플레이션 방지. 4개 항목 전부 1위라야 90점대.
  const noData = []
  // 규모 — 연면적 (만점 23): 3천~1만 23 / 1만~3만 17 / 1천~3천 13 / 1천 미만 10 / 3만↑ 7 / NO_DATA 0
  let sizeV = null, sizeBand = ''
  if (gfa) {
    if (gfa < 1000) { sizeV = 10; sizeBand = '1천㎡ 미만' }
    else if (gfa < 3000) { sizeV = 13; sizeBand = '1천~3천㎡' }
    else if (gfa < 10000) { sizeV = 23; sizeBand = '3천~1만㎡ · 최다구간' }
    else if (gfa < 30000) { sizeV = 17; sizeBand = '1만~3만㎡' }
    else { sizeV = 7; sizeBand = '3만㎡ 이상' }
  } else noData.push('연면적')
  // 용도 적합도 (만점 19): 핵심 19 / 중간 14 / 기타 7 / NO_DATA 0
  let useV = null, useBand = ''
  if (!useRaw) { noData.push('주용도') }
  else if (/업무시설|공장|창고|판매시설|자동차|운수/.test(useRaw)) { useV = 19; useBand = '핵심 타깃' }
  else if (/교육|연구|근린|문화|집회|운동|의료/.test(useRaw)) { useV = 14; useBand = '중간 타깃' }
  else { useV = 7; useBand = '기타' }
  // 복잡도 — 지상층수 (만점 22): 1~5층 22 / 6~10 11 / 11~20 7 / 21↑ 5
  let floorV = null, floorBand = ''
  if (floorsUp >= 1) {
    if (floorsUp <= 5) { floorV = 22; floorBand = '1~5층 · 최다구간' }
    else if (floorsUp <= 10) { floorV = 11; floorBand = '6~10층' }
    else if (floorsUp <= 20) { floorV = 7; floorBand = '11~20층' }
    else { floorV = 5; floorBand = '21층 이상' }
  } else noData.push('지상층수')
  // 복잡도 — 지하층 유무 (만점 11, 이분법): 있음 11 / 없음 0
  const basementV = floorsDn > 0 ? 11 : 0
  // 노후화 — 경과연수 (만점 26): 20년 미만 26 / 20~30 13 / 30~40 8 / 40↑ 4 / NO_DATA 0
  let ageV = null, ageBand = ''
  if (yrAgo != null) {
    if (yrAgo < 20) { ageV = 26; ageBand = '20년 미만 · 최다구간' }
    else if (yrAgo <= 30) { ageV = 13; ageBand = '20~30년' }
    else if (yrAgo <= 40) { ageV = 8; ageBand = '30~40년' }
    else { ageV = 4; ageBand = '40년 이상' }
  } else noData.push('사용승인일')

  const comps = [
    { k: '규모 — 연면적', v: sizeV, max: 23, note: gfa ? `${Math.round(gfa).toLocaleString()}㎡ · ${sizeBand}` : '연면적 데이터 없음' },
    { k: '용도 적합도', v: useV, max: 19, note: useRaw ? `${useRaw} · ${useBand}` : '주용도 데이터 없음' },
    { k: '복잡도 — 지상층수', v: floorV, max: 22, note: floorsUp >= 1 ? `지상 ${floorsUp}층 · ${floorBand}` : '지상층수 데이터 없음' },
    { k: '복잡도 — 지하층', v: basementV, max: 11, note: floorsDn > 0 ? `지하 ${floorsDn}층 보유` : '지하층 없음 · 0점' },
    { k: '노후화 — 경과연수', v: ageV, max: 26, note: yrAgo != null ? `${yrAgo}년 경과 · ${ageBand}` : '사용승인일 없음' },
  ]
  const base = comps.reduce((s, x) => s + (x.v || 0), 0)

  // 화재 가산점: 같은 시도 화재를 일부 건물에 인접 신호로 부여(데모)
  let nearFire = null, fireBonus = 0
  const sf = fireBySido[sido]
  if (sf && sf.length && i % 6 === 2) {
    const f = sf[i % sf.length]
    const dist = 300 + (i % 5) * 220
    nearFire = { dist, days: f.days, scale: f.scale, title: f.title, source: f.source, url: f.url }
    fireBonus = f.days < 30 ? 6 : f.days < 60 ? 4 : 2
  }
  // 지사: 지사명 직접 → 없으면 우편번호 → 주소 순 매칭
  let branch = (c[BC.지사] || '').trim()
  if (!branch) { branch = postByCode.get((c[BC.post] || '').trim()) || (branchOf(sido, gun, dong) || {}).branch || '미지정' }
  // 건축물대장 지사명 ↔ 자료1(인력경비) 지사명 정합 — 같은 지역이 두 리스트에 모두 잡히도록 통일
  branch = BRANCH_ALIAS[branch] || branch

  // 좌표: 구 → 시도 → 기본(서울)
  const [blat, blng] = GU_LL[`${sidoFull} ${gun}`] || SIDO_LL[sidoFull] || [37.5663, 126.9779]
  const jit = ((i * 37) % 100) / 100, jit2 = ((i * 53) % 100) / 100
  let bLat = +(blat + (jit - 0.5) * 0.05).toFixed(5), bLng = +(blng + (jit2 - 0.5) * 0.06).toFixed(5)

  // 침수 커버리지 시군구 건물은 실제 침수구역 샘플점에 배치 (약 1/3은 침수예상 안=안전)
  const floodCov = floodByGun[gun] || (/일산서구/.test(jibun) ? floodLayers.find(fl => /일산/.test(fl.label)) : null)
  if (floodCov) {
    const arr = (i % 3 !== 0 && floodCov.inside.length) ? floodCov.inside : floodCov.outside
    const pt = arr[(i * 7) % arr.length]
    if (pt) { bLng = pt[0]; bLat = pt[1] }
  }

  // 도시침수 판정 (영업 타이밍 신호로만 사용 — 점수에는 반영하지 않음)
  const flood = floodOf(bLng, bLat)
  const floodBonus = 0
  // 점수 = 건축물대장 속성(규모·용도·복잡도·노후화) 합산. 화재/침수는 점수에 가산하지 않는다.
  const score = Math.min(100, base)

  // 멸실·소멸 제외(R10) / 중복 차단(R11)
  const excluded = /멸실|소멸|철거|말소/.test(status)
  let duplicate = false, duplicateOf = ''
  if (pk) { if (seenPk.has(pk)) { duplicate = true; duplicateOf = seenPk.get(pk); } else seenPk.set(pk, name); }

  return {
    id: 'A' + (1000 + i), track: 'A', name, address: road || jibun, sido, sigungu: gun, gun, dong,
    branch, use: useRaw || '미상', owner,
    gfa, bldgArea: null, annex: null, parking: null,
    approvalDate: apprDate, approvalYrAgo: yrAgo, struct,
    comps, base, fireBonus, floodBonus, score, nearFire, flood, noData,
    lat: bLat, lng: bLng,
    excluded, excludeReason: excluded ? status : '', duplicate, duplicateOf,
    mgr: (c[BC.담당] || '').trim(), mgrName: (c[BC.담당명] || '').trim(),
  }
})

/* ---------------- 인력경비현황_전국_더미 → List B (전국 업셀링) ---------------- */
// 시군구 → 지사 매핑 (건축물대장 listA 기반) + 시도 fallback
const sggToBranchMap = {}, sidoToBranchMap = {}
for (const a of listA) {
  if (!a.branch || a.branch === '미지정' || a.excluded || a.duplicate) continue
  const kk = `${a.sido} ${a.gun}`
  ;(sggToBranchMap[kk] = sggToBranchMap[kk] || {})[a.branch] = (sggToBranchMap[kk][a.branch] || 0) + 1
  ;(sidoToBranchMap[a.sido] = sidoToBranchMap[a.sido] || {})[a.branch] = (sidoToBranchMap[a.sido][a.branch] || 0) + 1
}
const topKey = (o) => o ? Object.entries(o).sort((x, y) => y[1] - x[1])[0][0] : null
const branchForRegion = (sido, gun) => topKey(sggToBranchMap[`${sido} ${gun}`]) || topKey(sidoToBranchMap[sido]) || '미지정'

// 업셀링 파일엔 주소가 없어 지사(개시사업장) 대표 좌표/구로 배치 — List A 건축물 기반 집계
const brCentAcc = {}, brGunAcc = {}, brSidoAcc = {}
for (const a of listA) {
  if (a.excluded || a.duplicate || !a.branch || a.branch === '미지정') continue
  if (a.lat != null) (brCentAcc[a.branch] = brCentAcc[a.branch] || []).push([a.lat, a.lng])
  if (a.gun) (brGunAcc[a.branch] = brGunAcc[a.branch] || {})[a.gun] = (brGunAcc[a.branch][a.gun] || 0) + 1
  if (a.sido) (brSidoAcc[a.branch] = brSidoAcc[a.branch] || {})[a.sido] = (brSidoAcc[a.branch][a.sido] || 0) + 1
}
const branchCentroid = {}; for (const [b, arr] of Object.entries(brCentAcc)) branchCentroid[b] = [arr.reduce((s, p) => s + p[0], 0) / arr.length, arr.reduce((s, p) => s + p[1], 0) / arr.length]
const branchGun = {}; for (const [b, o] of Object.entries(brGunAcc)) branchGun[b] = topKey(o)
const branchSido = {}; for (const [b, o] of Object.entries(brSidoAcc)) branchSido[b] = topKey(o)
const TEAM_SIDO = [['서울', '서울'], ['경기', '경기'], ['부산', '부산'], ['부울', '부산'], ['대구', '대구'], ['대전', '대전'], ['광주', '광주'], ['호남', '전남'], ['충청', '충남'], ['강원', '강원']]
const teamSido = (team) => { for (const [k, v] of TEAM_SIDO) if ((team || '').includes(k)) return v; return '서울' }

// 사고뉴스(화재) — 같은 시군구 매칭 (공통 오버레이 타이밍 신호)
const fireForRegion = (sido, gun) => {
  if (!gun) return null
  for (const f of firePoints) { if (f.sido === sido && (f.sigungu || '').includes(gun)) return f }
  return null
}
// 계약일자(YYYY.MM.DD) + 계약기간(개월) 롤링 갱신 → 다가오는 만료일
const parseDot = (s) => { const m = (s || '').match(/(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})/); return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null }
const TODAY_D = new Date(TODAY)
const nextRenewal = (startStr, term) => {
  const s = parseDot(startStr); if (!s || !term) return null
  let k = Math.ceil((TODAY_D - s) / (term * 2629800000)); if (k < 1) k = 1
  const e = new Date(s.getTime()); e.setMonth(e.getMonth() + term * k); return e
}
const numKR = (s) => { const n = parseInt((s || '').toString().replace(/[^0-9.-]/g, ''), 10); return isNaN(n) ? 0 : n }
// 업종명 → 중요실(B-2) 추정
const roomOf = (ind) => {
  if (/학교|대학|학원|교육|연구/.test(ind)) return '서버실·전산실·서고'
  if (/병원|의료|요양|보건/.test(ind)) return '전산실·의료기계실'
  if (/공장|제조|산업|플랜트|철강|화학|전자/.test(ind)) return '기계실·전기실'
  if (/창고|물류|유통/.test(ind)) return '중요물품 보관창고'
  if (/관공서|공공|시청|구청|청사|관청/.test(ind)) return '전산실·통제실'
  if (/은행|금융|증권|보험/.test(ind)) return '전산실·금고'
  if (/통신|방송|데이터|전산|IDC/.test(ind)) return '서버실·통신실'
  return '전산실·기계실'
}

/* 업셀링 두 파일을 고객명 기준으로 병합 — manned=B-1(경비원), critical=B-2(중요실) */
const upByCust = new Map()
function loadUpsell(file, flag) {
  const lines = readCp949(file).split(/\r?\n/).filter(Boolean)
  const h = splitCsvLine(lines[0]).map(x => x.trim()); const ix = n => h.indexOf(n)
  const I = { name: ix('고객명'), contractNo: ix('계약번호'), branch: ix('개시사업장'), team: ix('팀/사업팀'), ind: ix('업종명'), product: ix('시스템 상품명'), service: ix('제공업무'), fee: ix('계약서비스료'), start: ix('계약일자'), term: ix('계약기간(개월)'), maintain: ix('유지개월'), repNo: ix('영업담당자 사번'), repName: ix('영업담당자명') }
  for (let i = 1; i < lines.length; i++) {
    const r = splitCsvLine(lines[i]); const name = (r[I.name] || '').trim(); if (!name) continue
    let o = upByCust.get(name); if (!o) { o = { name, b1: false, b2: false }; upByCust.set(name, o) }
    o[flag] = true
    o.contractNo = o.contractNo || (r[I.contractNo] || '').trim()
    o.branch = o.branch || normBranch((r[I.branch] || '').trim())
    o.team = o.team || (r[I.team] || '').trim()
    o.ind = o.ind || (r[I.ind] || '').trim()
    o.product = o.product || (r[I.product] || '').trim()
    if (!o.fee) { const f = numKR(r[I.fee]); if (f) o.fee = f }
    o.start = o.start || (r[I.start] || '').trim()
    o.term = o.term || numKR(r[I.term])
    o.maintain = o.maintain || numKR(r[I.maintain])
    o.repNo = o.repNo || (r[I.repNo] || '').trim()
    o.repName = o.repName || (r[I.repName] || '').trim()
  }
}
loadUpsell(SRC + '/upsell_manned_guard_status.csv', 'b1')
loadUpsell(SRC + '/upsell_critical_rooms.csv', 'b2')

const repsMap = new Map() // 업셀링 영업담당자(사번) → 컨설턴트 계정
const listB = [...upByCust.values()].map((o, i) => {
  const branch = o.branch || '미지정'
  const gun = branchGun[branch] || ''
  const sid = branchSido[branch] || teamSido(o.team)
  // 좌표 — 지사 건축물 중심 + jitter, 없으면 시도 중심
  let cc = branchCentroid[branch] || SIDO_LL[SIDO_RE[sid]] || [37.5663, 126.9779]
  const jb = ((i * 41) % 100) / 100, jb2 = ((i * 67) % 100) / 100
  const lat = +(cc[0] + (jb - 0.5) * 0.05).toFixed(5), lng = +(cc[1] + (jb2 - 0.5) * 0.06).toFixed(5)
  // 만료(롤링 갱신) — 계약일자 + 계약기간 주기
  const end = nextRenewal(o.start, o.term)
  const expiryDate = end ? `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}` : ''
  const expiryMonths = end ? Math.round((end - TODAY_D) / 2629800000) : null
  const expirySoon = expiryMonths != null && expiryMonths >= 0 && expiryMonths <= 6
  // B-1(경비원 운영) / B-2(중요실 보유) — 파일 소속으로 결정
  const b1 = o.b1, b2 = o.b2
  const room = b2 ? roomOf(o.ind) : null
  const btype = b1 && b2 ? 'both' : b1 ? 'b1' : b2 ? 'b2' : 'none'
  const matches = []
  if (b1) matches.push({ kw: '인력경비(경비원) 운영', w: 4, freq: 1, cat: 'B1', detail: `현 ${o.product || '유인경비'}` })
  if (b2) matches.push({ kw: room, w: 3, freq: 1, cat: 'B2', detail: `${o.ind || '중요실'} · 중요실 보유` })
  const matchCount = matches.length
  const matchWeight = (b1 ? 4 : 0) + (b2 ? 3 : 0) + (btype === 'both' ? 3 : 0)
  // 사고뉴스
  const nf = fireForRegion(sid, gun)
  const nearFire = nf ? { days: nf.days, scale: nf.scale, title: nf.title, source: nf.source, url: nf.url, region: nf.sigungu } : null
  // 계정(영업담당자)
  if (o.repNo && o.repName && !repsMap.has(o.repNo)) repsMap.set(o.repNo, { empno: o.repNo, name: o.repName, branch, role: 'consultant' })
  return {
    id: 'B' + (2000 + i), track: 'B', name: o.name, contractNo: o.contractNo || '', ind: o.ind || '기타', branch,
    address: `${branch}${gun ? ' · ' + gun : ''}`, sido: sid, sigungu: gun, gun, dong: '',
    currentProduct: o.product || '-', contractMonths: o.maintain || 0, monthlyFee: o.fee || null, people: null,
    expiryDate, expiryMonths, expirySoon,
    b1, b2, btype, room, nearFire,
    matches, matchCount, matchWeight, lat, lng,
  }
})

/* ---------------- 계정 ---------------- */
const accounts = []
const seenEmp = new Set()
const pushAcc = (a) => { if (!a.empno || seenEmp.has(a.empno)) return; seenEmp.add(a.empno); accounts.push(a) }

// 1) 업셀링 영업담당자 (upsell B-1/B-2 → List B 지사 컨설턴트)
for (const r of repsMap.values()) if (r.empno && r.name) pushAcc({ empno: r.empno, name: r.name, branch: r.branch, role: 'consultant' })

// 2) List A 지사 담당자 (유지고_건축물대장 1차담당자) — 지사별 1명
const aRepByBranch = new Map()
for (const a of listA) {
  if (!a.branch || a.branch === '미지정' || a.excluded || a.duplicate || !a.mgr) continue
  if (!aRepByBranch.has(a.branch)) aRepByBranch.set(a.branch, { empno: a.mgr, name: a.mgrName || (a.branch + ' 담당'), branch: a.branch, role: 'consultant' })
}
for (const r of aRepByBranch.values()) pushAcc(r)

// 3) admin
pushAcc({ empno: 'admin', name: '박팀장', branch: '', role: 'admin' })

// 대표 계정(로그인 빠른선택) — admin + List B 지사(고객 데이터) + List A 상위 지사
const aCount = {}
listA.forEach(a => { if (a.branch && a.branch !== '미지정' && !a.excluded && !a.duplicate) aCount[a.branch] = (aCount[a.branch] || 0) + 1 })
const topA = Object.entries(aCount).sort((x, y) => y[1] - x[1]).slice(0, 5).map(e => e[0])
const bBranches = [...new Set(listB.filter(b => b.matchCount > 0).map(b => b.branch))]
const featured = []
const adminAcc = accounts.find(a => a.role === 'admin'); if (adminAcc) featured.push(adminAcc)
for (const b of [...bBranches, ...topA]) { const a = accounts.find(x => x.branch === b && x.role === 'consultant'); if (a && !featured.includes(a)) featured.push(a) }

// 발표·시연용 추천 계정: 데이터(신규후보+업셀링)가 가장 많은 영업사원 + 관리자
const countByBranch = {}
listA.forEach(a => { if (a.branch && a.branch !== '미지정' && !a.excluded && !a.duplicate) { (countByBranch[a.branch] = countByBranch[a.branch] || { a: 0, b: 0 }).a++ } })
listB.forEach(b => { if (b.branch) { (countByBranch[b.branch] = countByBranch[b.branch] || { a: 0, b: 0 }).b++ } })
// 발표·시연용 추천 계정: 서강지사(마포 침수+양쪽 리스트+만료 알림 시연) 고정, 없으면 데이터 최다 자동
const repOf = (acc) => { const c = countByBranch[acc.branch] || { a: 0, b: 0 }; return { empno: acc.empno, name: acc.name, branch: acc.branch, countA: c.a, countB: c.b, total: c.a + c.b }; }
const PREFERRED_DEMO_EMPNO = '0232931336' // 서강지사
let bestRep = null, bestBoth = null
for (const acc of accounts) {
  if (acc.role !== 'consultant' || !acc.branch || acc.branch === '미지정') continue
  const rep = repOf(acc)
  if (!bestRep || rep.total > bestRep.total) bestRep = rep
  if (rep.countA > 0 && rep.countB > 0 && (!bestBoth || rep.total > bestBoth.total)) bestBoth = rep
}
const preferredAcc = accounts.find(a => a.role === 'consultant' && String(a.empno) === PREFERRED_DEMO_EMPNO)
const demoRep = preferredAcc ? repOf(preferredAcc) : (bestBoth || bestRep)
const demo = { consultant: demoRep, admin: adminAcc ? { empno: adminAcc.empno, name: adminAcc.name } : null, password: '1234' }

const APPDATA = {
  generated: TODAY,
  region: { focus: [...new Set([...listA, ...listB].map(c => ({ sido: c.sido, sigungu: c.gun })).map(JSON.stringify))].map(JSON.parse) },
  firePoints,
  fireRegions,
  floodLayers: floodLayers.map(({ label, path, bbox, geo }) => ({ label, path, bbox, geo })),
  listA,
  listB,
  branches: {
    A: [...new Set(listA.map(a => a.branch))],
    B: [...new Set(listB.map(b => b.branch))],
  },
}

const out = `/* AUTO-GENERATED by scripts/build-data.mjs from 첨부 실데이터 — do not edit by hand */
window.APPDATA = ${JSON.stringify(APPDATA)};
window.APP_ACCOUNTS = ${JSON.stringify(accounts)};
window.APP_ACCOUNTS_FEATURED = ${JSON.stringify(featured)};
window.APP_DEMO = ${JSON.stringify(demo)};
window.APP_LOGIN_HINT = { password: "1234" };
`
writeFileSync(OUT, out)
// 모듈 버전 (단일 HTML 빌드용 — import 시 side-effect로 window.APPDATA 등 설정)
try { writeFileSync('C:/Users/User/Desktop/260610 프로젝트/app/src/appData.generated.js', '/* AUTO-GENERATED — single-file build data module */\n' + out) } catch (e) { console.log('appData 모듈 쓰기 실패:', e.message) }

// index.html의 appdata 스크립트에 캐시버스팅 버전 부여 (데이터 변경 시 브라우저 캐시 무효화)
try {
  const idxPath = 'C:/Users/User/Desktop/260610 프로젝트/app/index.html'
  const v = Date.now()
  let html = readFileSync(idxPath, 'utf8')
  html = html.replace(/\/data\/appdata\.js(\?v=\d+)?/g, `/data/appdata.js?v=${v}`)
  writeFileSync(idxPath, html)
  console.log('index.html appdata 버전 갱신: ?v=' + v)
} catch (e) { console.log('index.html 버전 갱신 실패:', e.message) }

console.log('listA:', listA.length, ' listB:', listB.length, ' firePoints:', firePoints.length)
console.log('listA branches:', APPDATA.branches.A)
console.log('listB branches:', APPDATA.branches.B)
console.log('accounts:', accounts.length, ' (호남 reps + 수도권 + admin)')
console.log('featured:', featured.map(f => `${f.empno}/${f.name}/${f.branch || 'ADMIN'}`))
console.log('listA NO_DATA 건수:', listA.filter(a => a.noData.length).length, ' nearFire:', listA.filter(a => a.nearFire).length)
console.log('listB 키워드발견(방문대상):', listB.filter(b => b.matchCount > 0).length, ' NO_DATA(키워드미추출):', listB.filter(b => b.matchCount === 0).length)
console.log('OUT bytes:', out.length)
