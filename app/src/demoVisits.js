/* ===== demoVisits.js — 시연용 방문 결과 시드 (서강지사 업셀링 3건) =====
   앱 시작 시 visits 초기값으로 사용. window.APPDATA 의 서강지사 업셀링 고객 중
   앞 3곳에 방문완료/재방문필요/거절을 임의로 넣어 지도 핀 색상·파이프라인·
   타임라인·배지 시연이 바로 보이도록 한다. (실데이터 아님 — 데모용)
*/
import { ymdDaysAgo, dateTimeDaysAgo } from './dateUtil.js'
export function buildDemoVisits() {
  const D = (typeof window !== 'undefined' && window.APPDATA) || {};
  const branch = '서강지사';
  const B = (D.listB || []).filter(c => c.branch === branch && c.matchCount > 0);
  const visits = {};
  let n = 0;
  const add = (c, status, text, daysAgo, hh, mm) => {
    if (!c) return;
    visits[c.id] = {
      status, memo: text, transcript: '', ai: null, date: ymdDaysAgo(daysAgo),
      logs: [{ id: 9000 + (n++), status, date: dateTimeDaysAgo(daysAgo, hh, mm), text }],
    };
  };
  add(B[0], 'done', '담당자 미팅 완료 — 야간 무인 서버실 관제에 관심. 다음 주 견적 제출 예정.', 5, 10, 20);
  add(B[1], 'revisit', '경비원 계약 만료 임박. 블루스캔 원격 전환 제안서 보완해 재방문 예정.', 3, 14, 5);
  add(B[2], 'reject', '금년도 예산 소진으로 보류. 차기 분기 재접촉 합의.', 2, 16, 40);
  return visits;
}
