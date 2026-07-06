/* ===== monthlyReport.js — 유지고객 월간 리포트 초안 자동 생성 (테마 B, R23) =====
 * PRD 원칙: AI는 초안까지만 만들고, 사람이 검토·수정 후 승인해서 발송한다.
 * 이 파일은 "초안 생성"까지만 다룬다 — 실제 발송(이메일/카카오 등)은 하지 않는다.
 *
 * 리포트 구성:
 *   1) 신호 발생 이력   — 고객의 signalHistory 그대로(실데이터)
 *   2) 원격제어 이력     — 고객의 remoteControlLog 그대로(실데이터)
 *   3) 최근 인근 사건사고 — (a) fireDispatch.demo.js liveItems 중 같은 시군구, (b) 인근 다른
 *      계약처들의 최근 신호 — 계약처명·정확한 주소는 숨기고 동(洞) 단위까지만 노출(익명화)
 *   4) 시즌별 준비사항   — season.js 시즌 정의 기반 안내 문구(고정 템플릿)
 */
import { buildFireDispatchDemo } from './fireDispatch.demo.js'

const SEASON_TIP = {
  flood: '장마철을 앞두고 배수설비·펌프실·지하 전기실 점검을 권장드립니다.',
  winter: '동파 방지를 위해 배관·소화설비 사전 점검을 권장드립니다.',
  normal: '특별히 안내드릴 시즌 이슈는 없습니다.',
};

// 인근 다른 계약처의 신호를 익명화(계약처명·정확 주소 제외, 동 단위만) 해서 몇 건 뽑는다
function buildAnonymizedNearbySignals(c, allCustomers) {
  return (allCustomers || [])
    .filter(o => o.id !== c.id && o.sigungu === c.sigungu)
    .flatMap(o => o.signalHistory.map(s => ({ ...s, dong: o.dong, sameDong: o.dong === c.dong })))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 4);
}

function nearbyFireItems(c) {
  const fireStats = buildFireDispatchDemo();
  return (fireStats.liveItems || []).filter(f => f.loc.includes(c.sigungu)).slice(0, 3);
}

// 화면 미리보기·PDF 캡처에 함께 쓰는 구조화 데이터
export function buildMonthlyReportData(c, seasonKey, allCustomers) {
  const now = new Date();
  return {
    monthLabel: `${now.getFullYear()}년 ${now.getMonth() + 1}월`,
    customerName: c.name,
    consultant: c.assignedConsultant,
    signalHistory: c.signalHistory,
    remoteControlLog: c.remoteControlLog,
    nearbyFire: nearbyFireItems(c),
    nearbySignals: buildAnonymizedNearbySignals(c, allCustomers),
    seasonTip: SEASON_TIP[seasonKey] || SEASON_TIP.normal,
  };
}

// 화면에 안 띄우고 텍스트만 필요할 때(예: 로그, 대체 텍스트)를 위한 요약본
export function buildMonthlyReportDraft(c, seasonKey, allCustomers) {
  const d = buildMonthlyReportData(c, seasonKey, allCustomers);
  const signalLines = d.signalHistory.length
    ? d.signalHistory.map(s => `- ${s.date} ${s.type} (${s.severity})${s.notifiedAuthority ? ' · 유관기관 통보' : ''}`).join('\n')
    : '- 이번 달 특이 신호가 없었습니다. 안정적으로 운영되고 있습니다.';
  const remoteLines = d.remoteControlLog.length
    ? d.remoteControlLog.map(r => `- ${r.date} ${r.device} ${r.action}`).join('\n')
    : '- 최근 30일 원격제어 사용 이력이 없습니다.';
  const nearbyFireLines = d.nearbyFire.length
    ? d.nearbyFire.map(f => `- ${f.time} ${f.loc} ${f.type}(${f.scale})`).join('\n')
    : '- 최근 인근 사건사고 소식이 없습니다.';
  const nearbySignalLines = d.nearbySignals.length
    ? d.nearbySignals.map(s => `- ${s.date} 인근(${s.dong}) 사업장에서 ${s.type}(${s.severity}) 신호가 있었습니다.`).join('\n')
    : '- 인근 계약처의 특이 신호 공유 내역이 없습니다.';

  return `[${d.customerName}] ${d.monthLabel} 유지관리 리포트 (초안)

1. 이번 달 신호 내역
${signalLines}

2. 원격제어 이용 이력
${remoteLines}

3. 최근 인근 사건사고
${nearbyFireLines}
${nearbySignalLines}

4. 시즌별 준비사항
- ${d.seasonTip}

문의사항은 담당 컨설턴트 ${d.consultant}에게 연락 주세요.
(본 리포트는 AI가 자동 생성한 초안입니다. 발송 전 담당자 검토가 필요합니다.)`;
}
