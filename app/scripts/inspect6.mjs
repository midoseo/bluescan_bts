import * as XLSX from 'xlsx'
import { readFileSync } from 'node:fs'
const DIR = 'C:/Users/User/Desktop/26.6.9-12/빌더작업/데이터'
const wb = XLSX.read(readFileSync(DIR + '/인력경비현황_전국_더미.xlsx'), { type: 'buffer' })
console.log('sheets:', wb.SheetNames.join(', '))
for (const sn of wb.SheetNames) {
  const r = XLSX.utils.sheet_to_json(wb.Sheets[sn], { header: 1, blankrows: false })
  console.log(`\n== "${sn}" ${r.length} rows ==`)
  console.log('header:', JSON.stringify(r[0]))
  r.slice(1, 3).forEach(x => console.log('  ', JSON.stringify(x)))
}
// 지사/업종/운영상황 분포 (리스트 시트 추정)
const main = wb.SheetNames.find(s => /리스트|현황|sheet1/i.test(s)) || wb.SheetNames[0]
const L = XLSX.utils.sheet_to_json(wb.Sheets[main], { header: 1, blankrows: false })
const H = L[0]; const col = n => H.findIndex(h => String(h).trim() === n)
const ci = { 지사: col('지사'), 업종: col('업종'), 주소: col('주소'), 운영: col('인경비 운영 상황'), 사번: col('영업담당자 사번'), 명: col('영업담당자명'), 고객: col('고객명') }
console.log('\n리스트 col idx:', JSON.stringify(ci))
const body = L.slice(1).filter(r => r[ci.지사])
console.log('rows:', body.length)
const dist = i => { const o = {}; body.forEach(r => { const v = (r[i] ?? '').toString().trim() || '(빈)'; o[v] = (o[v] || 0) + 1 }); return o }
const br = dist(ci.지사)
console.log('지사 수:', Object.keys(br).length)
console.log('지사 분포(상위 30):', JSON.stringify(Object.entries(br).sort((a, b) => b[1] - a[1]).slice(0, 30)))
console.log('운영상황:', JSON.stringify(dist(ci.운영)))
