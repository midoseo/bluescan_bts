/* ===== demoConsultants.js — 시연용 데모 컨설턴트 (서강지사) =====
   메인 자동생성 파일(public/data/appdata.js)은 건드리지 않고,
   앱이 켜질 때 window.APP_ACCOUNTS 명단에 서강지사 데모 컨설턴트를 덧붙인다.
   - 기존 윤연연(0232931336, 데이터 최다·추천 계정)은 그대로 두고 15명을 추가.
   - 사번은 데모용 가상 번호(중복 시 건너뜀), 비밀번호는 공통 1234.
*/

export const DEMO_CONSULTANTS = [
  { empno: '0232950001', name: '김서연', branch: '서강지사', role: 'consultant' },
  { empno: '0232950002', name: '이도윤', branch: '서강지사', role: 'consultant' },
  { empno: '0232950003', name: '박지호', branch: '서강지사', role: 'consultant' },
  { empno: '0232950004', name: '최예준', branch: '서강지사', role: 'consultant' },
  { empno: '0232950005', name: '정하은', branch: '서강지사', role: 'consultant' },
  { empno: '0232950006', name: '강민재', branch: '영등포지사', role: 'consultant' },
  { empno: '0232950007', name: '조유진', branch: '영등포지사', role: 'consultant' },
  { empno: '0232950008', name: '윤서준', branch: '영등포지사', role: 'consultant' },
  { empno: '0232950009', name: '임채원', branch: '영등포지사', role: 'consultant' },
  { empno: '0232950010', name: '한지민', branch: '영등포지사', role: 'consultant' },
  { empno: '0232950011', name: '오현우', branch: '서울중앙지사', role: 'consultant' },
  { empno: '0232950012', name: '서다은', branch: '서울중앙지사', role: 'consultant' },
  { empno: '0232950013', name: '신준영', branch: '서울중앙지사', role: 'consultant' },
  { empno: '0232950014', name: '권나윤', branch: '서울중앙지사', role: 'consultant' },
  { empno: '0232950015', name: '황태경', branch: '서울중앙지사', role: 'consultant' },
];

// window.APP_ACCOUNTS 에 데모 컨설턴트를 1회 주입 (사번 중복 시 건너뜀)
export function injectDemoConsultants() {
  if (typeof window === 'undefined') return;
  const list = window.APP_ACCOUNTS;
  if (!Array.isArray(list)) return;
  const seen = new Set(list.map(a => String(a.empno)));
  for (const c of DEMO_CONSULTANTS) {
    if (!seen.has(String(c.empno))) { list.push(c); seen.add(String(c.empno)); }
  }
}
