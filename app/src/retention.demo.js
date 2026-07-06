/* ===== retention.demo.js — 유지고객(블루스캔) 더미데이터 (40건) =====
 * retentionSchema.js의 필드 정의를 따른다. 시연 계정(서강지사)에 맞춰 전건을 서강지사(마포구) 관할로
 * 한정했다 — 마포구 내 12개 동을 순환시켜 지역 다양성만 확보한다(다른 지사 데이터 없음).
 * 이탈 스코어·등급은 아직 넣지 않는다(예측 모델 기준은 사람이 설계해야 하는 영역).
 * 실데이터 연동 시: 이 파일 대신 실제 계약·관제 시스템에서 같은 필드 구조로 채워 넣으면 된다.
 */
import { USE_TYPES, SIGNAL_TYPES, SIGNAL_SEVERITY, REMOTE_DEVICES, REMOTE_ACTIONS, CONTRACT_TERM_MONTHS } from './retentionSchema.js'

const _today0 = new Date(); _today0.setHours(0, 0, 0, 0);
const TODAY = _today0;
const dstr = (d) => { const x = new Date(d); const q = (v) => String(v).padStart(2, '0'); return `${x.getFullYear()}-${q(x.getMonth() + 1)}-${q(x.getDate())}`; };
const daysAgoStr = (n) => { const d = new Date(TODAY); d.setDate(d.getDate() - n); return dstr(d); };
const daysFromNowStr = (n) => { const d = new Date(TODAY); d.setDate(d.getDate() + n); return dstr(d); };
const monthsAgoStr = (n) => { const d = new Date(TODAY); d.setMonth(d.getMonth() - n); return dstr(d); };

// 서강지사(마포구) 관할 동 12곳 — 시연 계정 범위를 벗어나지 않도록 전건을 이 안에서만 생성한다
const REGIONS = [
  { branch: '서강지사', sido: '서울', sigungu: '마포구', gun: '마포구', dong: '합정동', lat: 37.5495, lng: 126.9146 },
  { branch: '서강지사', sido: '서울', sigungu: '마포구', gun: '마포구', dong: '망원동', lat: 37.5563, lng: 126.9022 },
  { branch: '서강지사', sido: '서울', sigungu: '마포구', gun: '마포구', dong: '연남동', lat: 37.5614, lng: 126.9256 },
  { branch: '서강지사', sido: '서울', sigungu: '마포구', gun: '마포구', dong: '서교동', lat: 37.5531, lng: 126.9169 },
  { branch: '서강지사', sido: '서울', sigungu: '마포구', gun: '마포구', dong: '상암동', lat: 37.5794, lng: 126.8896 },
  { branch: '서강지사', sido: '서울', sigungu: '마포구', gun: '마포구', dong: '공덕동', lat: 37.5449, lng: 126.9514 },
  { branch: '서강지사', sido: '서울', sigungu: '마포구', gun: '마포구', dong: '아현동', lat: 37.5578, lng: 126.9563 },
  { branch: '서강지사', sido: '서울', sigungu: '마포구', gun: '마포구', dong: '도화동', lat: 37.5389, lng: 126.9469 },
  { branch: '서강지사', sido: '서울', sigungu: '마포구', gun: '마포구', dong: '신수동', lat: 37.5474, lng: 126.9391 },
  { branch: '서강지사', sido: '서울', sigungu: '마포구', gun: '마포구', dong: '대흥동', lat: 37.5468, lng: 126.9438 },
  { branch: '서강지사', sido: '서울', sigungu: '마포구', gun: '마포구', dong: '염리동', lat: 37.5495, lng: 126.9459 },
  { branch: '서강지사', sido: '서울', sigungu: '마포구', gun: '마포구', dong: '성산동', lat: 37.5665, lng: 126.9106 },
];

const PREFIXES = ['한빛', '유진', '대성', '미래', '서진', '신성', '중앙', '동방', '태평양', '현대', '효성', '대명', '상록', '한마음', '청솔'];
const SUFFIX_BY_USE = {
  사무실: ['빌딩', '타워', '오피스'],
  아파트: ['아파트', '자이', '더샵'],
  공공기관: ['구청', '주민센터', '보건소'],
  대학교: ['대학교', '캠퍼스'],
  상업시설: ['프라자', '스퀘어', '몰'],
};
const CONSULTANTS = ['김두환', '류진석', '서지나', '최주희', '김은영'];

const CONTRACT_MONTHS_CYCLE = [6, 14, 22, 30, 41, 53, 64, 77, 18, 9];
const DAYS_UNTIL_END_CYCLE = [45, 400, 120, 730, 20, 300, 200, 550, 10, 900];
const MONTHLY_FEE_CYCLE = [180000, 250000, 320000, 150000, 410000, 220000, 290000, 175000, 360000, 205000];
const INSTALL_COST_CYCLE = [1200000, 2500000, 1800000, 3200000, 900000, 4100000, 2200000, 1500000, 3800000, 2000000];
const LAST_ACCESS_DAYS_CYCLE = [1, 3, 10, 45, 2, 60, 5, 90, 1, 120];
const VOC_CYCLE = [0, 1, 0, 2, 0, 0, 1, 3, 0, 0];
const SIGNAL_DAYS_AGO = [4, 15, 32, 58, 80];
const DISCOUNT_RATE_CYCLE = [10, 15, 20, 25, 30, 12, 18, 22, 28, 35]; // 공사비 할인율(%)
const REMOTE_LOG_DAYS_AGO = [1, 3, 6, 9, 13, 18, 22, 27];

