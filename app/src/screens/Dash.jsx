/* ===== Dash.jsx — 관리자/컨설턴트 대시보드 ===== */
import React from 'react'
import { createPortal } from 'react-dom'
import { MI, VISIT, tierOf } from '../components.jsx'
import { GroupedBar } from '../charts.jsx'
import { questProgress } from '../gamification.js'
import { buildFireDispatchDemo } from '../fireDispatch.demo.js'
import { augmentRetention, needsAttention, MonthlyReportDialog, EmpathyMessageDialog } from './Retention.jsx'
import { BP_CASES_DATA } from '../bpCases.generated.js'
const { useState, useRef, useEffect } = React

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

/* ============ 컨설턴트 대시보드 (간소화 — 오늘의 알림 · 유지관리 핵심 · 신규 파이프라인) ============ */
/* 방문 상태 → 파이프라인 단계 매핑 */
const STAGE_OF = { done: '협상', revisit: '제안', reject: '종료', won: '계약' };
const STAGE_TONE = { 발굴: 'neutral', 접촉: 'neutral', 제안: 'info', 협상: 'warning', 계약: 'success', 종료: 'danger' };

// 유지고객 "주의" 사유 한 줄 라벨
function attnReason(c) {
  // 주의 필요 배지 — needsAttention 기준(심각 신호 / 미해결·누적 VOC)과 일치. 만료 임박은 '만료 도래'가 담당.
  if ((c.signalHistory || []).some(s => s.severity === '심각')) return { text: '심각 신호', tone: 'danger' };
  if (c.vocAttention) return { text: 'VOC 주의', tone: 'warning' };
  return { text: '점검 필요', tone: 'warning' };
}

