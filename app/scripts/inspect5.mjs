import { readFileSync } from 'node:fs'
const DIR = 'C:/Users/User/Desktop/26.6.9-12/빌더작업/데이터'
const txt = new TextDecoder('euc-kr').decode(readFileSync(DIR + '/유지고_건축물대장_20260610.csv'))
const lines = txt.split(/\r?\n/).filter(Boolean)
const H = lines[0].split('\t')
console.log('cols:', H.length); H.forEach((h, i) => console.log('  [' + i + ']', h))
const rows = lines.slice(1).map(l => l.split('\t'))
console.log('\nrows:', rows.length)
const col = n => H.findIndex(h => h.trim() === n)
const ci = { 상태: col('상태'), 지번: col('지번주소'), 용도: col('주용도'), 지사: col('지사명'), 담당: col('1차담당자(전화)'), 담당명: col('1차담당자명'), 우편: col('우편번호'), pk: col('건물 고유번호(관리대장PK)') }
console.log('idx:', JSON.stringify(ci))
const dist = (idx) => { const o = {}; rows.forEach(r => { const v = (r[idx] || '').trim() || '(빈)'; o[v] = (o[v] || 0) + 1 }); return o }
console.log('\n상태:', JSON.stringify(dist(ci.상태)))
console.log('\n지사명:', JSON.stringify(dist(ci.지사)))
console.log('\n주용도:', JSON.stringify(dist(ci.용도)))
// 구 분포 (지번주소 2번째 토큰)
const guSet = {}
rows.forEach(r => { const t = (r[ci.지번] || '').split(/\s+/); const gu = [t[0], t[1]].join(' '); guSet[gu] = (guSet[gu] || 0) + 1 })
console.log('\n시도+구(상위 25):', JSON.stringify(Object.entries(guSet).sort((a, b) => b[1] - a[1]).slice(0, 25)))
// PK 중복
const pkc = {}; rows.forEach(r => { pkc[r[ci.pk]] = (pkc[r[ci.pk]] || 0) + 1 })
console.log('\nPK 중복 건수:', Object.values(pkc).filter(v => v > 1).length)
console.log('\n담당자 샘플(지사/명/전화):', rows.slice(0, 3).map(r => [r[ci.지사], r[ci.담당명], r[ci.담당]]))