function buildRemoteControlLog(i, devices) {
  const count = i % 6; // 0~5건(최근 30일)
  const events = [];
  for (let k = 0; k < count; k++) {
    events.push({
      date: daysAgoStr(REMOTE_LOG_DAYS_AGO[(i + k) % REMOTE_LOG_DAYS_AGO.length]),
      device: devices[(i + k) % devices.length],
      action: REMOTE_ACTIONS[(i + k) % REMOTE_ACTIONS.length],
    });
  }
  return events;
}

function buildSignalHistory(i, productTier) {
  const count = i % 4; // 0~3건
  const events = [];
  for (let k = 0; k < count; k++) {
    const type = SIGNAL_TYPES[(i + k) % SIGNAL_TYPES.length];
    const severity = SIGNAL_SEVERITY[(i + k) % SIGNAL_SEVERITY.length];
    events.push({
      date: daysAgoStr(SIGNAL_DAYS_AGO[(i + k) % SIGNAL_DAYS_AGO.length]),
      type, severity,
      notifiedAuthority: productTier === 'dual' && severity === '심각',
    });
  }
  return events;
}

export function buildRetentionDemo() {
  const N = 10;  // 시연 경량화: 40→10 (순환배열 길이=10 → 값 반복 없이 전부 distinct)
  const out = [];
  for (let i = 0; i < N; i++) {
    const region = REGIONS[i % REGIONS.length];
    const use = USE_TYPES[i % USE_TYPES.length];
    const prefix = PREFIXES[i % PREFIXES.length];
    const suffixes = SUFFIX_BY_USE[use];
    const name = `${prefix}${suffixes[i % suffixes.length]}`;
    const productTier = i % 5 === 4 ? 'owner' : 'dual'; // 듀얼 80% / 오너 20%

    const contractMonths = CONTRACT_MONTHS_CYCLE[i % 10];
    const startDate = monthsAgoStr(contractMonths);
    const contractDate = daysAgoStr(contractMonths * 30 + 10);
    const endDate = daysFromNowStr(DAYS_UNTIL_END_CYCLE[i % 10]);

    const sensorCount = 3 + (i % 3); // 3~5종
    const sensorTypes = Array.from({ length: sensorCount }, (_, k) => SIGNAL_TYPES[(i + k) % SIGNAL_TYPES.length]);
    const remoteControlDevices = i % 4 === 3 ? [REMOTE_DEVICES[0]] : REMOTE_DEVICES.slice();

    const signalHistory = buildSignalHistory(i, productTier);
    const signalCount30d = signalHistory.filter(s => (TODAY - new Date(s.date)) / 86400000 <= 30).length;
    const signalCount90d = signalHistory.length; // 위 SIGNAL_DAYS_AGO가 전부 90일 이내라 전체 개수와 동일
    const signalTrend = signalCount30d === 0 ? '감소' : signalCount30d >= 2 ? '증가' : '평시';

    const remoteControlLog = buildRemoteControlLog(i, remoteControlDevices);
    const remoteControlUsage30d = remoteControlLog.length;
    const lastAppAccessDate = daysAgoStr(LAST_ACCESS_DAYS_CYCLE[i % 10]);
    const unresolvedVOC = VOC_CYCLE[i % 10];
    const monthlyReportSent = (productTier === 'dual' && i % 4 !== 3) ? daysAgoStr(18 + (i % 10)) : null;
    const lastTouchDate = signalCount30d >= 2 ? daysAgoStr(6 + (i % 5)) : null;

    // --- 5. 생애가치(BEP/ROI) ---
    const monthlyFee = MONTHLY_FEE_CYCLE[i % 10];
    const installCost = INSTALL_COST_CYCLE[i % 10];
    const installCostDiscountRate = DISCOUNT_RATE_CYCLE[i % 10];
    const standardInstallCost = Math.round(installCost / (1 - installCostDiscountRate / 100));
    const bepMonths = Math.round(installCost / monthlyFee);
    const bepReached = contractMonths >= bepMonths;
    const roi3yr = Math.round(((monthlyFee * CONTRACT_TERM_MONTHS - installCost) / installCost) * 1000) / 10;
    const netValueToDate = monthlyFee * contractMonths - installCost;

    out.push({
      id: `RC${1000 + i}`,
      name,
      address: `${region.sido} ${region.sigungu} ${region.dong}`,
      sido: region.sido, sigungu: region.sigungu, gun: region.gun, dong: region.dong,
      use,
      branch: region.branch,
      lat: region.lat + ((i % 7) - 3) * 0.0012, lng: region.lng + ((i % 5) - 2) * 0.0012,
      contractNo: `BS-${100000 + i}`,
      contractDate, startDate, endDate,
      contractMonths,
      monthlyFee,
      installCost,
      installCostDiscountRate,
      standardInstallCost,
      productTier,
      sensorTypes,
      remoteControlDevices,
      signalHistory,
      signalCount30d,
      signalCount90d,
      signalTrend,
      remoteControlLog,
      remoteControlUsage30d,
      lastAppAccessDate,
      unresolvedVOC,
      monthlyReportSent,
      lastTouchDate,
      assignedConsultant: CONSULTANTS[i % CONSULTANTS.length],
      bepMonths,
      bepReached,
      roi3yr,
      netValueToDate,
    });
  }
  return out;
}
