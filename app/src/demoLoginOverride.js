/* ===== demoLoginOverride.js — 로그인 화면 데모 추천계정 정리 =====
 * 생성 파일(appdata.js)은 건드리지 않고, 앱 시작 시 런타임에서 덮어쓴다.
 * - 컨설턴트 추천계정 사번: 20123901 (8자리)
 * - 관리자   추천계정 사번: 20123902 (8자리, 전체 지사 조회)
 * - 비밀번호: 1234 (4자리)
 * 해당 사번으로 실제 로그인도 되도록 APP_ACCOUNTS에 계정을 보장 주입한다.
 */
export function applyDemoLoginOverride() {
  if (typeof window === 'undefined') return;

  const D = window.APP_DEMO || (window.APP_DEMO = {});
  D.consultant = { ...(D.consultant || {}), empno: '20123901', name: '윤연연', branch: '서강지사' };
  D.admin = { ...(D.admin || {}), empno: '20123902', name: '박팀장' };
  D.password = '1234';

  const list = window.APP_ACCOUNTS;
  if (Array.isArray(list)) {
    const ensure = (acc) => {
      const ex = list.find(a => String(a.empno) === acc.empno);
      if (ex) Object.assign(ex, acc); else list.push(acc);
    };
    ensure({ empno: '20123901', name: '윤연연', branch: '서강지사', role: 'consultant' });
    ensure({ empno: '20123902', name: '박팀장', branch: '', role: 'admin' });
  }
}
