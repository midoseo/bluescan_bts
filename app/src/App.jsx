/* ===== App.jsx — root: S-1 GNB shell, routing, state ===== */
import React from 'react'
import { useTweaks } from './useTweaks.js'
import { MI, VISIT, BrandMark, BltaMark, tierOf } from './components.jsx'
import { AdminDash, SalesDash } from './screens/Dash.jsx'
import { augmentRetention, needsAttention } from './screens/Retention.jsx'
import { ListAScreen } from './screens/ListA.jsx'
import { ListBScreen } from './screens/ListB.jsx'
import { PipelineScreen } from './screens/Pipeline.jsx'
import { ConfirmedScreen } from './screens/Confirmed.jsx'
import { RetentionScreen } from './screens/Retention.jsx'
import { ActivityScreen } from './screens/Activity.jsx'
import { InsightScreen } from './screens/Insight.jsx'
import { VisitDialog } from './screens/Visit.jsx'
import { Login } from './screens/Login.jsx'
import { scoreExisting } from './upsellScore.js'
import { buildDemoVisits } from './demoVisits.js'
import { seedVisitsFromActivity } from './sampleActivity.js'
import { currentSeasonKey } from './season.js'
import { buildSeogangRetention } from './retentionSeogang.generated.js'
import { buildSeogangListB } from './pipelineSeogang.generated.js'
import { ScrollHint } from './ScrollHint.jsx'
import { computeSessionPoints, questProgress, badgeStatus } from './gamification.js'
import { pointToast, badgeToast, questToast } from './toastMessages.js'
import { todayCompact, businessDayOfMonth, businessDaysInMonth } from './dateUtil.js'
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
  ? { key: 'home', label: '관리자 대시보드', short: '홈', icon: 'space_dashboard' }
  : { key: 'home', label: '컨설턴트 대시보드', short: '홈', icon: 'space_dashboard' };
