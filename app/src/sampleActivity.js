/* ===== sampleActivity.js — 영업활동관리 시연용 샘플 활동 로그 =====
 * previews/activity_log_preview.html 의 큐레이션 샘플을 그대로 반영.
 * 방문 결과(visit)/리포트 발송(report)/문자 발송(msg)을 시간순 타임라인으로.
 * status: won 수주완료 / done 방문완료 / revisit 재방문필요 / reject 거절
 */
export const SAMPLE_ACTIVITY = [
  { kind: 'visit', track: 'A 신규', name: '서울여자중학교 본관', date: '2026-07-08', time: '14:20', status: 'won', desc: '전산실 보유 확인. 블루스캔 듀얼 계약 체결 — 월 32만원 개시 예정. 경비원 2명 원격 전환 제안 수용.' },
  { kind: 'msg', track: '유지', name: '원이앤에스', date: '2026-07-08', time: '11:05', desc: '감성터칭 문자 발송 — "장마철 지하 집수정 점검 안내드립니다. 최근 누수 신호 관련 안심 케어 중이에요."' },
  { kind: 'report', track: '유지', name: '신한은행 (이대지점)', date: '2026-07-08', time: '09:40', desc: '2026년 6월 월간 유지관리 리포트 발송 — 신호 12건(경미 10·주의 2), 원격제어 0회, 계약 D-822.' },
  { kind: 'report', track: '유지', name: '국민은행 신촌지점', date: '2026-07-07', time: '15:22', desc: '2026년 6월 월간 유지관리 리포트 발송 — 특이 신호 없음, 안정 운영.' },
  { kind: 'msg', track: '유지', name: '듀델코리아', date: '2026-07-06', time: '17:45', desc: '감성터칭 문자 발송 — 신규 개시 축하 및 앱 사용법 안내.' },
  { kind: 'visit', track: 'B 기존(업셀)', name: '경성중고', date: '2026-07-06', time: '13:15', status: 'reject', desc: '현 알람 계약 만족, 원격 전환 보류. 사유 기록 — 예산 이슈. 6개월 후 재접촉 알림 설정.' },
  { kind: 'report', track: '유지', name: '인앤인주택관리 (공덕한화)', date: '2026-07-06', time: '09:10', desc: '2026년 6월 월간 유지관리 리포트 발송 — 집수정 고수위 신호 3건, 배수펌프 점검 권고 포함.' },
  { kind: 'msg', track: '유지', name: '홍콩상하이은행', date: '2026-07-05', time: '10:20', desc: '감성터칭 문자 발송 — 정기 안부 및 여름철 설비 점검 안내.' },
]

/* ===== 영업활동관리 ↔ 신규진행현황 연동 =====
 * SAMPLE_ACTIVITY의 방문(visit) 기록을 실제 후보(listA/listB)와 이름으로 매칭해
 * visits 초기값(단일 소스)에 주입한다. 이렇게 하면 경성중고 '거절'처럼 활동로그에만 있던
 * 방문 결과가 신규진행현황·확정·지도·게이미피케이션에 일관되게 반영된다.
 * 매칭되지 않는 유지고객 대상 활동은 그대로 활동로그 샘플로 남는다. */
function hashName(s) { let h = 0; s = String(s); for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return h; }

export function seedVisitsFromActivity(listA = [], listB = []) {
  const byName = new Map();
  [...(listA || []), ...(listB || [])].forEach(c => {
    if (c && c.name && !byName.has(c.name.trim())) byName.set(c.name.trim(), c);
  });
  const visits = {};
  SAMPLE_ACTIVITY.forEach(sa => {
    if (sa.kind !== 'visit' || !sa.status) return;
    const cand = byName.get((sa.name || '').trim());
    if (!cand) return;
    visits[cand.id] = {
      status: sa.status, memo: sa.desc, transcript: '', ai: null,
      date: sa.date, time: sa.time, fromActivity: true,
      logs: [{ id: 8000 + Math.abs(hashName(cand.id)), status: sa.status, date: `${sa.date} ${sa.time || ''}`.trim(), text: sa.desc }],
    };
  });
  return visits;
}

// 영업활동관리 화면에서 중복 표시를 막기 위한, 실제 후보와 매칭되는 방문 활동의 이름 집합
export function activityLinkedNames(listA = [], listB = []) {
  const names = new Set([...(listA || []), ...(listB || [])].map(c => c && c.name && c.name.trim()).filter(Boolean));
  const linked = new Set();
  SAMPLE_ACTIVITY.forEach(sa => { if (sa.kind === 'visit' && sa.status && names.has((sa.name || '').trim())) linked.add((sa.name || '').trim()); });
  return linked;
}
