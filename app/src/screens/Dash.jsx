/* ===== Dash.jsx — 관리자/컨설턴트 대시보드 ===== */
import React from 'react'
import { MI, VISIT } from '../components.jsx'
import { GroupedBar, Radar } from '../charts.jsx'
import { buildFireDispatchDemo } from '../fireDispatch.demo.js'
import { SEASON_DEF, SEASON_ORDER } from '../season.js'
import { augmentListBFlood } from '../floodRisk.js'
import { questProgress, badgeStatus, buildLeaderboard } from '../gamification.js'
const { useState, useRef } = React

const DS = window.UXDesignSystem_59a60b;
const { Card: DCard, Badge: DBadge, Button: DBtn, TextField: DText, Select: DSel, Textarea: DTa } = DS;

const toneOf = (t) => ({ success: 'positive', info: 'info', warning: 'warning', danger: 'danger', neutral: 'neutral' }[t] || 'neutral');

function DashCard({ title, sub, action, children, className }) {
  return (
    <DCard variant="line" className={className}>
      <div className="dashhead">
        <div><div className="dashhead__t">{title}</div>{sub && <div className="dashhead__s">{sub}</div>}</div>
        {action && <div className="dashhead__a">{action}</div>}
      </div>
      {children}
    </DCard>
  );
}
function SpecKpi({ label, value, tag }) {
  return (
    <div className="bkpi">
      <div className="bkpi__label" style={{ marginBottom: 8 }}>{label}</div>
      <div className="bkpi__val tnum" style={{ marginBottom: 8 }}>{value}</div>
      {tag && <DBadge tone={toneOf(tag.tone)} shape="pill">{tag.text}</DBadge>}
    </div>
  );
}
function SimpleTable({ cols, rows }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="s1table">
        <thead><tr>{cols.map((c, i) => <th key={i} className={c.c ? 'c' : ''}>{c.label}</th>)}</tr></thead>
        <tbody>{rows.map((r, ri) => (
          <tr key={ri}>{r.map((cell, ci) => <td key={ci} className={cols[ci].c ? 'c' : ''}>{cell}</td>)}</tr>))}</tbody>
      </table>
    </div>
  );
}
const B = (text, tone) => <DBadge tone={toneOf(tone)} shape="pill">{text}</DBadge>;

/* 컨설턴트별 실적 (원본 데이터 — 테이블 + CSV 공용) */
const ADMIN_SALES = [
  ['김민준', '서울 강남', 24, 38500, '41.7%', '112%', 'success'],
  ['이서연', '서울 강북', 19, 29200, '36.8%', '96%', 'info'],
  ['박도현', '경기 남부', 22, 34100, '40.9%', '108%', 'success'],
  ['최지우', '경기 북부', 17, 24600, '32.4%', '88%', 'warning'],
  ['정하늘', '인천', 15, 21300, '28.6%', '79%', 'warning'],
  ['오지수', '부산', 18, 26800, '33.3%', '91%', 'info'],
  ['한민서', '대구', 12, 18900, '25.0%', '71%', 'danger'],
  ['윤재원', '광주', 14, 20400, '28.6%', '83%', 'warning'],
];

