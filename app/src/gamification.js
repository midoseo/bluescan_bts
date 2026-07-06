/* ===== gamification.js — 영업담당자 사용량 제고용 게이미피케이션 (엑셀 "B.T.S Quest" 아이디어 반영) =====
 * 원안(B.T.S Quest): 방문·컨설팅키트·쇼츠제작·수주·감성터칭 5단계 퀘스트 + 실시간 랭킹 + 기프티콘 보상.
 * AI가 할 것: 포인트 자동 집계, 퀘스트 달성 자동 감지, 랭킹 실시간 계산 — 이 파일이 담당한다.
 * 사람이 할 것: 포인트 배점·퀘스트 난이도·보상 예산/운영 — 아래 POINTS/QUEST_DEFS 숫자는 예시이며
 * 실제 배점은 영업 관리자가 검토·확정해야 한다(가중치를 임의로 자동 조정하지 않는다).
 *
 * 앱에 이미 있는 상태(visits, 유지고객 리포트/감성터칭 발송 여부)를 그대로 읽어 점수를 매기는
 * "파생 뷰"로 설계했다 — 게이미피케이션 전용 데이터베이스나 이벤트 로그를 새로 만들지 않는다.
 */

export const POINTS = {
  visitDone: 10,      // 방문완료 기록
  visitRevisit: 5,    // 재방문필요 기록
  visitReject: 5,     // 거절(사유 기록) — 거절도 자산화이므로 점수 부여
  visitWon: 50,       // 수주완료
  timingBonus: 10,    // 화재·침수 등 타이밍 신호가 있는 후보를 방문 처리하면 추가
  monthlyReport: 15,  // 유지고객 월간 리포트 승인발송
  empathyMessage: 10, // 유지고객 감성터칭 메시지 승인발송
  attentionBonus: 10, // 위 두 액션을 "주의 필요" 유지고객 대상으로 하면 추가
};

const VISIT_POINT_KEY = { done: 'visitDone', revisit: 'visitRevisit', reject: 'visitReject', won: 'visitWon' };
const VISIT_LABEL = { done: '방문완료', revisit: '재방문필요', reject: '거절', won: '수주완료' };

// Retention.jsx의 needsAttention()과 같은 규칙(스코어링 아님, 단순 신호 판정)을 이 모듈 안에서도 써야 해서
// 화면 코드에 의존하지 않도록 여기 한 번 더 둔다 — 로직을 바꿀 땐 두 곳 다 확인할 것.
function isAttentionCustomer(c) {
  const daysToEnd = Math.round((new Date(c.endDate) - new Date()) / 86400000);
  const hasSevereSignal = (c.signalHistory || []).some(s => s.severity === '심각');
  return daysToEnd <= 60 || hasSevereSignal || (c.unresolvedVOC || 0) > 0;
}

function hasTimingSignal(cand) {
  return !!(cand && (cand.nearFire || (cand.flood && cand.flood.level === '주의')));
}

function timingRespondedCount({ visits, listA, listB }) {
  const findCand = (id) => (listA || []).find(x => x.id === id) || (listB || []).find(x => x.id === id);
  return Object.keys(visits || {}).filter(id => hasTimingSignal(findCand(id))).length;
}

// 현재 세션 상태를 그대로 읽어 포인트·내역을 계산한다(누적 저장 없음 — 데모 세션 기준)
export function computeSessionPoints(ctx) {
  const { visits, listA, listB, reportSentOverrides, touchOverrides, retention } = ctx;
  const findCand = (id) => (listA || []).find(x => x.id === id) || (listB || []).find(x => x.id === id);
  const retById = new Map((retention || []).map(c => [c.id, c]));
  const breakdown = [];
  let total = 0;
  const add = (label, pts) => { if (!pts) return; total += pts; breakdown.push({ label, pts }); };

  Object.entries(visits || {}).forEach(([id, v]) => {
    const cand = findCand(id);
    const key = VISIT_POINT_KEY[v.status];
    if (!key) return;
    add(`방문 결과(${VISIT_LABEL[v.status]}) · ${cand ? cand.name : id}`, POINTS[key]);
    if (hasTimingSignal(cand)) add(`타이밍 신호 대응 보너스 · ${cand.name}`, POINTS.timingBonus);
  });

  Object.keys(reportSentOverrides || {}).forEach(id => {
    const c = retById.get(id);
    add(`월간 리포트 발송 · ${c ? c.name : id}`, POINTS.monthlyReport);
    if (c && isAttentionCustomer(c)) add(`주의고객 대응 보너스 · ${c.name}`, POINTS.attentionBonus);
  });
  Object.keys(touchOverrides || {}).forEach(id => {
    const c = retById.get(id);
    add(`감성터칭 메시지 발송 · ${c ? c.name : id}`, POINTS.empathyMessage);
    if (c && isAttentionCustomer(c)) add(`주의고객 대응 보너스 · ${c.name}`, POINTS.attentionBonus);
  });

  breakdown.sort((a, b) => b.pts - a.pts);
  return { total, breakdown };
}

