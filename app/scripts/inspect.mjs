import * as XLSX from 'xlsx'
import { readFileSync } from 'node:fs'

const DIR = 'C:/Users/User/Desktop/26.6.9-12/빌더작업/데이터'

function dumpExcel(name) {
  console.log('\n========== ' + name + ' ==========')
  const wb = XLSX.read(readFileSync(DIR + '/' + name), { type: 'buffer' })
  for (const sn of wb.SheetNames) {
    const ws = wb.Sheets[sn]
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, blankrows: false })
    console.log(`-- sheet "${sn}" : ${rows.length} rows`)
    rows.slice(0, 4).forEach((r, i) => console.log(`  [${i}]`, JSON.stringify(r)))
  }
}

function dumpCp949Csv(name, sep = '\t') {
  console.log('\n========== ' + name + ' (cp949) ==========')
  const buf = readFileSync(DIR + '/' + name)
  const txt = new TextDecoder('euc-kr').decode(buf)
  const lines = txt.split(/\r?\n/).filter(Boolean)
  console.log('rows:', lines.length)
  lines.slice(0, 3).forEach((l, i) => console.log(`  [${i}]`, JSON.stringify(l.split(sep))))
}

try { dumpExcel('자료 3. 타겟빌딩_샘플 데이터.xls') } catch (e) { console.log('ERR xls3', e.message) }
try { dumpExcel('자료 1. 인력경비 현황.xlsx') } catch (e) { console.log('ERR xlsx1', e.message) }
try { dumpExcel('자료 2. 인력경비 연락망.XLSX') } catch (e) { console.log('ERR xlsx2', e.message) }
try { dumpCp949Csv('건축물대장_조회_20260610.csv') } catch (e) { console.log('ERR bldg', e.message) }
