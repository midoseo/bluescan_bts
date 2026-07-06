/* ===== retentionSchema.js — 유지고객(블루스캔) 대시보드 데이터 스키마 =====
 * 이 파일은 실데이터를 담지 않는다. 필드 정의·허용값(enum)만 갖고 있어서
 * retention.demo.js(더미 생성)와 향후 실데이터 연동 코드가 같은 기준을 참조하게 한다.
 *
 * 여기서 말하는 "유지고객"은 리스트 B(업셀링 — 블루스캔 미도입 기존 세콤/알람 고객)와는
 * 완전히 별개다. 이 스키마는 이미 블루스캔을 쓰고 있는 계약 고객(테마 B: 리텐션 보강 대상)을 다룬다.
 *
 * 서비스 구조 학습 출처: https://www.s1.co.kr/estate/manage/smart-building
 * (오너/듀얼 티어 구분, 이상발생 5종 신호, 원격제어 대상 기기 등은 실제 서비스 구성을 반영한 것)
 *
 * 이번 1차 버전은 "신호 표시"까지만 다룬다. 이탈 스코어·등급(churnScore/churnRisk)과
 * 해약 방어 시나리오는 예측 모델 기준을 사람이 설계해야 하는 영역(PRD 원칙)이라 아직 넣지 않는다.
 */

// 1. 기본 식별·계약 정보에서 쓰는 업종 분류
export const USE_TYPES = ['사무실', '아파트', '공공기관', '대학교', '상업시설'];

// 2. 서비스 티어 — 자기관제형(오너) vs 관제센터 이중 모니터링(듀얼)
export const PRODUCT_TIERS = { owner: '블루스캔 오너', dual: '블루스캔 듀얼' };

// 3. 관제 신호 유형 (서비스 1단계 "이상발생" 5종 그대로)
export const SIGNAL_TYPES = ['화재', '정전', '가스누출', '누수', '고저수위'];
export const SIGNAL_SEVERITY = ['경미', '주의', '심각'];

// 2. 원격제어 대상 기기 (조명·냉난방기 — 서비스 특장점에 명시된 항목)
export const REMOTE_DEVICES = ['조명', '냉난방기'];
export const REMOTE_ACTIONS = ['켜짐', '꺼짐', '스케줄 설정'];

// 5. 생애가치(BEP/ROI) 계산 기준 — 회사 표준 계약기간 3년(36개월)
export const CONTRACT_TERM_MONTHS = 36;

/**
 * @typedef {Object} RetentionSignalEvent
 * @property {string} date - YYYY-MM-DD
 * @property {'화재'|'정전'|'가스누출'|'누수'|'고저수위'} type
 * @property {'경미'|'주의'|'심각'} severity
 * @property {boolean} notifiedAuthority - 유관기관 통보 여부. 듀얼 상품 + 고객 요청 시에만 true, 오너는 항상 false
 */

/**
 * @typedef {Object} RemoteControlLogEntry
 * @property {string} date - YYYY-MM-DD
 * @property {'조명'|'냉난방기'} device
 * @property {'켜짐'|'꺼짐'|'스케줄 설정'} action
 */

/**
 * @typedef {Object} RetentionCustomer
 * --- 1. 기본 식별·계약 정보 ---
 * @property {string} id
 * @property {string} name          - 계약처명
 * @property {string} address
 * @property {string} sido
 * @property {string} sigungu
 * @property {string} gun
 * @property {string} dong
 * @property {'사무실'|'아파트'|'공공기관'|'대학교'|'상업시설'} use - 업종
 * @property {string} branch        - 지사
 * @property {number} lat
 * @property {number} lng
 * @property {string} contractNo    - 계약번호
 * @property {string} contractDate  - 계약일
 * @property {string} startDate     - 개시일(서비스 실제 개시)
 * @property {string} endDate       - 계약종료일(예상종료일)
 * @property {number} contractMonths - 누적 유지기간(개월)
 * @property {number} monthlyFee    - 계약 당시(=현재) 월 서비스료(원)
 * @property {number} installCost   - 공사비(원) — 할인 적용 후 실제 청구액
 * @property {number} installCostDiscountRate - 공사비 할인율(%, 정가 대비)
 * @property {number} standardInstallCost     - 공사비 정가(원) = installCost / (1 - 할인율)
 * --- 2. 서비스 티어·설비 구성 ---
 * @property {'owner'|'dual'} productTier
 * @property {string[]} sensorTypes - 설치된 센서 종류(SIGNAL_TYPES 부분집합)
 * @property {string[]} remoteControlDevices - 원격제어 대상 기기(REMOTE_DEVICES 부분집합)
 * --- 3. 관제 신호·원격제어 이력 ---
 * @property {RetentionSignalEvent[]} signalHistory
 * @property {number} signalCount30d
 * @property {number} signalCount90d
 * @property {'증가'|'평시'|'감소'} signalTrend
 * @property {RemoteControlLogEntry[]} remoteControlLog - 원격제어 사용 이력(최근 30일)
 * --- 4. 활성도·소통 신호 ---
 * @property {number} remoteControlUsage30d - 최근 30일 원격제어 사용 횟수 (remoteControlLog.length)
 * @property {string} lastAppAccessDate     - 앱/웹 마지막 접속일
 * @property {number} unresolvedVOC         - 미해결 VOC 건수
 * @property {string|null} monthlyReportSent - 월간 리포트 최근 발송일(없으면 null)
 * @property {string|null} lastTouchDate     - 감성터칭 메시지 최근 발송일(없으면 null)
 * @property {string} assignedConsultant     - 담당 컨설턴트(CS 겸직)
 * --- 5. 생애가치(BEP/ROI) — "해약 시즌에 할인해도 이득인가, 유지가 꼭 필요한 고객인가"를 보여주는 지표 ---
 * @property {number} bepMonths      - 손익분기(BEP) 개월수 = installCost / monthlyFee (반올림)
 * @property {boolean} bepReached    - contractMonths가 bepMonths를 넘었는지 여부
 * @property {number} roi3yr         - 표준 계약기간(3년=36개월) 기준 ROI(%) = (monthlyFee*36 - installCost) / installCost * 100
 * @property {number} netValueToDate - 누적 순가치(원) = monthlyFee*contractMonths - installCost. 음수면 "지금 해약 시 손실" 상태
 */