// 주간 퀘스트 — 이번 데모 세션 동안의 활동 기준(실서비스 전환 시 "이번 주" 날짜 범위로 교체)
export const QUEST_DEFS = [
  { id: 'visit5', label: '방문 결과 5건 기록하기', icon: 'fact_check', target: 5, current: (ctx) => Object.keys(ctx.visits || {}).length },
  { id: 'timing3', label: '화재·침수 신호 후보 3곳 대응', icon: 'bolt', target: 3, current: (ctx) => timingRespondedCount(ctx) },
  { id: 'empathy2', label: '유지고객 감성터칭 2건 발송', icon: 'favorite', target: 2, current: (ctx) => Object.keys(ctx.touchOverrides || {}).length },
  { id: 'report1', label: '유지고객 월간 리포트 1건 발송', icon: 'description', target: 1, current: (ctx) => Object.keys(ctx.reportSentOverrides || {}).length },
];

export function questProgress(ctx) {
  return QUEST_DEFS.map(q => {
    const current = Math.min(q.current(ctx), q.target);
    return { ...q, current, done: current >= q.target };
  });
}

// 배지·업적
export const BADGE_DEFS = [
  { id: 'first_visit', label: '첫 방문 기록', icon: 'flag', unlocked: (ctx) => Object.keys(ctx.visits || {}).length >= 1 },
  { id: 'first_deal', label: '첫 계약 성공', icon: 'emoji_events', unlocked: (ctx) => Object.values(ctx.visits || {}).some(v => v.status === 'won') },
  { id: 'safety_guard', label: '안전 지킴이', icon: 'shield', unlocked: (ctx) => timingRespondedCount(ctx) >= 3 },
  { id: 'retention_hero', label: '리텐션 수호자', icon: 'volunteer_activism', unlocked: (ctx) => (Object.keys(ctx.touchOverrides || {}).length + Object.keys(ctx.reportSentOverrides || {}).length) >= 3 },
  { id: 'thorough_recorder', label: '완벽한 기록가', icon: 'edit_note', unlocked: (ctx) => { const r = Object.values(ctx.visits || {}).filter(v => v.status === 'reject'); return r.length > 0 && r.every(v => (v.memo || '').trim().length > 10); } },
  { id: 'quest_master', label: '퀘스트 마스터', icon: 'military_tech', unlocked: (ctx) => questProgress(ctx).every(q => q.done) },
];

export function badgeStatus(ctx) {
  return BADGE_DEFS.map(b => ({ ...b, unlocked: b.unlocked(ctx) }));
}

// 실시간 랭킹 — 로그인한 본인은 실제 세션 포인트(computeSessionPoints), 동료는 사번(empno) 기반
// 결정론적 시드 점수(기존 consultantPerf와 같은 패턴, 실데이터 아님)를 합쳐 정렬한다.
function seededPoints(empno) {
  let h = 0; const s = String(empno);
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return 80 + (Math.abs(h) % 260);
}

export function buildLeaderboard(consultants, myEmpno, myPoints) {
  const rows = (consultants || []).map(a => ({
    empno: a.empno, name: a.name, branch: a.branch,
    points: a.empno === myEmpno ? myPoints : seededPoints(a.empno),
    isMe: a.empno === myEmpno,
  }));
  if (myEmpno && !rows.some(r => r.isMe)) rows.push({ empno: myEmpno, name: '나', branch: '', points: myPoints, isMe: true });
  return rows.sort((a, b) => b.points - a.points);
}
