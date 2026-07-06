/* ===== fireDispatch.demo.js — 소방청 화재정보 공개API(국민안전24) 목업 =====
 * 실연동 전, 대시보드·지도에 어떻게 배치될지 보여주기 위한 예시 데이터.
 * 실제 API 연동 시 이 파일의 buildFireDispatchDemo() 반환값과 동일한 구조로
 * API 호출 결과를 채워 넣으면 화면 변경 없이 교체된다.
 *
 * 참고 — 실연동 대상 (일별 배치 스킬 daily-fire-dashboard-briefing 참고):
 *   1) 시도별 통계 — apis.data.go.kr/1661000/FireInformationService
 *      getOcBysidoFireSmrzPcnd(접수/진행) · getOcBysidoFpcnd(인명피해) · getOcBysidoFireOcrnPcnd(재산피해)
 *      ※ 광주·전남은 SIDO_NM=null(전남광주통합특별시)로 통합 집계될 수 있음 — 실연동 시 별도 라벨 처리 필요.
 *      (national 요약 배지에만 쓰고, 시도별 막대 나열은 UI에서 제외했다 — 영업 관점에서 의미가 약함)
 *   2) 실시간 화재 출동 현황 — safekorea.go.kr 실시간 화재정보(전 페이지, 화재 필터) → liveItems
 *      {id, type, loc, time, lat, lng, scale} 구조. 대시보드에는 스크롤 리스트로, 지도에는 마커로 표시한다.
 */
import { todayYMD, todayMMDD } from './dateUtil.js'

// 시도별 접수/진행/인명피해(명)/재산피해(원) — 어제자 스냅샷 가정 (예시, national 요약에만 사용)
const BY_SIDO = [
  { sido: '경기', rcpt: 14, prog: 1, life: 1, prop: 82_400_000 },
  { sido: '서울', rcpt: 9, prog: 0, life: 0, prop: 31_200_000 },
  { sido: '부산', rcpt: 6, prog: 1, life: 2, prop: 145_000_000 },
  { sido: '인천', rcpt: 5, prog: 0, life: 0, prop: 18_900_000 },
  { sido: '대구', rcpt: 4, prog: 0, life: 0, prop: 9_600_000 },
  { sido: '대전', rcpt: 3, prog: 0, life: 0, prop: 4_200_000 },
  { sido: '광주', rcpt: 2, prog: 0, life: 0, prop: 2_100_000 },
];

// 실시간 화재 출동 현황(safekorea 실시간 화재정보 목업) — 시연용으로 서강지사(마포구) 3건 포함
const LIVE_ITEMS = [
  { id: 'F001', type: '화재', loc: '서울 마포구 합정동', time: '07/04 09:12', lat: 37.5495, lng: 126.9146, scale: '소형' },
  { id: 'F002', type: '화재', loc: '서울 마포구 망원동', time: '07/04 08:47', lat: 37.5563, lng: 126.9022, scale: '중형' },
  { id: 'F003', type: '화재', loc: '서울 마포구 공덕동', time: '07/04 07:58', lat: 37.5449, lng: 126.9514, scale: '소형' },
  { id: 'F004', type: '화재', loc: '서울 강남구 역삼동', time: '07/04 09:03', lat: 37.5006, lng: 127.0365, scale: '소형' },
  { id: 'F005', type: '화재', loc: '경기 수원시 팔달구', time: '07/04 08:31', lat: 37.2636, lng: 127.0286, scale: '중형' },
  { id: 'F006', type: '화재', loc: '부산 해운대구', time: '07/04 07:20', lat: 35.1631, lng: 129.1636, scale: '대형' },
  { id: 'F007', type: '화재', loc: '인천 남동구', time: '07/04 06:55', lat: 37.4474, lng: 126.7314, scale: '소형' },
  { id: 'F008', type: '화재', loc: '대구 달서구', time: '07/04 06:40', lat: 35.8296, lng: 128.5326, scale: '소형' },
  { id: 'F009', type: '화재', loc: '경기 화성시', time: '07/04 06:12', lat: 37.1997, lng: 126.8314, scale: '중형' },
  { id: 'F010', type: '화재', loc: '충남 천안시', time: '07/04 05:48', lat: 36.8151, lng: 127.1139, scale: '소형' },
];

export function buildFireDispatchDemo() {
  const national = BY_SIDO.reduce((acc, r) => ({
    rcpt: acc.rcpt + r.rcpt,
    prog: acc.prog + r.prog,
    life: acc.life + r.life,
    prop: acc.prop + r.prop,
  }), { rcpt: 0, prog: 0, life: 0, prop: 0 });
  return {
    isMock: true,
    source: '소방청 화재정보 공개API(국민안전24) · 예시 데이터 — 실연동 예정',
    baseDate: todayYMD(),
    national,
    bySido: BY_SIDO.slice().sort((a, b) => b.rcpt - a.rcpt),
    liveItems: LIVE_ITEMS.map((it) => ({ ...it, time: `${todayMMDD()} ${it.time.split(' ')[1]}` })),
  };
}
