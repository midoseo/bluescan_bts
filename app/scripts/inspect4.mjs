import * as XLSX from 'xlsx'
import { readFileSync } from 'node:fs'
const DIR = 'C:/Users/User/Desktop/26.6.9-12/빌더작업/데이터'

// 건축물대장 CSV (cp949, tab)
const bld = new TextDecoder('euc-kr').decode(readFileSync(DIR + '/건축물대장_조회_20260610.csv'))
const blines = bld.split(/\r?\n/).filter(Boolean)
const bh = blines[0].split('\t')
const brows = blines.slice(1).map(l => l.split('\t'))
console.log('건축물대장 rows:', brows.length)
const guSet = {}, dongSet = {}, useSet = {}
let yMin = 99999999, yMax = 0
brows.forEach(c => {
  const jibun = c[2] || '' // 지번주소
  const m = jibun.match(/^(\S+)\s+(\S+구|\S+군|\S+시)\s+(\S+동|\S+가|\S+리)/)
  const gu = m ? m[2] : '?'; const dong = m ? m[3] : '?'
  guSet[gu] = (guSet[gu] || 0) + 1; dongSet[dong] = (dongSet[dong] || 0) + 1
  useSet[c[9]] = (useSet[c[9]] || 0) + 1
  const ad = +(c[5] || 0); if (ad) { yMin = Math.min(yMin, ad); yMax = Math.max(yMax, ad) }
})
console.log('구:', JSON.stringify(guSet))
console.log('동:', JSON.stringify(dongSet))
console.log('주용도:', JSON.stringify(useSet))
console.log('사용승인 범위:', yMin, '~', yMax)
console.log('샘플 지번주소 5:', brows.slice(0, 5).map(c => c[2]))

// 자료1 distinct categorical
const wb1 = XLSX.read(readFileSync(DIR + '/자료 1. 인력경비 현황.xlsx'), { type: 'buffer' })
const list = XLSX.utils.sheet_to_json(wb1.Sheets['리스트'], { header: 1, blankrows: false })
const H = list[0]; const col = n => H.findIndex(h => String(h).trim() === n)
const ci = { 지사: col('지사'), 업종: col('업종'), 그로스: col('그로스'), 주소: col('주소'), 운영: col('인경비 운영 상황'), 채용: H.findIndex(h => String(h).includes('채용구분')), 추진: col('추진(제안)현황'), 확도: col('확도'), 계약: col('계약여부'), 유지: col('유지개월'), 서비스료: col('계약서비스료'), 상품: col('시스템 상품명'), 고객: col('고객명') }
console.log('\n자료1 col idx:', JSON.stringify(ci))
const body = list.slice(1).filter(r => r[ci.지사])
const dist = (k) => { const o = {}; body.forEach(r => { const v = (r[ci[k]] ?? '').toString().trim() || '(빈값)'; o[v] = (o[v] || 0) + 1 }); return o }
console.log('업종:', JSON.stringify(dist('업종')))
console.log('그로스:', JSON.stringify(dist('그로스')))
console.log('운영상황:', JSON.stringify(dist('운영')))
console.log('채용:', JSON.stringify(dist('채용')))
console.log('추진현황:', JSON.stringify(dist('추진')))
console.log('확도:', JSON.stringify(dist('확도')))
console.log('계약여부:', JSON.stringify(dist('계약')))
console.log('상품(상위):', JSON.stringify(Object.entries(dist('상품')).sort((a,b)=>b[1]-a[1]).slice(0,8)))
console.log('주소 샘플 5:', body.slice(0,5).map(r=>r[ci.주소]))
