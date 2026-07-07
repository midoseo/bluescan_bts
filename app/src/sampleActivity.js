/* ===== sampleActivity.js — 영업활동관리 시연용 샘플 활동 로그 =====
 * previews/activity_log_preview.html 의 큐레이션 샘플을 그대로 반영.
 * 방문 결과(visit)/리포트 발송(report)/문자 발송(msg)을 시간순 타임라인으로.
 * status: won 수주완료 / done 방문완료 / revisit 재방문필요 / reject 거절
 */
export const SAMPLE_ACTIVITY = [
  { kind: 'visit', track: 'A 신규', name: '서울여자중학교 본관', date: '2026-07-08', time: '14:20', status: 'won', desc: '전산실 보유 확인. 블루스캔 듀얼 계약 체결 — 월 32만원 개시 예정. 경비원 2명 원격 전환 제안 수용.' },
  { kind: 'msg', track: '유지', name: '원이앤에스', date: '2026-07-08', time: '11:05', desc: '감성터칭 문자 발송 — "장마철 지하 집수정 점검 안내드립니다. 최근 누수 신호 관련 안심 케어 중이에요."' },
  { kind: 'report', track: '유지', name: '신한은행 (이대지점)', date: '2026-07-08', time: '09:40', desc: '2026년 6월 월간 유지관리 리포트 발송 — 신호 12건(경미 10·주의 2), 원격제어 0회, 계약 D-822.' },
  { kind: 'visit', track: 'B 기존(업셀)', name: '이화여자대학교 ECC관', date: '2026-07-07', time: '16:10', status: 'revisit', desc: '담당자 부재. 전산실 관제 니즈 확인 — 다음주 시설팀장 미팅 재예약.' },
  { kind: 'report', track: '유지', name: '국민은행 신촌지점', date: '2026-07-07', time: '15:22', desc: '2026년 6월 월간 유지관리 리포트 발송 — 특이 신호 없음, 안정 운영.' },
  { kind: 'visit', track: 'A 신규', name: '추계예술대학교', date: '2026-07-07', time: '10:30', status: 'done', desc: '노후 건축물·지하 기계실 보유. 침수 관제 제안서 전달, 검토 후 회신 예정.' },
  { kind: 'msg', track: '유지', name: '듀델코리아', date: '2026-07-06', time: '17:45', desc: '감성터칭 문자 발송 — 신규 개시 축하 및 앱 사용법 안내.' },
  { kind: 'visit', track: 'B 기존(업셀)', name: '경성중고', date: '2026-07-06', time: '13:15', status: 'reject', desc: '현 알람 계약 만족, 원격 전환 보류. 사유 기록 — 예산 이슈. 6개월 후 재접촉 알림 설정.' },
  { kind: 'report', track: '유지', name: '인앤인주택관리 (공덕한화)', date: '2026-07-06', time: '09:10', desc: '2026년 6월 월간 유지관리 리포트 발송 — 집수정 고수위 신호 3건, 배수펌프 점검 권고 포함.' },
  { kind: 'visit', track: 'A 신규', name: '농협생명보험 지하1층', date: '2026-07-05', time: '11:50', status: 'done', desc: '전산실 관제 관심. 견적 요청 접수.' },
  { kind: 'msg', track: '유지', name: '홍콩상하이은행', date: '2026-07-05', time: '10:20', desc: '감성터칭 문자 발송 — 정기 안부 및 여름철 설비 점검 안내.' },
  { kind: 'visit', track: 'B 기존(업셀)', name: '백상건설 회장실', date: '2026-07-05', time: '09:30', status: 'won', desc: '중요실(전산실) 블루스캔 도입 확정 — 월 18만원. 계약서 발송 완료.' },
]