/* ===== 유지고객 메인 대시보드(홈) — 목표 완성본 레이아웃용 데이터·헬퍼 ===== */
const PT_LABEL = { dual: '듀얼', owner: '오너' };
// BP 사례 로테이션 — 실데이터(수주 사례 엑셀) 중 스토리가 있는 상위 서비스료 건을 하이라이트로
const BP_CASES = BP_CASES_DATA
  .filter(c => c.story && c.story.length > 25)
  .sort((a, b) => (b.fee || 0) - (a.fee || 0))
  .slice(0, 6)
  .map(c => ({
    tag: `${c.month} · ${c.sector}`,
    title: (c.name.replace(/블루스캔.*$/, '').replace(/[\s(（[{]+$/, '').trim() || c.name),
    body: c.story.length > 110 ? c.story.slice(0, 108) + '…' : c.story,
  }));
// 상태 기준 — '오늘 할 일' 6개 카테고리와 동일 기준
const RET_CRITERIA = [
  { label: '주의 필요 유지고객', dot: '#DC3B40', crit: '심각한 관제 신호가 발생했거나 불만·요청 VOC가 누적된 유지고객.', action: '근거 신호·VOC를 확인하고 선제 연락으로 원인을 해소하세요.' },
  { label: '계약 만료 임박', dot: '#C77A0A', crit: '계약 잔여 기간이 3개월 이내인 유지고객.', action: '갱신 협의를 시작하고 유지 리포트로 가치를 전달하세요.' },
  { label: '우선접촉 대상', dot: '#1B50D4', crit: '인력경비(B-1)와 중요실(B-2)에 모두 해당하는 신규 후보.', action: '원격 전환과 중요실 보호를 함께 제안하세요.' },
  { label: '최우선 신규 후보', dot: '#0F3AA8', crit: '도입 가능성 점수 S등급(91점↑)인 신규 후보.', action: '즉시 제안 가능한 최우선 방문 대상입니다.' },
  { label: '신호 관리필요', dot: '#157A5B', crit: '최근 관제 신호가 늘거나 3개월 누적 30건↑인 유지고객.', action: 'VOC 접수 전 선제 점검·감성터칭으로 안심 소통하세요.' },
  { label: '이번주 퀘스트', dot: '#6A7180', crit: '방문·리포트·감성터칭 등 이번 주 활동 목표.', action: '미션&랭킹에서 남은 퀘스트를 달성하세요.' },
];
function queueSummary(c) {
  const parts = [];
  if ((c.signalHistory || []).some(s => s.severity === '심각')) parts.push('심각한 관제 신호가 발생했습니다');
  else if (c.manageNeeded) parts.push('관제 신호가 늘고 있습니다');
  if (c.vocAttention) parts.push('불만·요청 VOC가 누적됐습니다');
  return parts.length ? parts.join(' · ') + ' — 선제 대응을 권장합니다.' : '선제 점검을 권장합니다.';
}
function whyRows(c) {
  const sig = c.signalHistory || [];
  const sev = sig.filter(s => s.severity === '심각').length;
  return [
    ['계약 잔여', c._daysToEnd == null ? '계약일 미상' : c._daysToEnd < 0 ? '만료(갱신 확인)' : `D-${c._daysToEnd}${c._daysToEnd <= 90 ? ' · 만료 임박' : ''}`],
    ['관제 신호', sig.length ? `최근 ${sig.length}건${sev ? ` · 심각 ${sev}건` : ''}` : '최근 신호 없음'],
    ['VOC', c.vocAttention ? '미해결·주의 VOC 있음' : '특이사항 없음'],
    ['상품', PT_LABEL[c.productTier] || c.productTier || '—'],
  ];
}

export function SalesDash({ persona, onNav, onGoRetention, onGoInsight, onGoPipeline, listA, listB, retention, recorded, visits, onResult, reportSentOverrides = {}, onMarkReportSent, touchOverrides = {}, onMarkTouched }) {
  const goInsight = onGoInsight || ((t) => onNav('insight'));
  const goPipe = onGoPipeline || (() => onNav('pipeline'));
  const goRet = onGoRetention || ((cat) => onNav('retention'));
  recorded = recorded || []; visits = visits || {};
  const D = window.APPDATA || {};
  const [newsOpen, setNewsOpen] = useState(false);
  const newsAll = (D.firePoints || []).filter(f => f.title).slice().sort((a, b) => a.days - b.days);
  const news = newsAll.slice(0, 12);
  const dayLabel = (d) => d <= 0 ? '오늘' : d === 1 ? '어제' : d + '일 전';
  const fireStats = buildFireDispatchDemo();
  const discovered = (listA || []).filter(c => !c.excluded && !c.duplicate).length + (listB || []).filter(c => c.matchCount > 0).length;
  const visited = recorded.length;
  const byStatus = (s) => recorded.filter(c => visits[c.id]?.status === s).length;
  const wonCnt = byStatus('won');
  const proposalN = byStatus('revisit'), negoN = byStatus('done');

  const STEPS = [
    ['발굴', discovered, '공공·관제 데이터로 발굴된 전체 후보.'],
    ['접촉', visited, '방문 결과를 입력해 접촉을 마친 건.'],
    ['제안', proposalN, '재방문필요로 분류돼 제안·검토가 진행 중인 건.'],
    ['협상', negoN, '방문완료로 조건 협의 단계에 진입한 건.'],
    ['계약', wonCnt, '수주완료로 계약 체결된 건.'],
  ];

  // 유지관리 핵심 — 파생 필드로 주의/만료/신호관리 집계 (클릭 시 유지관리현황 해당 필터로 이동)
  const retAug = augmentRetention(retention || []);
  const retAttention = retAug.filter(c => needsAttention(c).flag)
    .sort((a, b) => (a._daysToEnd ?? 9999) - (b._daysToEnd ?? 9999));
  const retExpiry = retAug.filter(c => c.expirySoon).length;
  const retManage = retAug.filter(c => c.manageNeeded).length;
  const RET_STATS = [
    { key: 'all', label: '관리 유지물건', n: retAug.length, tone: '' },
    { key: 'attn', label: '주의 필요', n: retAttention.length, tone: 'red' },
    { key: 'expiry', label: '만료 도래', n: retExpiry, tone: 'amber' },
    { key: 'manage', label: '신호 관리필요', n: retManage, tone: 'amber' },
  ];

  /* ===== 목표 완성본 레이아웃용 상태·집계 ===== */
  const [drawerFor, setDrawerFor] = useState(null);   // 상세 드로어 대상 고객
  const [refOpen, setRefOpen] = useState(false);       // 상태 구분 기준 모달
  const [reportFor, setReportFor] = useState(null);    // 드로어 → 월간 리포트 다이얼로그
  const [empathyFor, setEmpathyFor] = useState(null);  // 드로어 → 감성터칭 { c, signal }
  const [bpIdx, setBpIdx] = useState(0);               // BP 사례 로테이션
  useEffect(() => { const t = setInterval(() => setBpIdx(i => (i + 1) % BP_CASES.length), 5000); return () => clearInterval(t); }, []);

  const KPIS = [
    { key: 'all', label: '전체 유지물건', n: retAug.length, dot: '#9AA1AD' },
    { key: 'attn', label: '주의 필요', n: retAttention.length, dot: '#DC3B40' },
    { key: 'expiry', label: '만료 도래', n: retExpiry, dot: '#C77A0A' },
    { key: 'manage', label: '신호 관리필요', n: retManage, dot: '#157A5B' },
  ];
  // 오늘 할 일 — 좌측 네비게이션과 동일한 6개 카테고리, 각 대표 1건
  const retExpiryList = retAug.filter(c => c.expirySoon).sort((a, b) => (a._daysToEnd ?? 9999) - (b._daysToEnd ?? 9999));
  const manageList = retAug.filter(c => c.manageNeeded);
  const bothList = (listB || []).filter(c => c.btype === 'both');
  const topList = [...(listA || []), ...(listB || [])].filter(c => c.score != null && tierOf(c.score).key === 'S');
  const qp = questProgress({ visits, listA, listB, retention, reportSentOverrides, touchOverrides });
  const questDone = qp.filter(q => q.done).length;
  const todoCats = [
    retAttention.length && { key: 'attn', label: '주의 필요 유지고객', dot: '#DC3B40', rep: retAttention[0], n: retAttention.length, go: () => setDrawerFor(retAttention[0]) },
    retExpiryList.length && { key: 'expiry', label: '계약 만료 임박', dot: '#C77A0A', rep: retExpiryList[0], n: retExpiryList.length, go: () => setDrawerFor(retExpiryList[0]) },
    bothList.length && { key: 'both', label: '우선접촉 대상', dot: '#1B50D4', rep: bothList[0], n: bothList.length, kind: 'pipe', go: () => goPipe('both') },
    { key: 'S', label: '최우선 신규 후보', dot: '#0F3AA8', rep: topList[0], n: topList.length, kind: 'pipe', go: () => goPipe('S') },
    manageList.length && { key: 'manage', label: '신호 관리필요', dot: '#157A5B', rep: manageList[0], n: manageList.length, go: () => setDrawerFor(manageList[0]) },
    { key: 'quest', label: '이번주 퀘스트', dot: '#6A7180', kind: 'quest', n: `${questDone}/${qp.length}`, go: () => onNav('activity') },
  ].filter(Boolean);
  const bp = BP_CASES[bpIdx];
  const branchLabel = persona?.branch || '내 지사';

  return (
    <div className="pc-content pc-content--wide fadein" data-screen-label="컨설턴트 대시보드">
      {/* 내 유지 현황 — 섹션 헤더(하단 '내 파이프라인 현황'과 동일 스타일) */}
      <div className="dashhead" style={{ marginBottom: 12 }}>
        <div>
          <div className="dashhead__t">내 유지 현황</div>
          <div className="dashhead__s">주의가 필요한 유지고객을 먼저 확인하세요 · {branchLabel}</div>
        </div>
        <div className="dashhead__a"><DBtn size="sm" variant="line" onClick={() => goRet('all')} iconLeft={<MI n="shield_with_heart" s={18} />}>유지관리현황</DBtn></div>
      </div>

      {/* KPI 카드 — 클릭 시 유지관리현황 해당 필터 */}
      <div className="home2-kpis">
        {KPIS.map(k => (
          <button key={k.key} className="home2-kpi" onClick={() => goRet(k.key)}>
            <span className="home2-kpi__lab"><i className="home2-dot" style={{ background: k.dot }} />{k.label}</span>
            <span className="home2-kpi__n tnum">{k.n}<i>곳</i></span>
          </button>
        ))}
      </div>

      {/* 메인 그리드 */}
      <div className="home2-grid">
        <div className="home2-col">
          {/* 오늘 할 일 — 좌측 네비게이션 6개 카테고리, 각 대표 1건 */}
          <section className="home2-card">
            <div className="home2-ch">
              <div className="home2-ch__t"><MI n="task_alt" s={20} /><h2>오늘 할 일</h2><span className="home2-pill">{todoCats.length}개 항목</span></div>
              <button className="home2-ref" onClick={() => setRefOpen(true)}><MI n="help" s={16} />상태 기준</button>
            </div>
            <div className="home2-queue">
              {todoCats.map(cat => {
                const rep = cat.rep;
                const sub = cat.kind === 'quest'
                  ? `이번주 퀘스트 ${cat.n} 달성 · 미션&랭킹에서 이어가기`
                  : rep
                    ? `대표: ${rep.name}${rep.use || rep.ind ? ' · ' + (rep.use || rep.ind) : ''}`
                    : '현재 해당 대상이 없습니다';
                return (
                  <button key={cat.key} className="home2-qi" onClick={cat.go}>
                    <span className="home2-qi__bar" style={{ background: cat.dot }} />
                    <span className="home2-qi__body">
                      <span className="home2-qi__top"><b>{cat.label}</b>{typeof cat.n === 'number' && <span className="home2-catn">{cat.n}건</span>}</span>
                      <span className="home2-qi__sum">{sub}</span>
                    </span>
                    <span className="home2-qi__meta">
                      <span className="home2-qi__mk">{cat.kind === 'pipe' ? '신규진행' : cat.kind === 'quest' ? '미션' : '유지관리'}</span>
                      <MI n="chevron_right" s={18} cls="home2-qi__go" />
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        <div className="home2-col">
          {/* BP 사례 & 공지 — 클릭 시 인사이트 수주 사례 탭으로 */}
          <section className="home2-bp home2-bp--link" onClick={() => goInsight('bp')} role="button" tabIndex={0}>
            <div className="home2-bp__head"><MI n="emoji_events" s={20} /><h2>BP 사례 & 공지</h2><span className="home2-bp__more">전체 보기<MI n="chevron_right" s={16} /></span></div>
            <span className="home2-bp__tag">{bp.tag}</span>
            <div className="home2-bp__title">{bp.title}</div>
            <div className="home2-bp__body">{bp.body}</div>
            <div className="home2-bp__dots">{BP_CASES.map((_, i) => <button key={i} className={'home2-bp__dot' + (i === bpIdx ? ' on' : '')} onClick={(e) => { e.stopPropagation(); setBpIdx(i); }} aria-label={'사례 ' + (i + 1)} />)}</div>
          </section>

          {/* 화재 · 보안 알림 */}
          <section className="home2-card">
            <div className="home2-ch">
              <div className="home2-ch__t"><MI n="local_fire_department" s={20} /><h2>화재 · 보안 알림</h2></div>
              <button className="home2-ref" onClick={() => setNewsOpen(o => !o)}>{newsOpen ? '접기' : '열기'}<MI n={newsOpen ? 'expand_less' : 'expand_more'} s={16} /></button>
            </div>
            {news.length === 0
              ? <div className="home2-empty">표시할 알림이 없습니다.</div>
              : <div className="home2-alerts">
                {news.slice(0, newsOpen ? news.length : 4).map((f, i) => (
                  <a className="home2-alert" key={i} href={f.url || '#'} target="_blank" rel="noopener noreferrer" onClick={e => { if (!f.url) e.preventDefault(); }}>
                    <span className="home2-alert__dot" style={{ background: f.scale === '대형' ? '#DC3B40' : f.scale === '중형' ? '#C77A0A' : '#9AA1AD' }} />
                    <span className="home2-alert__t">{f.title}</span>
                    <span className="home2-alert__loc">{f.sigungu || dayLabel(f.days)}</span>
                  </a>
                ))}
              </div>}
          </section>
        </div>
      </div>

      {/* 3) 내 파이프라인 — 단계(가로) + 방문 결과 표 */}
      <div style={{ marginTop: 16 }}>
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
              ? <div className="nodata-box"><MI n="info" s={20} /><div>아직 입력된 방문 결과가 없어요. 신규 고객 후보·기존 고객 후보(업셀링) 목록에서 <b>방문 결과 입력</b>을 누르면 해당 건이 파이프라인 단계에 자동으로 반영돼요.</div></div>
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
      </div>

      {/* 상세 드로어 — 왜 이 고객인가 + 최근 활동 + 대응 */}
      {drawerFor && (() => { const c = drawerFor; const r = attnReason(c); const sig = (c.signalHistory || []).slice(0, 6);
        return createPortal(
          <div className="home2-scrim" onClick={() => setDrawerFor(null)}>
            <div className="home2-drawer" onClick={e => e.stopPropagation()}>
              <div className="home2-drawer__head">
                <div>
                  <div className="home2-drawer__name">{c.name} <DBadge tone={toneOf(r.tone)} shape="pill" dot>{r.text}</DBadge></div>
                  <div className="home2-drawer__meta">{c.use} · 계약 {c.contractNo} · 담당 {c.assignedConsultant || '—'}</div>
                </div>
                <button className="home2-x" onClick={() => setDrawerFor(null)}><MI n="close" s={20} /></button>
              </div>
              <div className="home2-drawer__body">
                <div className="home2-drawer__stats">
                  <div><div className="home2-drawer__k">최근 신호</div><div className="home2-drawer__v">{(c.signalHistory || []).length}건</div></div>
                  <div className="home2-drawer__sep" />
                  <div><div className="home2-drawer__k">계약 잔여</div><div className="home2-drawer__v" style={{ color: (c._daysToEnd != null && c._daysToEnd >= 0 && c._daysToEnd <= 45) ? '#DC3B40' : '#17191E' }}>{c._daysToEnd == null ? '계약일 미상' : c._daysToEnd < 0 ? '만료' : `D-${c._daysToEnd}`}</div></div>
                  <div className="home2-drawer__sep" />
                  <div><div className="home2-drawer__k">상품</div><div className="home2-drawer__v">{PT_LABEL[c.productTier] || c.productTier || '—'}</div></div>
                </div>
                <div className="home2-drawer__sec">왜 이 고객인가</div>
                <div className="home2-why">
                  {whyRows(c).map((w, i) => (<div className="home2-why__row" key={i}><span className="home2-why__k">{w[0]}</span><span className="home2-why__v">{w[1]}</span></div>))}
                </div>
                <div className="home2-drawer__sec">최근 활동</div>
                {sig.length === 0
                  ? <div className="home2-empty" style={{ textAlign: 'left', padding: '6px 0' }}>아직 발송/접촉 이력이 없습니다. 선제 대응 대상입니다.</div>
                  : <div className="home2-tl">{sig.map((s, i) => (<div className="home2-tl__row" key={i}><span className="home2-tl__d">{s.date}</span><div><div className="home2-tl__x">{s.type}</div><div className="home2-tl__n">{s.severity}{s.notifiedAuthority ? ' · 유관기관 통보' : ''}</div></div></div>))}</div>}
                <div className="home2-drawer__sec" style={{ marginTop: 26 }}>대응 <span className="faint" style={{ fontWeight: 400, fontSize: 12 }}>· 발송은 담당자 승인 필요</span></div>
                <div className="home2-drawer__status">
                  <span><MI n="description" s={16} />월간 리포트 <b>{reportSentOverrides[c.id] ? `${reportSentOverrides[c.id]} 발송` : '미발송'}</b></span>
                  <span><MI n="favorite" s={16} />감성터칭 <b>{touchOverrides[c.id] ? `${touchOverrides[c.id]} 발송` : '없음'}</b></span>
                </div>
                <div className="home2-drawer__btns">
                  <button className="home2-btn home2-btn--primary" onClick={() => setReportFor(c)}>월간 리포트 발송</button>
                  <button className="home2-btn home2-btn--line" onClick={() => setEmpathyFor({ c, signal: (c.signalHistory && c.signalHistory[0]) || { date: '', type: '정기 안부' } })}>감성터칭 메시지</button>
                </div>
              </div>
            </div>
          </div>, document.body); })()}

      {/* 상태 구분 기준 모달 */}
      {refOpen && createPortal(
        <div className="home2-scrim home2-scrim--center" onClick={() => setRefOpen(false)}>
          <div className="home2-modal" onClick={e => e.stopPropagation()}>
            <div className="home2-modal__head"><h2>상태 구분 기준</h2><button className="home2-x" onClick={() => setRefOpen(false)}><MI n="close" s={18} /></button></div>
            <div className="home2-modal__sub">각 배지가 어떤 기준으로 분류되며, 담당자가 무엇을 해야 하는지 안내합니다.</div>
            <div className="home2-refgrid">
              {RET_CRITERIA.map((rc, i) => (
                <div className="home2-ref__card" key={i}>
                  <span className="home2-ref__badge"><i className="home2-dot" style={{ background: rc.dot }} />{rc.label}</span>
                  <div className="home2-ref__crit"><b>기준:</b> {rc.crit}</div>
                  <div className="home2-ref__act"><b>할 일:</b> {rc.action}</div>
                </div>
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* 드로어 대응 — 월간 리포트 / 감성터칭 (유지관리현황과 동일 다이얼로그 재사용) */}
      {reportFor && (
        <MonthlyReportDialog c={reportFor} allCustomers={retention}
          sentDate={reportSentOverrides[reportFor.id] ?? reportFor.monthlyReportSent}
          onMarkSent={(id) => { onMarkReportSent && onMarkReportSent(id); }}
          onClose={() => setReportFor(null)} />
      )}
      {empathyFor && (
        <EmpathyMessageDialog c={empathyFor.c} signal={empathyFor.signal}
          onSent={(id) => { onMarkTouched && onMarkTouched(id); }}
          onClose={() => setEmpathyFor(null)} />
      )}
    </div>
  );
}
