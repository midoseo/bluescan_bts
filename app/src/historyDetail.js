/* ===== historyDetail.js — VOC·관제신호 이력 세부 내역 생성기 (데모) =====
 * 유지관리현황에서 VOC 이력/관제신호 이력을 "클릭 → 세부 조회"할 수 있도록,
 * 집계값(voc3y 카운트)·요약 신호(signalHistory)로부터 개별 내역을 결정론적으로 생성한다.
 * 실서비스 전환 시 이 생성기 대신 실제 CS/관제 로그를 그대로 사용한다.
 */
function hash(s) { let h = 0; s = String(s); for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); }
function ymdDaysAgo(days) { const d = new Date(); d.setDate(d.getDate() - days); const p = x => String(x).padStart(2, '0'); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`; }

const VOC_CATS = [
  { key: 'complaint', label: '불만', tone: 'danger' },
  { key: 'request', label: '요청', tone: 'warning' },
  { key: 'inquiry', label: '문의', tone: 'info' },
  { key: 'praise', label: '칭찬', tone: 'positive' },
];
const VOC_TEXT = {
  complaint: ['오경보가 잦다는 불만', '야간 알림 지연 관련 불만', '센서 오작동 관련 불만', '상담 응대 지연 불만', '원격제어 반응 지연 불만'],
  request: ['센서 추가 설치 요청', '월간 리포트 주기 조정 요청', '원격제어 권한 확대 요청', '정기 점검 일정 변경 요청', '보안 설정 변경 요청'],
  inquiry: ['요금·계약 조건 문의', '앱 사용법 문의', '신호 발생 원인 문의', '설비 교체 절차 문의', '계약 갱신 문의'],
  praise: ['신속 대응에 대한 감사', '정기 점검 서비스 만족', '담당 컨설턴트 응대 칭찬', '안심 케어 서비스 만족', '리포트 품질 칭찬'],
};

// VOC 개별 내역 — voc3y 카운트만큼 생성, 최근순 정렬
export function buildVocDetails(c) {
  if (!c || !c.voc3y) return [];
  const seed = hash(c.contractNo || c.id || c.name);
  const out = [];
  let n = 0;
  VOC_CATS.forEach(cat => {
    const count = c.voc3y[cat.key] || 0;
    for (let i = 0; i < count; i++) {
      const texts = VOC_TEXT[cat.key];
      const text = texts[(seed + i) % texts.length];
      const daysAgo = ((seed + n * 37 + i * 53) % 1080) + 3;   // 최근 3년(≈1080일) 내
      const resolved = cat.key === 'inquiry' || cat.key === 'praise' || ((seed + i) % 3 !== 0);
      out.push({
        date: ymdDaysAgo(daysAgo),
        cat: cat.key, catLabel: cat.label, tone: cat.tone,
        text, status: resolved ? '처리완료' : '처리중',
        channel: ((seed + i) % 2 === 0) ? '전화' : '앱/웹',
      });
      n++;
    }
  });
  return out.sort((a, b) => b.date.localeCompare(a.date));
}

const SIGNAL_DESC = [
  { kw: '화재', desc: '화재(연기·열) 감지 신호. 현장 확인 및 유관기관 통보 대상입니다.', check: '감지기 발화 지점 확인, 오경보 여부 판정, 필요 시 소방 통보.' },
  { kw: '누수', desc: '누수 센서 감지 신호. 집수정·배수 설비 점검이 필요합니다.', check: '누수 위치 확인, 배수펌프 작동 점검, 재발 시 배관 점검 권장.' },
  { kw: '정전', desc: '전원 이상(정전) 감지 신호. 무정전 전원·설비 상태 점검 대상입니다.', check: '전원 복구 여부 확인, UPS 상태 점검, 설비 재기동 확인.' },
  { kw: '가스', desc: '가스 누출 감지 신호. 즉시 환기 및 안전 점검이 필요합니다.', check: '가스 밸브 차단 여부, 환기 상태, 필요 시 유관기관 통보.' },
  { kw: '설비', desc: '설비 이상(전류·온도 등) 신호. 노후 설비 점검을 권장합니다.', check: '해당 설비 전류/온도 로그 확인, 반복 시 교체 점검.' },
  { kw: '온습도', desc: '온습도 이상 신호. 중요실 환경 관리 상태 점검 대상입니다.', check: '설정 범위 이탈 여부, 공조 설비 작동 확인.' },
  { kw: '카메라', desc: '카메라 오프라인/이상 신호. 영상 장비 연결 상태 점검이 필요합니다.', check: '네트워크 연결·전원 확인, 녹화 정상 여부 점검.' },
  { kw: '침입', desc: '침입 감지 신호. 출입 통제 및 현장 확인 대상입니다.', check: '출입 기록 대조, 현장 확인, 필요 시 출동.' },
];

// 관제신호 1건 세부 — 요약(date/type/severity)에 설명·점검포인트·대응상태를 붙인다
export function buildSignalDetail(signal, c) {
  const type = signal.type || '';
  const meta = SIGNAL_DESC.find(s => type.includes(s.kw)) || { desc: '관제 신호가 감지되었습니다. 상태 확인이 필요합니다.', check: '신호 발생 맥락 확인 후 대응 판단.' };
  const response = signal.notifiedAuthority ? '유관기관 통보 · 현장 출동'
    : signal.severity === '심각' ? '즉시 확인 · 담당자 출동 검토'
    : signal.severity === '주의' ? '원격 확인 · 고객 선제 안내'
    : '자동 정상화 · 기록 보관';
  return {
    date: signal.date, type, severity: signal.severity,
    notifiedAuthority: !!signal.notifiedAuthority,
    desc: meta.desc, check: meta.check, response,
    site: c ? c.name : '',
  };
}
