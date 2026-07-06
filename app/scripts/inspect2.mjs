import * as XLSX from 'xlsx'
import { readFileSync } from 'node:fs'
const DIR = 'C:/Users/User/Desktop/26.6.9-12/빌더작업/데이터'
const wb3 = XLSX.read(readFileSync(DIR + '/자료 3. 타겟빌딩_샘플 데이터.xls'), { type: 'buffer' })

function rows(wb, sn) { return XLSX.utils.sheet_to_json(wb.Sheets[sn], { header: 1, blankrows: false }) }

console.log('### 자료3 통합_빌딩 — first 6 NON-empty data rows')
const ub = rows(wb3, '통합_빌딩')
const dataUb = ub.slice(1).filter(r => r[4] || r[1])
console.log('non-empty building rows:', dataUb.length)
dataUb.slice(0, 6).forEach(r => console.log(JSON.stringify(r)))

console.log('\n### 자료3 건축물대장 — first 4 non-empty')
const bd = rows(wb3, '건축물대장')
console.log('header:', JSON.stringify(bd[0]))
bd.slice(1).filter(r => r[2] || r[4]).slice(0, 4).forEach(r => console.log(JSON.stringify(r)))

console.log('\n### 자료3 소유자_영업 — first 4 non-empty')
const so = rows(wb3, '소유자_영업')
console.log('header:', JSON.stringify(so[0]))
so.slice(1).filter(r => r[1]).slice(0, 4).forEach(r => console.log(JSON.stringify(r)))

console.log('\n### 자료3 소방점검화재 — first 4 non-empty')
const sf = rows(wb3, '소방점검화재')
sf.slice(1).filter(r => r[1]).slice(0, 4).forEach(r => console.log(JSON.stringify(r)))

console.log('\n### 자료3 통합_빌딩 distinct 시도/구군/읍면동')
const reg = {}
dataUb.forEach(r => { const k = [r[1], r[2], r[3]].join(' / '); reg[k] = (reg[k] || 0) + 1 })
console.log(JSON.stringify(reg, null, 0))

// 자료1 customers
const wb1 = XLSX.read(readFileSync(DIR + '/자료 1. 인력경비 현황.xlsx'), { type: 'buffer' })
const list = XLSX.utils.sheet_to_json(wb1.Sheets['리스트'], { header: 1, blankrows: false })
const H = list[0]
const col = (name) => H.findIndex(h => String(h).trim() === name)
const ci = { 지사: col('지사'), 주소: col('주소'), 사번: col('영업담당자 사번'), 명: col('영업담당자명'), 업종: col('업종'), 그로스: col('그로스'), 유지: col('유지개월'), 상품: col('시스템 상품명'), 고객명: col('고객명'), 서비스료: col('계약서비스료') }
console.log('\n### 자료1 리스트 col idx:', JSON.stringify(ci))
const body = list.slice(1).filter(r => r[ci.지사])
console.log('customer rows:', body.length)
const branches = {}
body.forEach(r => { const b = r[ci.지사]; branches[b] = (branches[b] || 0) + 1 })
console.log('지사별 건수:', JSON.stringify(branches, null, 0))
const reps = {}
body.forEach(r => { const k = r[ci.사번] + '|' + r[ci.명] + '|' + r[ci.지사]; reps[k] = (reps[k] || 0) + 1 })
console.log('영업담당자(사번|명|지사) 상위:', JSON.stringify(Object.entries(reps).slice(0, 20), null, 0))