const BASE_NAV = [
  { key: 'retention', label: '유지관리현황', short: '유지관리현황', icon: 'shield_with_heart' },
  { key: 'pipeline', label: '신규진행현황', short: '신규진행현황', icon: 'travel_explore' },
  { key: 'confirmed', label: '영업활동관리', short: '영업활동관리', icon: 'fact_check' },
  { key: 'activity', label: '미션 & 랭킹', short: '미션 & 랭킹', icon: 'military_tech' },
  { key: 'insight', label: '인사이트', short: '인사이트', icon: 'insights' },
];
const TITLES = {
  pipeline: { crumb: '신규진행현황' },
  listA: { crumb: '신규 고객 후보' },
  listB: { crumb: '기존 고객 후보(업셀링)' },
  retention: { crumb: '유지관리현황' },
  confirmed: { crumb: '영업활동관리' },
  activity: { crumb: '미션 & 랭킹' },
  insight: { crumb: '인사이트' },
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
  // 서강지사 물건은 계약원장 실데이터(경비원·전산실 보유 업셀 후보)로 덮어쓰고, 그 외 지사는 기존 시드 유지
  const [listB] = useState(() => [...window.APPDATA.listB.filter(c => c.branch !== '서강지사'), ...buildSeogangListB()]);
  const [retention] = useState(() => buildSeogangRetention());
  // 유지고객 리포트·감성터칭 발송 상태 — Retention.jsx 로컬 state였던 걸 게이미피케이션 포인트 계산을
  // 위해 App.jsx로 끌어올렸다(다른 화면(대시보드)에서도 참조해야 해서 visits와 같은 위치에 둔다)
  const [reportSentOverrides, setReportSentOverrides] = useState({});
  const markReportSent = useCallback((id) => setReportSentOverrides(prev => ({ ...prev, [id]: new Date().toISOString().slice(0, 10) })), []);
  const [touchOverrides, setTouchOverrides] = useState({});
  const markTouched = useCallback((id) => setTouchOverrides(prev => ({ ...prev, [id]: new Date().toISOString().slice(0, 10) })), []);
  // 시연용 방문결과 시드 + 영업활동관리(SAMPLE_ACTIVITY) 방문기록을 실제 후보와 매칭해 주입 →
  // 신규진행현황·확정·지도와 단일 소스로 연동(예: 경성중고 '거절'이 양쪽에 일관 표시)
  const [visits, setVisits] = useState(() => ({ ...buildDemoVisits(), ...seedVisitsFromActivity(listA, listB) }));
  const [resultItem, setResultItem] = useState(null);
  const [retInitCat, setRetInitCat] = useState('all');   // 홈 → 유지관리현황 진입 시 초기 KPI 필터
  const [pipeInitTier, setPipeInitTier] = useState('all'); // 홈 → 신규진행현황 진입 시 초기 등급 필터
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
  // 전부 실데이터 — 기존 고객도 개수 제한 없이 전건 노출(점수순 정렬).
  // 같은 건물 중복 제거 (건축물대장 동·호 단위 중복 방지) — 건물명+주소 기준
  const _dedupe = (arr) => { const seen = new Set(); return arr.filter(c => { const k = `${c.name}|${c.address}`; if (seen.has(k)) return false; seen.add(k); return true; }); };
  // 건물 단위 주소 키 (괄호·동/관 등 보조표기 제거)
  const _bldgKey = (a) => String(a || '').replace(/\(.*?\)/g, '').replace(/[,·].*$/, '').replace(/\s+/g, '').toLowerCase();
  // 이미 블루스캔(유지관리) 사용 중인 건물 — 업셀 후보에서 제외 (같은 건물 재제안 방지)
  const _blueScanBldg = new Set(retention.map(r => _bldgKey(r.address)));
  const _rawA = _dedupe((seeAll ? listA : listA.filter(c => c.branch === user.branch)).filter(c => visits[c.id]?.status !== 'won'));
  // 기존 고객: 블루스캔 사용 건물 제외 → 규칙 기반 점수 부여 후 정렬 → 전건 노출(실명·우량 건물이 상위로)
  const _rawB = _dedupe((seeAll ? listB : listB.filter(c => c.branch === user.branch))
    .filter(c => visits[c.id]?.status !== 'won')
    .filter(c => !_blueScanBldg.has(_bldgKey(c.address))))
    .map(c => (c.score != null ? c : { ...c, ...scoreExisting(c) }));
  const visibleA = seeAll ? _rawA : _rawA.slice().sort((a, b) => (b.score ?? -1) - (a.score ?? -1));  // 신규 후보 전건(페이지네이션으로 표시)
  const visibleB = seeAll ? _rawB : _rawB.slice().sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
  const visRecorded = seeAll ? recorded : recorded.filter(c => c.branch === user.branch);

  const cntA = visibleA.filter(c => !c.excluded && !c.duplicate).length;
  const counts = { listA: cntA, listB: visibleB.filter(c => c.matchCount > 0).length, pipeline: cntA + visibleB.length, retention: retention.length, confirmed: visRecorded.length };
  // 신규진행현황용 통합 데이터 — 신규(track A)는 그대로, 기존(track B)은 우선접촉=100 / 단일유형=92 점수 부여
  const pipelineData = [
    ...visibleA.map(c => ({ ...c, track: 'A' })),
    // 기존 고객: 데이터에 score가 있으면 그대로, 없으면 규칙 기반 스코어링(계약만료·경비규모·중요실·매칭)으로 점수+구성 산출
    ...visibleB.map(c => {
      if (c.score != null) return { ...c, track: 'B' };
      const { score, comps } = scoreExisting(c);
      return { ...c, track: 'B', score, comps };
    }),
  ];
  const persona = { name: user.name, role: seeAll ? '영업 관리자' : (isAdmin ? '지사장' : '영업 컨설턴트'), greet: isAdmin ? '팀 영업 현황과 방문 결과를 한눈에 확인해 봐요.' : '오늘 방문할 타깃을 함께 정해 봐요.' };
  const NAV = [homeNav(role), ...BASE_NAV];
  const crumb = view !== 'home' ? TITLES[view].crumb : (isAdmin ? '관리자 대시보드' : null);

  // --- 영업 알림 (종 아이콘) ---
  const alerts = [];
  const floodN = visibleA.filter(c => c.flood && c.flood.level === '주의').length;
  const expiryN = visibleB.filter(c => c.expirySoon).length;
  if (floodSeasonOn && floodN) alerts.push({ icon: 'water_drop', tone: 'flood', title: `[혹서기·풍수해기] 침수 위험구역 ${floodN}곳 우선 영업`, desc: '장마철 도시침수 예상구역 내 사업장이에요. 재해 대비 보안·관리 수요가 높은 시점 — 우선 방문을 권장해요.', cta: '신규진행현황 보기', go: 'pipeline' });
  if (expiryN) alerts.push({ icon: 'schedule', tone: 'expiry', title: `경비원 계약 만료 임박 ${expiryN}곳`, desc: '인력경비 계약 만료가 도래한 고객처예요. 블루스캔 원격 전환을 제안할 적기 — 신규진행현황에서 기존 고객을 확인하세요.', cta: '신규진행현황 보기', go: 'pipeline' });

  const pageTitle = view === 'home' ? (isAdmin ? '관리자 대시보드' : '컨설턴트 대시보드') : (TITLES[view] && TITLES[view].crumb);

  // --- 홈 좌측 "오늘 할 일" — 유지관리·신규진행·미션 화면의 핵심만 뽑아 클릭 시 해당 화면(필터 적용)으로 이동 ---
  const _retAug = augmentRetention(retention);
  const _retAttn = _retAug.filter(c => needsAttention(c).flag).length;
  const _retExpiry = _retAug.filter(c => c.expirySoon).length;
  const _retManage = _retAug.filter(c => c.manageNeeded).length;
  const _bothN = pipelineData.filter(c => c.track === 'B' && c.btype === 'both').length;
  const _topN = pipelineData.filter(c => tierOf(c.score).key === 'S').length;
  const _questsDone = quests.filter(q => q.done).length;
  const goRetention = (cat) => { setRetInitCat(cat); setView('retention'); };
  const goPipeline = (tier) => { setPipeInitTier(tier); setView('pipeline'); };
  const homeTodos = [
    _retAttn > 0 && { icon: 'warning', tone: 'danger', label: '주의 필요 유지고객', n: _retAttn, unit: '곳', act: () => goRetention('attn') },
    _retExpiry > 0 && { icon: 'event_busy', tone: 'warn', label: '계약 만료 임박', n: _retExpiry, unit: '곳', act: () => goRetention('expiry') },
    _bothN > 0 && { icon: 'priority_high', tone: 'warn', label: '우선접촉 대상', n: _bothN, unit: '곳', act: () => goPipeline('both') },
    { icon: 'star', tone: '', label: '최우선 신규 후보', n: _topN, unit: '곳', act: () => goPipeline('S') },
    _retManage > 0 && { icon: 'monitor_heart', tone: '', label: '신호 관리필요', n: _retManage, unit: '곳', act: () => goRetention('manage') },
    { icon: 'military_tech', tone: '', label: '이번주 퀘스트', n: `${_questsDone}/${quests.length}`, unit: '', act: () => setView('activity') },
  ].filter(Boolean).slice(0, 6);

  // 헤더 날짜 — 오늘(실행 시점) + 이달 영업일수 경과
  const _now = new Date();
  const p2 = (x) => String(x).padStart(2, '0');
  const todayStr = `${_now.getFullYear()}.${p2(_now.getMonth() + 1)}.${p2(_now.getDate())}`;
  const dow = ['일', '월', '화', '수', '목', '금', '토'][_now.getDay()];
  const bizDay = businessDayOfMonth(_now);
  const bizTotal = businessDaysInMonth(_now);
  const bizLeft = Math.max(0, bizTotal - bizDay);
  const bizPct = bizTotal ? Math.round((bizDay / bizTotal) * 100) : 0;
  const bizLeftPct = bizTotal ? Math.round((bizLeft / bizTotal) * 100) : 0;

  return (
    <div className="app appv2" data-density={t.density}>
      {/* ── 상단 헤더 (브랜드 + 우측 날짜/알림/이름/로그아웃 + 탭 메뉴) ── */}
      <header className="hdr">
        <div className="hdr__row">
          <div className="hdr__brand" onClick={() => setView('home')} title="홈으로">
            <BrandMark height={34} />
            <span className="hdr__word">블루스캔 <b>BTS</b></span>
          </div>
          <div className="hdr__right">
            <span className="hdr__date" title="오늘 날짜(요일) · 이달 영업일수 · 경과 일차/진행률 · 남은 일수/비율">
              <MI n="calendar_month" s={18} />{todayStr} ({dow}) · 영업일수 {bizTotal}일 {bizDay}일차({bizPct}%) · 남은일수 {bizLeft}일 ({bizLeftPct}%)
            </span>
            <div className="hdr__bellwrap">
              <button className="hdr__icon" title="영업 알림" aria-expanded={bellOpen} onClick={() => setBellOpen(o => !o)}>
                <MI n="notifications" s={20} fill={bellOpen} /><span className="hdr__iconlab">알림</span>
                {alerts.length > 0 && <span className="hdr__badge">{alerts.length}</span>}
              </button>
              {bellOpen && (
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
            <button className="hdr__logout" onClick={logout}><MI n="logout" s={18} />로그아웃</button>
          </div>
        </div>
        <nav className="hdr__tabs">
          {NAV.map(n => (
            <button key={n.key} className="hdr__tab" aria-current={view === n.key} onClick={() => setView(n.key)}>
              <MI n={n.icon} s={20} fill={view === n.key} />
              <span>{n.short || n.label}</span>
              {n.key === 'pipeline' && <span className="hdr__tabcount">{counts.pipeline}</span>}
              {n.key === 'retention' && <span className="hdr__tabcount">{counts.retention}</span>}
              {n.key === 'confirmed' && counts.confirmed > 0 && <span className="hdr__tabcount">{counts.confirmed}</span>}
            </button>
          ))}
        </nav>
      </header>

      <main className="appv2__main">
        <ErrorBoundary key={view}>
          {view === 'home' ? (
            <div className="homewrap">
              {/* 좌측 패널 — 유지관리 핵심(활동 점수 + KPI). 카드 클릭 시 유지관리현황을 해당 필터로 진입 */}
              <aside className="hsummary">
                <div className="hsummary__score">
                  <div className="hsummary__who">{persona.name} 님 · {seeAll ? '전체 지사' : user.branch}</div>
                  <div className="hsummary__pts"><MI n="stars" s={22} fill /><span className="tnum">{gamify.total}P</span></div>
                  <div className="hsummary__ptssub">오늘의 활동 점수</div>
                </div>
                <div className="hsummary__label">오늘 할 일</div>
                {homeTodos.map((it, i) => (
                  <button key={i} className={'hsummary__card' + (it.tone ? ' hsummary__card--' + it.tone : '')} onClick={it.act}>
                    <span className="hsummary__k"><MI n={it.icon} s={18} />{it.label}</span>
                    <b>{it.n}{it.unit && <i>{it.unit}</i>}</b>
                  </button>
                ))}
              </aside>
              <div className="hcol">
                {isAdmin
                  ? <AdminDash onNav={setView} user={user} seeAll={seeAll} listA={visibleA} listB={visibleB} recorded={visRecorded} />
                  : <SalesDash persona={persona} onNav={setView} onGoRetention={goRetention} listA={visibleA} listB={visibleB} retention={retention} recorded={visRecorded} visits={visits} onResult={openResult} />}
              </div>
            </div>
          ) : (
            <>
              {view === 'pipeline' && <PipelineScreen data={pipelineData} onResult={openResult} recordedSet={recordedSet} logCounts={logCounts} visits={visits} floodSeasonOn={floodSeasonOn} initTier={pipeInitTier} />}
              {view === 'listA' && <ListAScreen data={visibleA} onResult={openResult} recordedSet={recordedSet} logCounts={logCounts} listMode={t.listMode} onListMode={(m) => setTweak('listMode', m)} floodSeasonOn={floodSeasonOn} />}
              {view === 'listB' && <ListBScreen data={visibleB} onResult={openResult} recordedSet={recordedSet} logCounts={logCounts} visits={visits} listMode={t.listMode} onListMode={(m) => setTweak('listMode', m)} floodSeasonOn={floodSeasonOn} />}
              {view === 'retention' && <RetentionScreen data={retention} listMode={t.listMode} onListMode={(m) => setTweak('listMode', m)}
                initCat={retInitCat}
                reportSentOverrides={reportSentOverrides} onMarkReportSent={markReportSent}
                touchOverrides={touchOverrides} onMarkTouched={markTouched} />}
              {view === 'confirmed' && <ConfirmedScreen confirmed={visRecorded} visits={visits} onVisit={saveVisit} onRemove={removeVisit} onDownload={download} onResult={openResult}
                retention={retention} reportSentOverrides={reportSentOverrides} touchOverrides={touchOverrides} />}
              {view === 'activity' && <ActivityScreen gamify={gamify} visits={visits} listA={visibleA} listB={visibleB} retention={retention} reportSentOverrides={reportSentOverrides} touchOverrides={touchOverrides} myEmpno={user.empno} myBranch={user.branch} />}
              {view === 'insight' && <InsightScreen />}
            </>
          )}
        </ErrorBoundary>
      </main>

      <ScrollHint />

      <footer className="appv2__footer">
        (주)에스원 · 블루스캔 BTS · 점수는 영업 우선순위 참고 신호이며 최종 판단은 담당자가 합니다.
      </footer>

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
