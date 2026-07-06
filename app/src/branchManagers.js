/* ===== branchManagers.js — 지사별 지사장(관리자 권한) 계정 =====
   메인 개발자의 자동생성 파일(public/data/appdata.js)은 건드리지 않고,
   앱이 켜질 때 window.APP_ACCOUNTS 명단에 지사장 계정을 덧붙인다.
   - 박팀장(branch 빈값) = 본사 전체 관리자(기존)
   - 아래 75명(branch 지정) = 해당 지사만 보는 지사장
   데이터 출처: POSTCODE_dummy2.csv 의 (지사장 / 지사장사번) — 2026-06-11 반영.
*/

export const BRANCH_MANAGERS = [
  { empno: "0189083535", name: "양우석", branch: "강남광역지사", role: 'admin' },
  { empno: "0832687937", name: "조성웅", branch: "강동지사", role: 'admin' },
  { empno: "0920331532", name: "백태훈", branch: "강릉지사", role: 'admin' },
  { empno: "0875483847", name: "홍대만", branch: "강북광역지사", role: 'admin' },
  { empno: "0318790375", name: "오민석", branch: "강서지사", role: 'admin' },
  { empno: "0661754794", name: "김영범", branch: "경산지사", role: 'admin' },
  { empno: "0867880497", name: "강준국", branch: "고양지사", role: 'admin' },
  { empno: "0454010198", name: "정우훈", branch: "광주지사", role: 'admin' },
  { empno: "0596161798", name: "안광웅", branch: "구로지사", role: 'admin' },
  { empno: "0954982376", name: "황경범", branch: "구미지사", role: 'admin' },
  { empno: "0702332368", name: "한현용", branch: "기흥지사", role: 'admin' },
  { empno: "0155102070", name: "오성만", branch: "김포지사", role: 'admin' },
  { empno: "0556791494", name: "고경환", branch: "남양주지사", role: 'admin' },
  { empno: "0199497546", name: "강정규", branch: "남인천지사", role: 'admin' },
  { empno: "0496453898", name: "송대복", branch: "논산지점", role: 'admin' },
  { empno: "0830820441", name: "송종호", branch: "대구광역지사", role: 'admin' },
  { empno: "0175854914", name: "송광순", branch: "동김해지사", role: 'admin' },
  { empno: "0834770807", name: "양민석", branch: "동서울지사", role: 'admin' },
  { empno: "0418232102", name: "권경웅", branch: "동해지사", role: 'admin' },
  { empno: "0192887818", name: "이우훈", branch: "밀양영업소", role: 'admin' },
  { empno: "0284508479", name: "장종규", branch: "부산강서지사", role: 'admin' },
  { empno: "0846827510", name: "배승용", branch: "부산광역지사", role: 'admin' },
  { empno: "0270206043", name: "허준수", branch: "부산동부지사", role: 'admin' },
  { empno: "0286444583", name: "양형순", branch: "부산중앙지사", role: 'admin' },
  { empno: "0416939096", name: "조영훈", branch: "부여영업소", role: 'admin' },
  { empno: "0893016403", name: "유기환", branch: "부천지사", role: 'admin' },
  { empno: "0533768154", name: "서광국", branch: "북서울지사", role: 'admin' },
  { empno: "0987625212", name: "심현복", branch: "상주지사", role: 'admin' },
  { empno: "0951062813", name: "남형훈", branch: "서강지사", role: 'admin' },
  { empno: "0725931728", name: "한승식", branch: "서대구지사", role: 'admin' },
  { empno: "0964742624", name: "조영권", branch: "서부산지사", role: 'admin' },
  { empno: "0648806583", name: "백준만", branch: "서산지사", role: 'admin' },
  { empno: "0769928629", name: "황광평", branch: "서서울지사", role: 'admin' },
  { empno: "0369671339", name: "손동일", branch: "서울동부지사", role: 'admin' },
  { empno: "0874876536", name: "유동웅", branch: "서인천지사", role: 'admin' },
  { empno: "0603626844", name: "한동수", branch: "서초지사", role: 'admin' },
  { empno: "0575638397", name: "장민훈", branch: "성남지사", role: 'admin' },
  { empno: "0347242720", name: "윤성석", branch: "성북지사", role: 'admin' },
  { empno: "0307529540", name: "남진식", branch: "세종지사", role: 'admin' },
  { empno: "0347185889", name: "임태헌", branch: "속초지사", role: 'admin' },
  { empno: "0809279383", name: "강대범", branch: "송파지사", role: 'admin' },
  { empno: "0290745412", name: "신성만", branch: "수원광역지사", role: 'admin' },
  { empno: "0752872139", name: "신영철", branch: "시화지사", role: 'admin' },
  { empno: "0846249394", name: "황정환", branch: "시흥지사", role: 'admin' },
  { empno: "0714892922", name: "유동국", branch: "안동지사", role: 'admin' },
  { empno: "0227469017", name: "정재국", branch: "안산지사", role: 'admin' },
  { empno: "0828345556", name: "박우헌", branch: "안성지사", role: 'admin' },
  { empno: "0985980680", name: "배성규", branch: "안양지사", role: 'admin' },
  { empno: "0649043001", name: "윤민헌", branch: "양산지사", role: 'admin' },
  { empno: "0389265203", name: "송상평", branch: "영등포지사", role: 'admin' },
  { empno: "0703317192", name: "양진규", branch: "영주지사", role: 'admin' },
  { empno: "0315053957", name: "손상철", branch: "예산지점", role: 'admin' },
  { empno: "0332274150", name: "서동범", branch: "오산지사", role: 'admin' },
  { empno: "0308812623", name: "서병만", branch: "옥천지사", role: 'admin' },
  { empno: "0180257230", name: "송태웅", branch: "외동영업소", role: 'admin' },
  { empno: "0376594444", name: "최형국", branch: "용인지사", role: 'admin' },
  { empno: "0526557720", name: "이정범", branch: "울산지사", role: 'admin' },
  { empno: "0213546818", name: "유병만", branch: "원주지사", role: 'admin' },
  { empno: "0834294137", name: "허승석", branch: "의정부지사", role: 'admin' },
  { empno: "0315601357", name: "남정만", branch: "이천지사", role: 'admin' },
  { empno: "0544599129", name: "허형순", branch: "인천광역지사", role: 'admin' },
  { empno: "0552162517", name: "심종석", branch: "제천지사", role: 'admin' },
  { empno: "0187470236", name: "손영환", branch: "진주지사", role: 'admin' },
  { empno: "0465170885", name: "배정범", branch: "창원광역지사", role: 'admin' },
  { empno: "0471016842", name: "문동호", branch: "천안지사", role: 'admin' },
  { empno: "0412332550", name: "신기국", branch: "청주지사", role: 'admin' },
  { empno: "0432652652", name: "홍상훈", branch: "춘천지사", role: 'admin' },
  { empno: "0640253909", name: "임병권", branch: "충주지사", role: 'admin' },
  { empno: "0803496718", name: "손상복", branch: "칠곡지점", role: 'admin' },
  { empno: "0640301995", name: "문진수", branch: "파주지사", role: 'admin' },
  { empno: "0111970604", name: "전정범", branch: "평택지사", role: 'admin' },
  { empno: "0217888716", name: "김진권", branch: "포천지사", role: 'admin' },
  { empno: "0368615513", name: "조종웅", branch: "포항지사", role: 'admin' },
  { empno: "0985915129", name: "정성순", branch: "함안지사", role: 'admin' },
  { empno: "0983009961", name: "백동훈", branch: "화성지사", role: 'admin' },
];

// 관리자 시연용 추천 계정 = 서강지사 지사장(남형훈, 0951062813)
const DEMO_ADMIN = { empno: '0951062813', name: '남형훈', branch: '서강지사', role: 'admin' };

// window.APP_ACCOUNTS 에 지사장 계정을 1회 주입 (사번 중복 시 건너뜀)
export function injectBranchManagers() {
  if (typeof window === 'undefined') return;
  const list = window.APP_ACCOUNTS;
  if (!Array.isArray(list)) return;
  const seen = new Set(list.map(a => String(a.empno)));
  for (const m of BRANCH_MANAGERS) {
    if (!seen.has(String(m.empno))) { list.push(m); seen.add(String(m.empno)); }
  }
  // 발표·시연용 '관리자' 추천 계정을 서강지사 지사장으로 지정
  if (window.APP_DEMO) window.APP_DEMO.admin = { ...DEMO_ADMIN };
}
