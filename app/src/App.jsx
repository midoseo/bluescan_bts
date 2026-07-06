/* ===== App.jsx — root: S-1 GNB shell, routing, state ===== */
import React from 'react'
import { useTweaks } from './useTweaks.js'
import { MI, VISIT, BrandMark, BltaMark } from './components.jsx'
import { AdminDash, SalesDash } from './screens/Dash.jsx'
import { ListAScreen } from './screens/ListA.jsx'
import { ListBScreen } from './screens/ListB.jsx'
import { ConfirmedScreen } from './screens/Confirmed.jsx'
import { RetentionScreen } from './screens/Retention.jsx'
import { VisitDialog } from './screens/Visit.jsx'
import { Login } from './screens/Login.jsx'
import { buildDemoVisits } from './demoVisits.js'
import { currentSeasonKey } from './season.js'
import { buildRetentionDemo } from './retention.demo.js'
import { computeSessionPoints, questProgress, badgeStatus } from './gamification.js'
import { pointToast, badgeToast, questToast } from './toastMessages.js'
import { todayCompact } from './dateUtil.js'
const { useState, useMemo, useCallback, useEffect, useRef } = React

/* 화면 단위 에러 경계 — 한 화면이 실패해도 앱 전체가 빈 화면이 되지 않도록 */
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch() { /* swallow — fallback UI handles it */ }
  render() {
    if (this.state.error) {
      return (
        <div className="pc-content fadein" style={{ padding: '32px 0' }}>
          <div className="empty">
            <div className="empty__ico"><MI n="error_outline" s={32} /></div>
            <h3>화면을 표시하는 중 문제가 발생했어요</h3>
            <p>{String(this.state.error.message || this.state.error)}</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const TWEAK_DEFAULTS = { listMode: 'table', density: 'regular' };

const PERSONA = {
  consultant: { name: '김영업', role: '영업 컨설턴트', greet: '오늘 방문할 타깃을 함께 정해 봐요.' },
  admin: { name: '박팀장', role: '영업 관리자', greet: '팀 영업 현황과 방문 결과를 한눈에 확인해 봐요.' },
};
const homeNav = (role) => role === 'admin'
  ? { key: 'home', label: '관리자 대시보드', short: '관리자 대시보드', icon: 'space_dashboard' }
  : { key: 'home', label: '컨설턴트 대시보드', short: '컨설턴트 대시보드', icon: 'space_dashboard' };
const BASE_NAV = [
  { key: 'listB', label: '기존 고객 후보(업셀링)', short: '기존 고객 후보(업셀링)', icon: 'apartment' },
  { key: 'listA', label: '신규 고객 후보', short: '신규 고객 후보', icon: 'travel_explore' },
  { key: 'retention', label: '유지고객 대시보드', short: '유지고객 대시보드', icon: 'shield_with_heart' },
  { key: 'confirmed', label: '방문 결과 기록', short: '방문 결과', icon: 'fact_check' },
];
const TITLES = {
  listA: { crumb: '신규 고객 후보' },
  listB: { crumb: '기존 고객 후보(업셀링)' },
  retention: { crumb: '유지고객 대시보드' },
  confirmed: { crumb: '방문 결과 기록' },
};

export default function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [view, setView] = useState('home');
  const [user, setUser] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('bluescan.user') || 'null'); } catch { return null; }
  });
  const [period, setPeriod] = useState('quarter');
  // 시즌별 특화 타깃 — 실제 오늘 날짜 기준 시즌으로 시작하되, 대시보드에서 미리보기로 전환 가능
  const [seasonPreview, setSeasonPreview] = useState(() => currentSeasonKey());
  const floodSeasonOn = seasonPreview === 'flood';
  const [listA] = useState(() => window.APPDATA.listA);
  const [listB] = useState(() => window.APPDATA.listB);
  const [retention] = useState(() => buildRetentionDemo());
  // 유지고객 리포트·감성터칭 발송 상태 — Retention.jsx 로컬 state였던 걸 게이미피케이션 포인트 계산을
  // 위해 App.jsx로 끌어올렸다(다른 화면(대시보드)에서도 참조해야 해서 visits와 같은 위치에 둔다)
  const [reportSentOverrides, setReportSentOverrides] = useState({});
  const markReportSent = useCallback((id) => setReportSentOverrides(prev => ({ ...prev, [id]: new Date().toISOString().slice(0, 10) })), []);
  const [touchOverrides, setTouchOverrides] = useState({});
  const markTouched = useCallback((id) => setTouchOverrides(prev => ({ ...prev, [id]: new Date().toISOString().slice(0, 10) })), []);
  const [visits, setVisits] = useState(() => buildDemoVisits());   // 시연용 방문결과 3건 시드
  const [resultItem, setResultItem] = useState(null);
  const [alertOpen, setAlertOpen] = useState(() => {
    try { return localStorage.getItem('bluescan.alertOpen') !== '0'; } catch { return true; }
  });
  const toggleAlert = useCallback((open) => { setAlertOpen(open); try { localStorage.setItem('bluescan.alertOpen', open ? '1' : '0'); } catch { /* ignore */ } }, []);
  const [userOpen, setUserOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);   // 대시보드 외 화면에서 종 아이콘 드롭다운 알림창
  const [navOpen, setNavOpen] = useState(false);     // 모바일 — 사이드바를 서랍(drawer)으로 열기

  const saveVisit = useCallback((id, rec) => setVisits(prev => ({ ...prev, [id]: rec })), []);
  const removeVisit = useCallback((id) => { setVisits(prev => { const n = { ...prev }; delete n[id]; return n; }); }, []);
  const openResult = useCallback((item) => setResultItem(item), []);

  const recordedSet = useMemo(() => new Set(Object.keys(visits)), [visits]);
  const logCounts = useMemo(() => { const o = {}; for (const [id, v] of Object.entries(visits)) o[id] = Array.isArray(v.logs) ? v.logs.length : (v ? 1 : 0); return o; }, [visits]);
  const recorded = useMemo(() => {
    const out = [];
    listA.forEach(c => { if (visits[c.id]) out.push({ ...c, track: 'A' }); });
    listB.forEach(c => { if (visits[c.id]) out.push({ ...c, track: 'B' }); });
    return out;
  }, [visits, listA, listB]);

  // 게이미피케이션 — 현재 세션 상태를 그대로 읽어 포인트만 계산(별도 저장소 없음)
  const gamify = useMemo(() => computeSessionPoints({ visits, listA, listB, retention, reportSentOverrides, touchOverrides }),
    [visits, listA, listB, retention, reportSentOverrides, touchOverrides]);
  // 포인트가 오르는 순간을 어느 화면에서든 바로 체감하도록, 상단바에 항상 보이는 배지 + "+N" 반짝임을 띄운다
  // (대시보드 탭에 들어가야만 보이던 문제 — 액션을 어디서 하든 즉시 피드백이 있어야 게이미피케이션 효과가 있다)
  const prevPointsRef = useRef(gamify.total);
  const [pointsFlash, setPointsFlash] = useState(null);
  useEffect(() => {
    const diff = gamify.total - prevPointsRef.current;
    prevPointsRef.current = gamify.total;
    if (diff > 0) {
      setPointsFlash(diff);
      const t = setTimeout(() => setPointsFlash(null), 1800);
      return () => clearTimeout(t);
    }
  }, [gamify.total]);

  // 방문 결과·유지고객 액션을 저장하는 "그 순간" 부드러운 톤의 팝업으로 안내한다 — 딱딱한 시스템
  // 알림이 아니라 응원 문구 + 움직이는 아이콘으로. 배지 신규 획득·퀘스트 완료도 같은 방식으로 띄운다.
  const gamifyCtx = useMemo(() => ({ visits, listA, listB, retention, reportSentOverrides, touchOverrides }),
    [visits, listA, listB, retention, reportSentOverrides, touchOverrides]);
  const quests = useMemo(() => questProgress(gamifyCtx), [gamifyCtx]);
  const badges = useMemo(() => badgeStatus(gamifyCtx), [gamifyCtx]);
  const [toasts, setToasts] = useState([]);
  const pushToast = useCallback((t) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, ...t }]);
    setTimeout(() => setToasts(prev => prev.filter(x => x.id !== id)), 4200);
  }, []);
  // 시드로 이미 깔려있는 데모 방문 3건 등 "마운트 시점의 초기값"에는 팝업이 뜨면 안 되므로,
  // 각 effect의 첫 실행에서는 기준값만 저장하고 팝업은 그다음 변화부터 띄운다.
  const prevLabelsRef = useRef(null);
  useEffect(() => {
    const curLabels = new Set(gamify.breakdown.map(b => b.label));
    if (prevLabelsRef.current) {
      gamify.breakdown.forEach(b => { if (!prevLabelsRef.current.has(b.label)) pushToast(pointToast(b.label, b.pts)); });
    }
    prevLabelsRef.current = curLabels;
  }, [gamify.breakdown, pushToast]);
  const prevBadgeIdsRef = useRef(null);
  useEffect(() => {
    const unlockedIds = new Set(badges.filter(b => b.unlocked).map(b => b.id));
    if (prevBadgeIdsRef.current) {
      badges.forEach(b => { if (b.unlocked && !prevBadgeIdsRef.current.has(b.id)) pushToast(badgeToast(b)); });
    }
    prevBadgeIdsRef.current = unlockedIds;
  }, [badges, pushToast]);
  const prevQuestIdsRef = useRef(null);
  useEffect(() => {
    const doneIds = new Set(quests.filter(q => q.done).map(q => q.id));
    if (prevQuestIdsRef.current) {
      quests.forEach(q => { if (q.done && !prevQuestIdsRef.current.has(q.id)) pushToast(questToast(q)); });
    }
    prevQuestIdsRef.current = doneIds;
  }, [quests, pushToast]);

  const download = useCallback(() => {
    const head = ['트랙', '대상', '지역/정보', '점수/선정근거', '방문상태', '메모', '입력일'];
    const rows = recorded.map(c => { const v = visits[c.id];
      const basis = c.track === 'A'
        ? (c.score == null ? 'NO_DATA' : `점수 ${c.score}`)
        : (c.matchCount > 0 ? `방문대상(키워드 ${c.matchCount}종)` : 'NO_DATA');
      return [c.track === 'A' ? 'A신규후보' : 'B기존고객(업셀링)', c.name, c.track === 'A' ? `${c.sigungu} ${c.use}` : `${c.branch} ${c.ind}`,
        basis, v ? VISIT[v.status].label : '미방문', (v?.memo || '').replace(/[\n,]/g, ' '), v?.date || '']; });
    const csv = '﻿' + [head, ...rows].map(r => r.map(x => `"${x}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `방문결과기록_${todayCompact()}.csv`; a.click();
  }, [recorded, visits]);

  // --- 인증 가드: 로그인 전에는 로그인 화면 ---
  if (!user) {
    return <Login onLogin={(u) => { try { sessionStorage.setItem('bluescan.user', JSON.stringify(u)); } catch { /* ignore */ } setUser(u); setView('home'); }} />;
  }
  const role = user.role;
  const isAdmin = role === 'admin';
  // 박팀장(지사 빈값)=본사 전체 관리자 → 전체 조회 / 지사장(지사 지정)=본인 지사만
  const seeAll = isAdmin && !user.branch;
  const logout = () => { try { sessionStorage.removeItem('bluescan.user'); } catch { /* ignore */ } setVisits({}); setUser(null); setView('home'); setUserOpen(false); setNavOpen(false); };

  // --- 지사 필터: 본사 전체 관리자만 전체 조회, 그 외(지사장·컨설턴트)는 본인 지사만 / 수주완료(방문상태=won) 건은 후보 리스트에서 제외 ---
  const visibleA = (seeAll ? listA : listA.filter(c => c.branch === user.branch)).filter(c => visits[c.id]?.status !== 'won');
  const visibleB = (seeAll ? listB : listB.filter(c => c.branch === user.branch)).filter(c => visits[c.id]?.status !== 'won');
  const visRecorded = seeAll ? recorded : recorded.filter(c => c.branch === user.branch);

  const counts = { listA: visibleA.filter(c => !c.excluded && !c.duplicate).length, listB: visibleB.filter(c => c.matchCount > 0).length, retention: retention.length, confirmed: visRecorded.length };
  const persona = { name: user.name, role: seeAll ? '영업 관리자' : (isAdmin ? '지사장' : '영업 컨설턴트'), greet: isAdmin ? '팀 영업 현황과 방문 결과를 한눈에 확인해 봐요.' : '오늘 방문할 타깃을 함께 정해 봐요.' };
  const NAV = [homeNav(role), ...BASE_NAV];
  const crumb = view !== 'home' ? TITLES[view].crumb : (isAdmin ? '관리자 대시보드' : null);

  // --- 영업 알림 (종 아이콘) ---
  const alerts = [];
  const floodN = visibleA.filter(c => c.flood && c.flood.level === '주의').length;
  const expiryN = visibleB.filter(c => c.expirySoon).length;
  if (floodSeasonOn && floodN) alerts.push({ icon: 'water_drop', tone: 'flood', title: `[혹서기·풍수해기] 침수 위험구역 ${floodN}곳 우선 영업`, desc: '장마철 도시침수 예상구역 내 사업장이에요. 재해 대비 보안·관리 수요가 높은 시점 — 우선 방문을 권장해요.', cta: '신규 고객 후보 보기', go: 'listA' });
  if (expiryN) alerts.push({ icon: 'schedule', tone: 'expiry', title: `경비원 계약 만료 임박 ${expiryN}곳`, desc: '인력경비 계약 만료가 도래한 고객처예요. 블루스캔 원격 전환을 제안할 적기 — 기존 고객 후보(업셀링)를 확인하세요.', cta: '기존 고객 후보(업셀링) 보기', go: 'listB' });

  const pageTitle = view === 'home' ? (isAdmin ? '관리자 대시보드' : '컨설턴트 대시보드') : (TITLES[view] && TITLES[view].crumb);

  return (
    <div className="app shell" data-density={t.density}>
      {/* ── 모바일 — 사이드바 서랍 배경 ── */}
      {navOpen && <div className="side-backdrop" onClick={() => setNavOpen(false)} />}
      {/* ── 좌측 사이드바 (디자인 리뉴얼) ── */}
      <aside className={'side' + (navOpen ? ' side--open' : '')}>
        <div className="side__brand" onClick={() => { setView('home'); setNavOpen(false); }}>
          <span className="side__ci"><BrandMark height={22} /></span>
          <BltaMark height={40} className="side__blta" />
        </div>
        <nav className="side__nav">
          {NAV.map(n => (
            <button key={n.key} className="side__item" aria-current={view === n.key} onClick={() => { setView(n.key); setNavOpen(false); }}>
              <MI n={n.icon} s={20} fill={view === n.key} />
              <span className="side__label">{n.short || n.label}</span>
              {n.key === 'listA' && <span className="side__count">{counts.listA}</span>}
              {n.key === 'listB' && <span className="side__count">{counts.listB}</span>}
              {n.key === 'retention' && <span className="side__count">{counts.retention}</span>}
              {n.key === 'confirmed' && counts.confirmed > 0 && <span className="side__count">{counts.confirmed}</span>}
            </button>
          ))}
        </nav>
        <div className="side__foot">
          <div className="branchchip" title={seeAll ? '전체 지사 조회' : '본인 지사만 조회'}>
            <MI n={seeAll ? 'groups' : 'store'} s={18} />{seeAll ? '전체 지사' : user.branch}
          </div>
          <div className="side__userrow">
            <button className="side__user" onClick={() => setUserOpen(v => !v)}>
              <MI n="account_circle" s={28} />
              <span className="side__usertxt"><b>{persona.name}</b><small>{persona.role}</small></span>
            </button>
            <button className="side__logout" title="로그아웃" onClick={logout}><MI n="logout" s={18} /></button>
          </div>
          {userOpen && (
            <div className="side__menu">
              <div style={{ padding: '10px', font: 'var(--type-12r)', color: 'var(--text-tertiary)' }}>{persona.name} · {isAdmin ? (seeAll ? '전체' : user.branch) : user.branch}<br />사번 {user.empno}</div>
              {['내 정보', '환경 설정', '로그아웃'].map((x, i) => (
                <div key={i} onMouseDown={e => e.preventDefault()} onClick={() => x === '로그아웃' ? logout() : setUserOpen(false)}
                  style={{ padding: '10px', borderRadius: 'var(--radius-s)', cursor: 'pointer', font: 'var(--type-14r)', color: x === '로그아웃' ? 'var(--s1-red-500)' : 'var(--text-body)' }}>{x}</div>))}
            </div>)}
        </div>
      </aside>

      {/* ── 우측 콘텐츠 컬럼 ── */}
      <div className="content">
        <header className="topbar">
          <div className="topbar__crumb">
            <button className="topbar__menu" aria-label="메뉴 열기" onClick={() => setNavOpen(true)}><MI n="menu" s={22} /></button>
            {view !== 'home' && (<><span className="bc-link" onClick={() => setView('home')}>홈</span><MI n="chevron_right" s={16} /></>)}
            <span className="topbar__cur">{pageTitle}</span>
          </div>
          <div className="topbar__right">
            <span className="topbar__date"><MI n="schedule" s={16} />2026.06.11</span>
            <button className="topbar__points" title="이번 세션 활동 포인트 — 방문 결과 입력, 유지고객 리포트·감성터칭 발송 시 올라가요" onClick={() => setView('home')}>
              <MI n="stars" s={18} fill />
              <span className="tnum">{gamify.total}P</span>
              {pointsFlash != null && <span className="topbar__points-flash">+{pointsFlash}</span>}
            </button>
            <div className="topbar__bellwrap">
              <button className="topbar__icon" title="영업 알림" aria-expanded={view === 'home' ? alertOpen : bellOpen}
                onClick={() => view === 'home' ? toggleAlert(!alertOpen) : setBellOpen(o => !o)}>
                <MI n="notifications" s={20} fill={view !== 'home' && bellOpen} />{alerts.length > 0 && <span className="topbar__badge">{alerts.length}</span>}
              </button>
              {view !== 'home' && bellOpen && (
                <div className="topbar__alertpop">
                  <div className="topbar__alertpop-head">
                    <span className="topbar__alertpop-title"><MI n="notifications_active" s={18} fill />영업 알림 {alerts.length > 0 && <em>{alerts.length}</em>}</span>
                    <button className="topbar__alertpop-x" title="접기" onClick={() => setBellOpen(false)}><MI n="expand_less" s={18} /></button>
                  </div>
                  <div className="topbar__alertpop-list">
                    {alerts.length === 0
                      ? <div className="alertitem alertitem--muted"><MI n="check_circle" s={18} /><span>지금 우선 처리할 영업 알림은 없어요.</span></div>
                      : alerts.map((a, i) => (
                        <button key={i} className={'alertitem alertitem--' + a.tone} onClick={() => { setView(a.go); setBellOpen(false); }}>
                          <MI n={a.icon} s={18} />
                          <span className="alertitem__txt"><b>{a.title}</b><span>{a.desc}</span></span>
                          <span className="alertitem__cta">{a.cta}<MI n="chevron_right" s={18} /></span>
                        </button>))}
                  </div>
                </div>)}
            </div>
            <button className="topbar__icon" title="도움말"><MI n="help" s={20} /></button>
          </div>
        </header>

      {view === 'home' && (alertOpen ? (
        <div className="pc-alertbar"><div className="pc-wrap"><div className="pc-alertbar__inner">
          <div className="pc-alertbar__bell">
            <MI n="notifications_active" s={22} fill />
            {alerts.length > 0 && <span className="pc-alertbar__count">{alerts.length}</span>}
          </div>
          <div className="pc-alertbar__title">영업 알림</div>
          <div className="pc-alertbar__list">
            {alerts.length === 0
              ? <div className="alertitem alertitem--muted"><MI n="check_circle" s={18} /><span>지금 우선 처리할 영업 알림은 없어요. 신규 고객 후보·기존 고객 후보(업셀링)를 확인해 보세요.</span></div>
              : alerts.map((a, i) => (
                <button key={i} className={'alertitem alertitem--' + a.tone} onClick={() => setView(a.go)}>
                  <MI n={a.icon} s={18} />
                  <span className="alertitem__txt"><b>{a.title}</b><span>{a.desc}</span></span>
                  <span className="alertitem__cta">{a.cta}<MI n="chevron_right" s={18} /></span>
                </button>))}
          </div>
          <button className="pc-alertbar__x" onClick={() => toggleAlert(false)} title="접기"><MI n="expand_less" s={20} /></button>
        </div></div></div>
      ) : (
        <div className="pc-alertbar pc-alertbar--collapsed"><div className="pc-wrap">
          <button className="pc-alertbar__chip" onClick={() => toggleAlert(true)} title="영업 알림 펼치기">
            <span className="pc-alertbar__bell pc-alertbar__bell--sm">
              <MI n="notifications_active" s={18} fill />
              {alerts.length > 0 && <span className="pc-alertbar__count">{alerts.length}</span>}
            </span>
            영업 알림 {alerts.length}건 <MI n="expand_more" s={18} />
          </button>
        </div></div>
      ))}

      <main className="pc-main">
        <ErrorBoundary key={view}>
          {view === 'home' && isAdmin && <AdminDash onNav={setView} user={user} seeAll={seeAll} listA={visibleA} listB={visibleB} recorded={visRecorded} />}
          {view === 'home' && !isAdmin && <SalesDash persona={persona} onNav={setView} listA={visibleA} listB={visibleB} retention={retention} recorded={visRecorded} visits={visits} onResult={openResult} seasonPreview={seasonPreview} onSeasonPreview={setSeasonPreview} floodSeasonOn={floodSeasonOn} gamify={gamify} reportSentOverrides={reportSentOverrides} touchOverrides={touchOverrides} myEmpno={user.empno} myBranch={user.branch} />}
          {view === 'listA' && <ListAScreen data={visibleA} onResult={openResult} recordedSet={recordedSet} logCounts={logCounts} listMode={t.listMode} onListMode={(m) => setTweak('listMode', m)} floodSeasonOn={floodSeasonOn} />}
          {view === 'listB' && <ListBScreen data={visibleB} onResult={openResult} recordedSet={recordedSet} logCounts={logCounts} visits={visits} listMode={t.listMode} onListMode={(m) => setTweak('listMode', m)} floodSeasonOn={floodSeasonOn} />}
          {view === 'retention' && <RetentionScreen data={retention} listMode={t.listMode} onListMode={(m) => setTweak('listMode', m)}
            reportSentOverrides={reportSentOverrides} onMarkReportSent={markReportSent}
            touchOverrides={touchOverrides} onMarkTouched={markTouched} />}
          {view === 'confirmed' && <ConfirmedScreen confirmed={visRecorded} visits={visits} onVisit={saveVisit} onRemove={removeVisit} onDownload={download} onResult={openResult} />}
        </ErrorBoundary>
      </main>

      <footer className="pc-footer"><div className="pc-footer__inner">
        <div className="pc-footer__links"><a className="strong">이용약관</a><a>개인정보 처리방침</a><a>위치기반 서비스 이용약관</a></div>
        <div className="pc-footer__info">(주)에스원 · 블루스캔 타깃 발굴 (실습 버전) · 점수는 영업 우선순위 참고 신호이며 최종 판단은 담당자가 합니다.</div>
        <div className="pc-footer__copy">© S-1 Corp. 데모 목업 — 실명·연락처·계약 등 민감정보는 포함하지 않습니다.</div>
      </div></footer>
      </div>{/* /.content */}

      {resultItem && <VisitDialog item={resultItem} initial={visits[resultItem.id]}
        onClose={() => setResultItem(null)} onSave={(id, rec) => saveVisit(id, rec)} />}

      {/* 결과 저장 순간의 부드러운 응원 팝업 — 움직이는 아이콘 + 다정한 문구, 몇 초 뒤 자동으로 사라짐 */}
      <div className="gm-toaststack">
        {toasts.map(tst => (
          <div key={tst.id} className={'gm-toast gm-toast--' + tst.tone}>
            <span className="gm-toast__ico"><MI n={tst.icon} s={26} fill /></span>
            <div className="gm-toast__body">
              <div className="gm-toast__title">{tst.title}</div>
              <div className="gm-toast__sub">{tst.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
