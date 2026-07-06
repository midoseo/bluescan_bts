import * as XLSX from 'xlsx'
import { readFileSync } from 'node:fs'
const DIR = 'C:/Users/User/Desktop/26.6.9-12/빌더작업/데이터'
const SIDO_SHORT = { '서울특별시': '서울', '부산광역시': '부산', '대구광역시': '대구', '인천광역시': '인천', '광주광역시': '광주', '대전광역시': '대전', '울산광역시': '울산', '세종특별자치시': '세종', '경기도': '경기', '강원특별자치도': '강원', '강원도': '강원', '충청북도': '충북', '충청남도': '충남', '전북특별자치도': '전북', '전라북도': '전북', '전라남도': '전남', '경상북도': '경북', '경상남도': '경남', '제주특별자치도': '제주' }
const ss = s => SIDO_SHORT[s] || s

// 더미 인력경비
const wb = XLSX.read(readFileSync(DIR + '/인력경비현황_전국_더미.xlsx'), { type: 'buffer' })
const L = XLSX.utils.sheet_to_json(wb.Sheets['인력경비현황'], { header: 1, blankrows: false })
const H = L[0]; const col = n => H.findIndex(h => String(h).trim() === n)
const C = { 시도: col('시도'), 시군구: col('시군구'), 용도: col('용도'), 경비형태: col('경비형태'), 근무형태: col('근무형태'), 인원: col('배치인원(명)') }
const body = L.slice(1).filter(r => r[C.시도])
const dist = i => { const o = {}; body.forEach(r => { const v = (r[i] ?? '').toString().trim() || '(빈)'; o[v] = (o[v] || 0) + 1 }); return o }
console.log('경비형태:', JSON.stringify(dist(C.경비형태)))
console.log('근무형태:', JSON.stringify(dist(C.근무형태)))
console.log('용도(상위10):', JSON.stringify(Object.entries(dist(C.용도)).sort((a,b)=>b[1]-a[1]).slice(0,12)))
console.log('배치인원 범위:', Math.min(...body.map(r=>+r[C.인원]||0)), '~', Math.max(...body.map(r=>+r[C.인원]||0)))

// 건축물대장 시군구 → 지사 매핑 구축
const bld = new TextDecoder('euc-kr').decode(readFileSync(DIR + '/유지고_건축물대장_20260610.csv'))
const bl = bld.split(/\r?\n/).filter(Boolean); const BH = bl[0].split('\t')
const bc = n => BH.findIndex(h => h.trim() === n)
const bJibun = bc('지번주소'), bBranch = bc('지사명')
const sggToBranch = {}
bl.slice(1).map(l => l.split('\t')).forEach(c => {
  const toks = (c[bJibun] || '').split(/\s+/); const sido = ss(toks[0] || ''); const gun = (toks[1] && /(구|군|시)$/.test(toks[1])) ? toks[1] : ''
  const br = (c[bBranch] || '').trim()
  if (sido && gun && br) { const k = sido + ' ' + gun; const m = (sggToBranch[k] = sggToBranch[k] || {}); m[br] = (m[br] || 0) + 1 }
})
const resolve = k => { const m = sggToBranch[k]; if (!m) return null; return Object.entries(m).sort((a, b) => b[1] - a[1])[0][0] }
// 더미 고객의 시군구 매핑 커버리지
let mapped = 0, unmapped = 0; const unmapSet = {}
body.forEach(r => { const k = ss(r[C.시도]) + ' ' + r[C.시군구]; const br = resolve(k); if (br) mapped++; else { unmapped++; unmapSet[k] = (unmapSet[k] || 0) + 1 } })
console.log('\n시군구→지사 매핑: 성공', mapped, ' 실패', unmapped)
console.log('매핑 실패 시군구(상위15):', JSON.stringify(Object.entries(unmapSet).sort((a,b)=>b[1]-a[1]).slice(0,15)))
// 매핑된 지사 분포
const brDist = {}; body.forEach(r => { const br = resolve(ss(r[C.시도]) + ' ' + r[C.시군구]); if (br) brDist[br] = (brDist[br] || 0) + 1 })
console.log('업셀링 지사 수:', Object.keys(brDist).length, ' 상위:', JSON.stringify(Object.entries(brDist).sort((a,b)=>b[1]-a[1]).slice(0,12)))