/* 섹션 순서 드래그 — 컨설턴트 대시보드와 동일한 동작을 재사용 (포인터 기반). Retention.jsx에서도 그대로 재사용한다. */
export function useSectionOrder(sections, storageKey) {
  const [order, setOrder] = useState(() => {
    try { const s = JSON.parse(localStorage.getItem(storageKey) || 'null'); if (Array.isArray(s)) { const f = s.filter(k => sections.includes(k)); return [...f, ...sections.filter(k => !f.includes(k))]; } } catch { /* ignore */ }
    return sections;
  });
  const wrapRef = useRef(null);
  const [draggingKey, setDraggingKey] = useState(null);
  const persist = (next) => { try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* ignore */ } };
  const resetOrder = () => { setOrder(sections); persist(sections); };
  const beginDrag = (e, key) => {
    e.preventDefault();
    setDraggingKey(key);
    document.body.classList.add('dash-dragging');
    const move = (ev) => {
      const wrap = wrapRef.current; if (!wrap) return;
      const els = [...wrap.querySelectorAll('.dash-sec')];
      let overKey = null;
      for (const el of els) { const r = el.getBoundingClientRect(); if (ev.clientY >= r.top && ev.clientY <= r.bottom) { overKey = el.dataset.key; break; } }
      if (!overKey && els.length) {
        const first = els[0].getBoundingClientRect(), last = els[els.length - 1].getBoundingClientRect();
        if (ev.clientY < first.top) overKey = els[0].dataset.key;
        else if (ev.clientY > last.bottom) overKey = els[els.length - 1].dataset.key;
      }
      if (overKey && overKey !== key) {
        setOrder(prev => { const from = prev.indexOf(key), to = prev.indexOf(overKey); if (from < 0 || to < 0 || from === to) return prev; const next = [...prev]; next.splice(to, 0, next.splice(from, 1)[0]); return next; });
      }
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      document.body.classList.remove('dash-dragging');
      setDraggingKey(null);
      setOrder(cur => { persist(cur); return cur; });
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  return { order, wrapRef, draggingKey, beginDrag, resetOrder };
}

/* 드래그 가능한 섹션 목록 렌더 */
export function SectionList({ ctrl, titles, blocks }) {
  const { order, wrapRef, draggingKey, beginDrag } = ctrl;
  return (
    <div ref={wrapRef}>
      {order.map(key => (
        <div key={key} data-key={key} className={'dash-sec' + (draggingKey === key ? ' dash-sec--dragging' : '')}>
          <div className="dash-sec__bar" onPointerDown={e => beginDrag(e, key)}>
            <MI n="drag_indicator" s={18} /><span className="dash-sec__name">{titles[key]}</span>
            <span className="faint dash-sec__hint">드래그하여 순서 변경</span>
          </div>
          <div className="dash-sec__body">{blocks[key]}</div>
        </div>
      ))}
    </div>
  );
}

const ADMIN_SECTIONS = ['kpis', 'charts', 'activity'];
const ADMIN_SEC_TITLE = { kpis: '핵심 지표', charts: '지역·실적', activity: '컨설턴트 활동 입력' };
const BRANCH_SECTIONS = ['kpis', 'goals', 'roster'];
const BRANCH_SEC_TITLE = { kpis: '핵심 지표', goals: '지사 목표 달성 현황', roster: '소속 컨설턴트 실적' };

/* 컨설턴트별 시연용 실적 — 사번 기반 결정적 생성(새로고침해도 동일). 실데이터 연동 시 이 함수만 교체.
   실적/정렬 기준 = 계약 건수 (동률이면 방문 → 담당 후보 순).
   period: 'prev'(전월) | 'this'(당월) | 'quarter'(분기) — 담당 후보는 현재값으로 고정, 방문·계약은 기간 활동량. */
function consultantPerf(consultants, period = 'quarter') {
  const seed = (s) => { let h = 0; const t = String(s); for (let i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) >>> 0; return h; };
  const isQ = period === 'quarter';
  return consultants.map(c => {
    const h = seed(c.empno);                                 // 사번 고정 시드
    const hp = seed(c.empno + ':' + period);                 // 기간별 시드
    const cand = 3 + (h % 12);                               // 담당 후보 3~14 (기간 무관, 현재 담당)
    const visit = isQ ? 4 + (hp % 9) : 1 + (hp % 4);         // 방문: 분기 4~12 / 월 1~4
    const r = hp % 100;
    const deal = isQ ? (r < 10 ? 2 : r < 32 ? 1 : 0)         // 계약(분기): 대부분 0, 일부 1~2
                     : (r < 8 ? 1 : 0);                       // 계약(월): 더 희소
    return { name: c.name, empno: c.empno, cand, visit, deal };
  }).sort((a, b) => b.deal - a.deal || b.visit - a.visit || b.cand - a.cand);
}

/* ============ 관리자 대시보드 ============ */
export function AdminDash({ onNav, user, seeAll = true, listA = [], listB = [], recorded = [] }) {
  const [period, setPeriod] = useState('quarter');
  const [goalPeriod, setGoalPeriod] = useState('quarter');      // 지사 목표 달성 현황 기간 (독립)
  const [rosterPeriod, setRosterPeriod] = useState('quarter');  // 소속 컨설턴트 실적 기간 (독립)
  const [rosterOpen, setRosterOpen] = useState(false);          // 6명 이상 더보기/접기
  // 두 뷰 모두에서 훅을 항상 호출 (React 훅 규칙) — 별도 저장키로 순서 분리
  const branchCtrl = useSectionOrder(BRANCH_SECTIONS, 'bluescan.branchDashOrder');
  const allCtrl = useSectionOrder(ADMIN_SECTIONS, 'bluescan.adminDashOrder');

  /* ----- 지사장(본인 지사) 대시보드 — 실데이터 항목만 표시 ----- */
  if (!seeAll) {
    const branch = user?.branch || '';
    const consultants = (window.APP_ACCOUNTS || []).filter(a => a.role === 'consultant' && a.branch === branch);
    const newCnt = listA.filter(c => !c.excluded && !c.duplicate).length;
    const upCnt = listB.filter(c => c.matchCount > 0).length;
    const recordedN = recorded.length;
    const downloadRoster = () => {
      const head = ['지사', '컨설턴트', '사번'];
      const rows = consultants.map(c => [branch, c.name, c.empno]);
      const csv = '﻿' + [head, ...rows].map(r => r.map(x => `"${x}"`).join(',')).join('\n');
      const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
      a.download = `${branch}_컨설턴트명단.csv`; a.click();
    };
    const PERIOD_LABEL = { prev: '전월', this: '당월', quarter: '분기' };
    // --- 소속 컨설턴트 실적 (rosterPeriod, 독립) ---
    const perf = consultantPerf(consultants, rosterPeriod);
    const maxDeal = Math.max(1, ...perf.map(p => p.deal));
    const shownPerf = rosterOpen ? perf : perf.slice(0, 5);   // 최대 5명, 더보기 시 전체
    // --- 지사 목표 달성 현황 (goalPeriod, 독립) — 계약 전환 = 해당 기간 컨설턴트 계약 합계 ---
    const isQg = goalPeriod === 'quarter';
    const goalDeals = consultantPerf(consultants, goalPeriod).reduce((s, p) => s + p.deal, 0);
    const discoverCur = isQg ? newCnt : Math.round(newCnt / 3);
    const roundTarget = (n) => Math.max(isQg ? 100 : 40, Math.ceil((n + 1) / 10) * 10);
    const GOALS = [
      { label: '계약 전환', cur: goalDeals, target: isQg ? 30 : 10, color: '#1d6ceb' },        // 파랑 (해당 기간 계약 합계)
      { label: '제안 진행', cur: isQg ? 14 : 5, target: isQg ? 25 : 9, color: '#ff761a' },     // 주황
      { label: '신규 발굴', cur: discoverCur, target: roundTarget(discoverCur), color: '#1fb279' }, // 초록 (분기 현재값=실제 후보 건수)
    ];
    const blocks = {
      kpis: (
        <div className="bkpis">
          <SpecKpi label="소속 컨설턴트" value={consultants.length + '명'} tag={{ text: branch, tone: 'info' }} />
          <SpecKpi label="기존 고객 후보(업셀링)" value={upCnt + '건'} tag={{ text: '계약 전환 대상', tone: 'warning' }} />
          <SpecKpi label="신규 고객 후보" value={newCnt + '건'} tag={{ text: '발굴 대상', tone: 'success' }} />
          <SpecKpi label="방문 결과 기록" value={recordedN + '건'} tag={{ text: '입력 완료', tone: 'neutral' }} />
        </div>
      ),
      goals: (
        <DashCard title="지사 목표 달성 현황" sub={`${branch} · ${PERIOD_LABEL[goalPeriod]} 목표 대비 진행 (예시)`}
          action={
            <div className="seg">
              <button className={goalPeriod === 'prev' ? 'on' : ''} onClick={() => setGoalPeriod('prev')}>전월</button>
              <button className={goalPeriod === 'this' ? 'on' : ''} onClick={() => setGoalPeriod('this')}>당월</button>
              <button className={goalPeriod === 'quarter' ? 'on' : ''} onClick={() => setGoalPeriod('quarter')}>분기</button>
            </div>
          }>
          <div className="goalbars">
            {GOALS.map((g, i) => {
              const pct = Math.min(100, Math.round(g.cur / g.target * 100));
              return (
                <div className="goalbar" key={i}>
                  <div className="goalbar__top">
                    <span className="goalbar__label">{g.label}</span>
                    <span className="goalbar__pct" style={{ color: g.color }}>{pct}%</span>
                  </div>
                  <div className="goalbar__track"><div className="goalbar__fill" style={{ width: pct + '%', background: g.color }} /></div>
                  <div className="goalbar__sub">{g.cur}건 / 목표 {g.target}건</div>
                </div>
              );
            })}
          </div>
        </DashCard>
      ),
      roster: (
        <DashCard title="소속 컨설턴트 실적" sub={`${branch} · ${consultants.length}명 · ${PERIOD_LABEL[rosterPeriod]} 계약 건수순`}
          action={
            <div className="seg">
              <button className={rosterPeriod === 'prev' ? 'on' : ''} onClick={() => { setRosterPeriod('prev'); setRosterOpen(false); }}>전월</button>
              <button className={rosterPeriod === 'this' ? 'on' : ''} onClick={() => { setRosterPeriod('this'); setRosterOpen(false); }}>당월</button>
              <button className={rosterPeriod === 'quarter' ? 'on' : ''} onClick={() => { setRosterPeriod('quarter'); setRosterOpen(false); }}>분기</button>
            </div>
          }>
          {consultants.length === 0
            ? <div className="nodata-box"><MI n="info" s={20} /><div>이 지사에 등록된 컨설턴트가 없어요.</div></div>
            : <>
              <SimpleTable
                cols={[{ label: '', c: 1 }, { label: '컨설턴트' }, { label: '담당 후보', c: 1 }, { label: '방문', c: 1 }, { label: '계약', c: 1 }, { label: '실적 비교 (계약)' }]}
                rows={shownPerf.map((p, i) => [
                  <span className={'perf-rank' + (i < 3 ? ' perf-rank--top' : '')}>{i + 1}</span>,
                  <b>{p.name}</b>,
                  <span className="tnum faint">{p.cand}</span>,
                  <span className="tnum faint">{p.visit}</span>,
                  <span className="perf-num">{p.deal}</span>,
                  <div className="perf-bar"><div className="perf-bar__fill" style={{ width: Math.round(p.deal / maxDeal * 100) + '%' }} /></div>,
                ])} />
              {perf.length > 5 && (
                <button className="news-more" onClick={() => setRosterOpen(o => !o)}>
                  {rosterOpen
                    ? <>접기 <MI n="expand_less" s={18} /></>
                    : <>더보기 <span className="news-more__n">+{perf.length - 5}</span> <MI n="expand_more" s={18} /></>}
                </button>
              )}
            </>}
        </DashCard>
      ),
    };
    return (
      <div className="pc-content pc-content--wide fadein" data-screen-label="지사 대시보드">
        <div className="pc-pagehead">
          <div>
            <div className="pc-pagehead__title">{branch} 대시보드</div>
            <div className="pc-pagehead__desc">{user?.name || ''} 지사장님 — 본인 지사 현황이에요. 섹션 좌상단 <MI n="drag_indicator" s={16} style={{ verticalAlign: '-3px' }} />핸들을 드래그하면 순서를 바꿀 수 있어요.</div>
          </div>
          <div className="ph-right">
            <DBtn size="sm" variant="line" onClick={branchCtrl.resetOrder} iconLeft={<MI n="restart_alt" s={18} />}>구성 초기화</DBtn>
            <DBtn onClick={downloadRoster} iconLeft={<MI n="download" s={20} />}>컨설턴트 명단</DBtn>
          </div>
        </div>
        <SectionList ctrl={branchCtrl} titles={BRANCH_SEC_TITLE} blocks={blocks} />
      </div>
    );
  }

  /* ----- 본사 전체 관리자 대시보드 (기존) ----- */
  const download = () => {
    const head = ['컨설턴트', '담당지역', 'T/A', '매출(원)', '전환율', '달성률'];
    const rows = ADMIN_SALES.map(r => [r[0], r[1], r[2], r[3] * 10000, r[4], r[5]]);
    const csv = '﻿' + [head, ...rows].map(r => r.map(x => `"${x}"`).join(',')).join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = '컨설턴트별_실적_2026Q2.csv'; a.click();
  };
  const blocks = {
    kpis: (
      <div className="bkpis">
        <SpecKpi label="총 관리 컨설턴트" value="24명" tag={{ text: '+3 이번달', tone: 'success' }} />
        <SpecKpi label="전체 파이프라인" value="187건" tag={{ text: '+12 신규', tone: 'info' }} />
        <SpecKpi label="이번달 매출" value="24억 원" tag={{ text: '목표 대비 94%', tone: 'warning' }} />
        <SpecKpi label="전환율" value="23.5%" tag={{ text: '+1.2% 전월比', tone: 'success' }} />
      </div>
    ),
    charts: (
      <div className="dash-2col">
        <DashCard title="지역별 영업 실적 (분기)" sub="관리 구역 전체">
          <GroupedBar categories={['서울', '경기', '인천', '부산', '대구', '광주', '대전']}
            series={[{ name: '수주 완료', data: [42, 35, 18, 22, 15, 12, 14] }, { name: '협상 중', data: [28, 22, 14, 16, 11, 9, 10] }, { name: '신규 발굴', data: [55, 48, 31, 29, 20, 17, 22] }]} />
        </DashCard>
        <DashCard title="컨설턴트별 실적 현황" sub="이번달 기준">
          <SimpleTable
            cols={[{ label: '컨설턴트' }, { label: '담당지역' }, { label: 'T/A', c: 1 }, { label: '매출(원)', c: 1 }, { label: '전환율', c: 1 }, { label: '달성률', c: 1 }]}
            rows={ADMIN_SALES.map(r => [r[0], r[1], <span className="tnum">{r[2]}</span>, <span className="tnum">{(r[3] * 10000).toLocaleString()}</span>, <span className="tnum">{r[4]}</span>, B(r[5], r[6])])} />
        </DashCard>
      </div>
    ),
    activity: (
      <DashCard title="컨설턴트 활동 입력 현황" sub="최근 2주">
        <SimpleTable
          cols={[{ label: '날짜' }, { label: '컨설턴트' }, { label: '활동유형' }, { label: '고객사' }, { label: '결과' }, { label: '다음단계' }]}
          rows={[
            ['2026-06-09', '김민준', B('미팅', 'info'), '(주)테크솔루션', B('긍정적', 'success'), '제안서 발송'],
            ['2026-06-09', '이서연', B('전화', 'neutral'), '베스트물산', B('보류', 'warning'), '2주후 재연락'],
            ['2026-06-08', '박도현', B('제안서', 'warning'), '글로벌IT', B('제출완료', 'info'), '결과대기'],
            ['2026-06-08', '최지우', B('미팅', 'info'), '삼원기업', B('긍정적', 'success'), '견적서 발송'],
            ['2026-06-05', '정하늘', B('계약', 'success'), 'KD전자', B('계약체결', 'success'), '계약이행'],
            ['2026-06-05', '오지수', B('전화', 'neutral'), '미래건설', B('재연락', 'neutral'), '1주후 재연락'],
            ['2026-06-04', '한민서', B('미팅', 'info'), '대한물류', B('긍정적', 'success'), '제안서 발송'],
            ['2026-06-03', '윤재원', B('제안서', 'warning'), '서원시스템', B('보류', 'warning'), '결과대기'],
            ['2026-06-02', '김민준', B('전화', 'neutral'), '신성정밀', B('재연락', 'neutral'), '1주후 재연락'],
            ['2026-06-02', '박도현', B('계약', 'success'), '동방케미칼', B('계약체결', 'success'), '계약이행'],
          ]} />
      </DashCard>
    ),
  };
  return (
    <div className="pc-content pc-content--wide fadein" data-screen-label="관리자 대시보드">
      <div className="pc-pagehead">
        <div>
          <div className="pc-pagehead__title">관리자 대시보드</div>
          <div className="pc-pagehead__desc">관리 구역 전체의 영업 실적과 컨설턴트 활동을 한눈에 확인하고 파일로 내려받을 수 있어요. 섹션 좌상단 <MI n="drag_indicator" s={16} style={{ verticalAlign: '-3px' }} />핸들을 드래그하면 순서를 바꿀 수 있어요.</div>
        </div>
        <div className="ph-right">
          <DBtn size="sm" variant="line" onClick={allCtrl.resetOrder} iconLeft={<MI n="restart_alt" s={18} />}>구성 초기화</DBtn>
          <div style={{ width: 150 }}><DSel value={period} onChange={setPeriod} options={[{ value: 'quarter', label: '이번 분기' }, { value: 'month', label: '이번 달' }, { value: 'week', label: '이번 주' }]} /></div>
          <DBtn onClick={download} iconLeft={<MI n="download" s={20} />}>엑셀 다운로드</DBtn>
        </div>
      </div>
      <SectionList ctrl={allCtrl} titles={ADMIN_SEC_TITLE} blocks={blocks} />
    </div>
  );
}

/* ============ 컨설턴트 대시보드 ============ */
/* 방문 상태 → 파이프라인 단계 매핑 */
const STAGE_OF = { done: '협상', revisit: '제안', reject: '종료', won: '계약' };
const STAGE_TONE = { 발굴: 'neutral', 접촉: 'neutral', 제안: 'info', 협상: 'warning', 계약: 'success', 종료: 'danger' };

export function SalesDash({ persona, onNav, listA, listB, retention, recorded, visits, onResult, seasonPreview, onSeasonPreview, floodSeasonOn,
  gamify, reportSentOverrides, touchOverrides, myEmpno, myBranch }) {
  const regions = ['강남구', '서초구', '송파구', '마포구', '영등포구', '용산구', '성동구'];
  recorded = recorded || []; visits = visits || {};
  const gamifyCtx = { visits, listA, listB, retention, reportSentOverrides, touchOverrides };
  const myPoints = gamify ? gamify.total : 0;
  const quests = questProgress(gamifyCtx);
  const badges = badgeStatus(gamifyCtx);
  const roster = (window.APP_ACCOUNTS || []).filter(a => a.role === 'consultant' && a.branch === myBranch);
  const leaderboard = buildLeaderboard(roster, myEmpno, myPoints).slice(0, 8);
  const D = window.APPDATA || {};
  const [newsOpen, setNewsOpen] = useState(false);
  const newsAll = (D.firePoints || []).filter(f => f.title).slice().sort((a, b) => a.days - b.days);
  const news = newsOpen ? newsAll.slice(0, 15) : newsAll.slice(0, 2);
  const dayLabel = (d) => d <= 0 ? '오늘' : d === 1 ? '어제' : d + '일 전';
  const fireStats = buildFireDispatchDemo();
  // 시즌별 특화 타깃 — 혹서기·풍수해기(6~9월) 침수 위험 후보 (신규 A + 유지고객 B)
  const floodCands = (listA || []).filter(c => !c.excluded && !c.duplicate && c.flood && c.flood.level === '주의').slice().sort((a, b) => (b.score || 0) - (a.score || 0));
  const floodBAll = augmentListBFlood(listB || []);
  const floodBCands = floodBAll.filter(b => b.flood && b.flood.level === '주의').slice().sort((a, b) => (b.undergroundRoom ? 1 : 0) - (a.undergroundRoom ? 1 : 0));
  const floodBHighRisk = floodBCands.filter(b => b.undergroundRoom).length;
  const seasonKey = seasonPreview || 'normal';
  const discovered = (listA || []).filter(c => !c.excluded && !c.duplicate).length + (listB || []).filter(c => c.matchCount > 0).length;
  const visited = recorded.length;
  const byStatus = (s) => recorded.filter(c => visits[c.id]?.status === s).length;
  const wonCnt = byStatus('won');
  const proposalN = byStatus('revisit'), negoN = byStatus('done'), rejectN = byStatus('reject');
  const newCnt = recorded.filter(c => c.track === 'A').length, upCnt = recorded.filter(c => c.track === 'B').length;
  const doneRate = visited ? Math.round(negoN / visited * 100) : 0;

  const STEPS = [
    ['발굴', discovered, '공공·관제 데이터로 발굴된 전체 후보.'],
    ['접촉', visited, '방문 결과를 입력해 접촉을 마친 건.'],
    ['제안', proposalN, '재방문필요로 분류돼 제안·검토가 진행 중인 건.'],
    ['협상', negoN, '방문완료로 조건 협의 단계에 진입한 건.'],
    ['계약', wonCnt, '수주완료로 계약 체결된 건.'],
  ];

  // ---- 드래그앤드롭 섹션 커스터마이징 (포인터 기반 — 끌어오면 기존 섹션이 밀려남) ----
  const DASH_SECTIONS = ['news', 'season', 'kpis', 'gamify', 'charts', 'pipeline'];
  const SEC_TITLE = { news: '블루스캔 관련 뉴스', season: '시즌 타깃 신호', kpis: '핵심 지표', gamify: '이번 주 퀘스트·랭킹', charts: '지역·유형 분포', pipeline: '내 파이프라인' };
  const [order, setOrder] = useState(() => {
    try { const s = JSON.parse(localStorage.getItem('bluescan.dashOrder') || 'null'); if (Array.isArray(s)) { const f = s.filter(k => DASH_SECTIONS.includes(k)); return [...f, ...DASH_SECTIONS.filter(k => !f.includes(k))]; } } catch { /* ignore */ }
    return DASH_SECTIONS;
  });
  const orderRef = useRef(order); orderRef.current = order;
  const wrapRef = useRef(null);
  const [draggingKey, setDraggingKey] = useState(null);
  const persist = (next) => { try { localStorage.setItem('bluescan.dashOrder', JSON.stringify(next)); } catch { /* ignore */ } };
  const resetOrder = () => { setOrder(DASH_SECTIONS); persist(DASH_SECTIONS); };

  const beginDrag = (e, key) => {
    e.preventDefault();
    setDraggingKey(key);
    document.body.classList.add('dash-dragging');
    const move = (ev) => {
      const wrap = wrapRef.current; if (!wrap) return;
      const els = [...wrap.querySelectorAll('.dash-sec')];
      let overKey = null;
      for (const el of els) { const r = el.getBoundingClientRect(); if (ev.clientY >= r.top && ev.clientY <= r.bottom) { overKey = el.dataset.key; break; } }
      if (!overKey && els.length) {  // 첫 섹션 위 / 마지막 섹션 아래로 끌었을 때
        const first = els[0].getBoundingClientRect(), last = els[els.length - 1].getBoundingClientRect();
        if (ev.clientY < first.top) overKey = els[0].dataset.key;
        else if (ev.clientY > last.bottom) overKey = els[els.length - 1].dataset.key;
      }
      if (overKey && overKey !== key) {
        setOrder(prev => { const from = prev.indexOf(key), to = prev.indexOf(overKey); if (from < 0 || to < 0 || from === to) return prev; const next = [...prev]; next.splice(to, 0, next.splice(from, 1)[0]); return next; });
      }
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      document.body.classList.remove('dash-dragging');
      setDraggingKey(null);
      setOrder(cur => { persist(cur); return cur; });   // 최신 순서를 확실히 저장
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const SECTION = {
    news: (
      <DashCard title="블루스캔 관련 뉴스" sub="최근 화재·보안 이슈 · 공개 뉴스 데이터 + 소방청 출동 통계"
        action={<span style={{ font: 'var(--type-13r)', color: 'var(--text-tertiary)' }}>최근 발생순 · 영업 타이밍 신호</span>}>
        <div className="firedsp">
          <div className="firedsp__top">
            <MI n="local_fire_department" s={16} />
            <span className="firedsp__label">오늘의 화재 출동 현황</span>
            <DBadge tone="danger" shape="pill">접수 {fireStats.national.rcpt}건</DBadge>
            <DBadge tone="warning" shape="pill">진행중 {fireStats.national.prog}건</DBadge>
            <DBadge tone="neutral" shape="pill">인명피해 {fireStats.national.life}명</DBadge>
            <DBadge tone="neutral" shape="pill">재산피해 {(fireStats.national.prop / 1e8).toFixed(1)}억원</DBadge>
            <span className="firedsp__src">{fireStats.source} · 기준일 {fireStats.baseDate}</span>
          </div>
          <div className="faint" style={{ font: 'var(--type-13m)', margin: '2px 0 6px' }}>실시간 화재 출동 현황 <span style={{ fontWeight: 400 }}>· safekorea 실시간 화재정보</span></div>
          <div className="news-feed" style={{ maxHeight: 220, overflowY: 'auto' }}>
            {(fireStats.liveItems || []).map(f => (
              <div className="news-item" key={f.id} style={{ cursor: 'default' }}>
                <div className="news-day hot">{f.time.split(' ')[1]}</div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div className="news-title">{f.type} · {f.loc}</div>
                  <div className="news-meta">
                    <span className="news-region"><MI n="location_on" s={14} />{f.loc.split(' ')[0]} {f.loc.split(' ')[1]}</span>
                    <DBadge tone={f.scale === '대형' ? 'danger' : f.scale === '중형' ? 'warning' : 'neutral'} shape="pill">{f.scale}</DBadge>
                    <span className="news-src">{f.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {news.length === 0
          ? <div className="nodata-box"><MI n="info" s={20} /><div>표시할 뉴스가 없어요.</div></div>
          : <div className="news-feed">
            {news.map((f, i) => (
              <a className="news-item" key={i} href={f.url || '#'} target="_blank" rel="noopener noreferrer" onClick={e => { if (!f.url) e.preventDefault(); }}>
                <div className={'news-day' + (f.days <= 1 ? ' hot' : '')}>{dayLabel(f.days)}</div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div className="news-title">{f.title}</div>
                  <div className="news-meta">
                    {f.sigungu && <span className="news-region"><MI n="location_on" s={14} />{f.sigungu}</span>}
                    {f.biz && <span className="news-src">{f.biz}</span>}
                    <DBadge tone={f.scale === '대형' ? 'danger' : f.scale === '중형' ? 'warning' : 'neutral'} shape="pill">{f.scale}</DBadge>
                    <span className="news-src">{f.source}</span>
                  </div>
                </div>
                <MI n="open_in_new" s={16} cls="news-ext" />
              </a>
            ))}
          </div>}
        {newsAll.length > 2 && (
          <button className="news-more" onClick={() => setNewsOpen(o => !o)}>
            {newsOpen
              ? <>접기 <MI n="expand_less" s={18} /></>
              : <>더보기 <span className="news-more__n">+{newsAll.length - 2}</span> <MI n="expand_more" s={18} /></>}
          </button>
        )}
      </DashCard>
    ),
    season: (
      <DashCard title="시즌 타깃 신호" sub={`${SEASON_DEF[seasonKey].label} · ${SEASON_DEF[seasonKey].theme}`}
        action={<div style={{ width: 190 }}>
          <DSel value={seasonKey} onChange={(v) => onSeasonPreview && onSeasonPreview(v)}
            options={SEASON_ORDER.map(k => ({ value: k, label: '미리보기 · ' + SEASON_DEF[k].label }))} />
        </div>}>
        {floodSeasonOn ? (
          floodCands.length === 0 && floodBCands.length === 0 ? (
            <div className="nodata-box"><MI n="info" s={20} /><div>담당 구역에 침수 위험 신호가 있는 후보·고객처가 없어요.</div></div>
          ) : (
            <>
              <div className="firedsp" style={{ marginBottom: 12 }}>
                <div className="firedsp__top">
                  <MI n="water_drop" s={16} />
                  <span className="firedsp__label">도시침수 예상구역(기왕최대) 내 대상</span>
                  <DBadge tone="info" shape="pill">신규 후보 {floodCands.length}곳</DBadge>
                  <DBadge tone="info" shape="pill">유지고객 {floodBCands.length}곳</DBadge>
                  {floodBHighRisk > 0 && <DBadge tone="danger" shape="pill">지하 중요시설 고위험 {floodBHighRisk}곳</DBadge>}
                  <span className="firedsp__src">건축물대장·관제 스코어링 연계 · 점수에는 미반영(타이밍 신호 전용)</span>
                </div>
              </div>

              {floodCands.length > 0 && <>
                <div className="faint" style={{ font: 'var(--type-13m)', margin: '4px 0 6px' }}>신규 고객 후보 (리스트 A)</div>
                <div className="news-feed">
                  {floodCands.slice(0, 5).map(c => (
                    <div className="news-item" key={c.id} style={{ cursor: 'default' }}>
                      <div className="news-day hot"><MI n="water_drop" s={16} /></div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div className="news-title">{c.name}</div>
                        <div className="news-meta">
                          <span className="news-region"><MI n="location_on" s={14} />{c.address}</span>
                          <DBadge tone="info" shape="pill">{c.flood.area}</DBadge>
                          <span className="news-src">점수 {c.score}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {onNav && <DBtn size="sm" variant="line" onClick={() => onNav('listA')} iconLeft={<MI n="travel_explore" s={18} />} style={{ margin: '10px 0 16px' }}>신규 고객 후보에서 전체 보기 (+{Math.max(floodCands.length - 5, 0)})</DBtn>}
              </>}

              {floodBCands.length > 0 && <>
                <div className="faint" style={{ font: 'var(--type-13m)', margin: '4px 0 6px' }}>유지고객 (리스트 B · 업셀링)</div>
                <div className="news-feed">
                  {floodBCands.slice(0, 5).map(c => (
                    <div className="news-item" key={c.id} style={{ cursor: 'default' }}>
                      <div className={'news-day' + (c.undergroundRoom ? ' hot' : '')}><MI n="water_drop" s={16} /></div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div className="news-title">{c.name}</div>
                        <div className="news-meta">
                          <span className="news-region"><MI n="location_on" s={14} />{c.address}</span>
                          <DBadge tone="info" shape="pill">{c.flood.area}</DBadge>
                          {c.undergroundRoom
                            ? <DBadge tone="danger" shape="pill">{c.undergroundRoom} · 고위험(예시)</DBadge>
                            : <span className="news-src">{c.ind}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {onNav && <DBtn size="sm" variant="line" onClick={() => onNav('listB')} iconLeft={<MI n="apartment" s={18} />} style={{ marginTop: 10 }}>유지고객 후보에서 전체 보기 (+{Math.max(floodBCands.length - 5, 0)})</DBtn>}
              </>}
            </>
          )
        ) : (
          <div className="nodata-box"><MI n="info" s={20} /><div>침수 위험 신호는 혹서기·풍수해기(6~9월)에만 표시돼요. 위 선택창에서 다른 시즌을 미리볼 수 있어요.</div></div>
        )}
      </DashCard>
    ),
    kpis: (
      <div className="bkpis">
        <SpecKpi label="발굴 후보" value={discovered + '건'} tag={{ text: '신규+기존(업셀링)', tone: 'info' }} />
        <SpecKpi label="방문 접촉" value={visited + '건'} tag={{ text: '결과 입력 완료', tone: 'success' }} />
        <SpecKpi label="협상 단계" value={negoN + '건'} tag={{ text: '방문완료 전환', tone: 'warning' }} />
        <SpecKpi label="방문 성공률" value={doneRate + '%'} tag={{ text: `거절 ${rejectN}건`, tone: doneRate >= 50 ? 'success' : 'neutral' }} />
      </div>
    ),
    gamify: (
      <DashCard title="이번 주 퀘스트·랭킹" sub="활동할수록 포인트가 쌓여요 · 배점은 예시(관리자가 확정 필요)"
        action={<span style={{ font: 'var(--type-20b,800 20px/1 sans-serif)', color: 'var(--accent)' }}>{myPoints}P</span>}>
        <div className="dash-2col">
          <div>
            <div className="faint" style={{ font: 'var(--type-13m)', margin: '2px 0 10px' }}>퀘스트 진행률</div>
            {quests.map(q => (
              <div key={q.id} style={{ marginBottom: 12 }}>
                <div className="goalbar__top">
                  <span className="goalbar__label"><MI n={q.icon} s={16} style={{ verticalAlign: '-3px', marginRight: 4 }} />{q.label}</span>
                  <span className="goalbar__pct" style={{ fontSize: 14 }}>{q.current}/{q.target}</span>
                </div>
                <div className="goalbar__track">
                  <div className="goalbar__fill" style={{ width: `${q.current / q.target * 100}%`, background: q.done ? 'var(--s1-seagreen-600,#1fb279)' : 'var(--accent)' }} />
                </div>
              </div>
            ))}
            <div className="faint" style={{ font: 'var(--type-13m)', margin: '16px 0 8px' }}>배지</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {badges.map(b => (
                <span key={b.id} title={b.label} className="gm-badge" data-on={b.unlocked ? '1' : '0'}>
                  <MI n={b.icon} s={16} fill={b.unlocked} />{b.label}
                </span>
              ))}
            </div>
          </div>
          <div>
            <div className="faint" style={{ font: 'var(--type-13m)', margin: '2px 0 10px' }}>지사 랭킹 <span style={{ fontWeight: 400 }}>· 동료는 예시 데이터, 나는 실제 활동 기준</span></div>
            {leaderboard.length === 0
              ? <div className="nodata-box"><MI n="info" s={18} /><div>같은 지사에 등록된 컨설턴트 계정이 없어요.</div></div>
              : <SimpleTable
                cols={[{ label: '', c: 1 }, { label: '이름' }, { label: '포인트', c: 1 }, { label: '비교' }]}
                rows={leaderboard.map((r, i) => [
                  <span className={'perf-rank' + (i < 3 ? ' perf-rank--top' : '')}>{i + 1}</span>,
                  <b style={{ color: r.isMe ? 'var(--accent)' : undefined }}>{r.name}{r.isMe ? ' (나)' : ''}</b>,
                  <span className="perf-num">{r.points}</span>,
                  <div className="perf-bar"><div className="perf-bar__fill" style={{ width: Math.round(r.points / Math.max(...leaderboard.map(x => x.points), 1) * 100) + '%' }} /></div>,
                ])} />}
          </div>
        </div>
      </DashCard>
    ),
    charts: (
      <div className="dash-2col">
        <DashCard title="지역별 전체 건수" sub="담당구역 현황 · 신규 vs 기존 고객(업셀링)">
          <GroupedBar categories={regions}
            series={[{ name: '후보(신규)', data: [8, 6, 5, 7, 4, 5, 3] }, { name: '후보(기존 고객)', data: [5, 4, 3, 4, 3, 2, 2] }]} />
        </DashCard>
        <DashCard title="후보 유형 분포" sub="신규 vs 기존 고객(업셀링)">
          <Radar categories={regions} series={[{ name: '신규', data: [8, 6, 5, 7, 4, 5, 3] }, { name: '기존 고객(업셀링)', data: [5, 4, 3, 4, 3, 2, 2] }]} />
        </DashCard>
      </div>
    ),
    pipeline: (
      <DashCard title="내 파이프라인 현황" sub="방문 결과 입력에 따라 단계가 자동 반영돼요"
        action={<DBtn size="sm" variant="line" onClick={() => onNav('confirmed')} iconLeft={<MI n="fact_check" s={18} />}>방문 결과 보기</DBtn>}>
        <div className="steps">
          {STEPS.map(([t, cnt, desc], i) => (
            <div className="step" key={i}>
              <div className="step__top"><span className="step__n">{i + 1}</span>{i < STEPS.length - 1 && <span className="step__line" />}</div>
              <div className="step__t">{t} <b>{cnt}건</b></div>
              <div className="step__d">{desc}</div>
            </div>))}
        </div>
        <div style={{ marginTop: 18 }}>
          {recorded.length === 0
            ? <div className="nodata-box"><MI n="info" s={20} /><div>아직 입력된 방문 결과가 없어요. 신규 고객 후보·기존 고객 후보(업셀링) 목록에서 <b>결과 입력</b>을 누르면 해당 건이 파이프라인 단계에 자동으로 반영돼요.</div></div>
            : <SimpleTable
              cols={[{ label: '고객사' }, { label: '유형' }, { label: '파이프라인 단계' }, { label: '방문 상태' }, { label: '메모' }, { label: '', c: 1 }]}
              rows={recorded.map(c => { const v = visits[c.id]; const stage = STAGE_OF[v?.status] || '접촉'; const vm = v ? VISIT[v.status] : null;
                return [
                  <b>{c.name}</b>,
                  B(c.track === 'A' ? '신규' : '기존(업셀링)', c.track === 'A' ? 'info' : 'warning'),
                  B(stage, STAGE_TONE[stage]),
                  vm ? <DBadge tone={vm.tone} dot>{vm.label}</DBadge> : <DBadge tone="neutral">미입력</DBadge>,
                  <span className="memo-cell" style={{ display: 'inline-block', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>{v?.memo || '—'}</span>,
                  <DBtn size="sm" variant="line" onClick={() => onResult(c)}>결과 수정</DBtn>,
                ]; })} />}
        </div>
      </DashCard>
    ),
  };

  return (
    <div className="pc-content pc-content--wide fadein" data-screen-label="컨설턴트 대시보드">
      <div className="pc-pagehead">
        <div>
          <div className="pc-pagehead__title">안녕하세요, {persona?.name || '김영업'}님</div>
          <div className="pc-pagehead__desc">담당 구역의 파이프라인·후보 분포와 블루스캔 관련 뉴스를 확인하세요. 섹션 좌상단 <MI n="drag_indicator" s={16} style={{ verticalAlign: '-3px' }} />핸들을 드래그하면 원하는 순서로 배치할 수 있어요.</div>
        </div>
        <div className="ph-right">
          <DBtn size="sm" variant="line" onClick={resetOrder} iconLeft={<MI n="restart_alt" s={18} />}>구성 초기화</DBtn>
        </div>
      </div>

      <div ref={wrapRef}>
        {order.map(key => (
          <div key={key} data-key={key} className={'dash-sec' + (draggingKey === key ? ' dash-sec--dragging' : '')}>
            <div className="dash-sec__bar" onPointerDown={e => beginDrag(e, key)}>
              <MI n="drag_indicator" s={18} /><span className="dash-sec__name">{SEC_TITLE[key]}</span>
              <span className="faint dash-sec__hint">드래그하여 순서 변경</span>
            </div>
            <div className="dash-sec__body">{SECTION[key]}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
