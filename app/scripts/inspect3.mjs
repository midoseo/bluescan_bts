import * as XLSX from 'xlsx'
import { readFileSync } from 'node:fs'
const DIR = 'C:/Users/User/Desktop/26.6.9-12/빌더작업/데이터'

// ---- POSTCODE coverage ----
const txt = new TextDecoder('utf-8').decode(readFileSync(DIR + '/POSTCODE_dummy.csv')).replace(/^﻿/, '')
const lines = txt.split(/\r?\n/).filter(Boolean)
const head = lines[0].split(',')
console.log('POSTCODE header:', JSON.stringify(head), 'rows:', lines.length - 1)
const idx = { post: 0, addr: 1, teamN: 3, bcode: 4, bname: 5, mgr: 6, mgrN: 7 }
const branchSet = {}, sidoSet = {}
const rowsP = lines.slice(1).map(l => l.split(','))
rowsP.forEach(c => {
  branchSet[c[idx.bname]] = (branchSet[c[idx.bname]] || 0) + 1
  const sido = (c[idx.addr] || '').split(' ')[0]
  sidoSet[sido] = (sidoSet[sido] || 0) + 1
})
console.log('\nbranch name 개수 (상위 40):')
console.log(Object.entries(branchSet).sort((a, b) => b[1] - a[1]).slice(0, 40).map(e => e[0] + ':' + e[1]).join(' | '))
console.log('\n시도(주소 첫토큰) 분포:')
console.log(Object.entries(sidoSet).sort((a, b) => b[1] - a[1]).map(e => e[0] + ':' + e[1]).join(' | '))

// branches containing 광주/전주/목포/익산/여수/군산/해남/순천
console.log('\n호남 관련 branch name:')
console.log([...new Set(rowsP.filter(c => /광주|전주|목포|익산|여수|군산|해남|순천/.test(c[idx.bname] || '')).map(c => c[idx.bname]))].join(' | '))

// sample postcode rows for 서울 중구 and 광주
console.log('\n서울 중구 순화동 매칭 예:')
rowsP.filter(c => /중구 순화동|중구 의주로|중구 통일로/.test(c[idx.addr] || '')).slice(0, 3).forEach(c => console.log(JSON.stringify(c)))
console.log('\n광주 북구 월출동 매칭 예:')
rowsP.filter(c => /광주.*북구.*월출|북구 월출/.test(c[idx.addr] || '')).slice(0, 3).forEach(c => console.log(JSON.stringify(c)))

// ---- 자료2 연락망 ----
const wb2 = XLSX.read(readFileSync(DIR + '/자료 2. 인력경비 연락망.XLSX'), { type: 'buffer' })
console.log('\n### 자료2 연락망 sheets:', wb2.SheetNames.join(', '))
for (const sn of wb2.SheetNames) {
  const r = XLSX.utils.sheet_to_json(wb2.Sheets[sn], { header: 1, blankrows: false })
  console.log(`-- "${sn}" ${r.length} rows; header:`, JSON.stringify(r[0]))
  r.slice(1, 4).forEach(x => console.log('   ', JSON.stringify(x)))
}
