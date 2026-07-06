/* ===== ListB.jsx — 리스트 B 업셀링 (PRD: B-1 경비원 / B-2 중요실 이원화, 스코어링 없이 전수 표시) ===== */
import React from 'react'
import { MI, won } from '../components.jsx'
import { TargetMap } from '../map.jsx'
import { augmentListBFlood } from '../floodRisk.js'
import { buildFireDispatchDemo } from '../fireDispatch.demo.js'
const { useState, useMemo } = React

const { Chip: BChip, Badge: BBadge, Button: BButton, TextField: BTextField } = window.UXDesignSystem_59a60b;

function BSelect({ value, onChange, options }) {
  const { Select } = window.UXDesignSystem_59a60b;
  return <Select value={value} onChange={onChange} options={options} />;
}

// B-1 / B-2 유형 배지
function TypeBadges({ c, priority, floodSeasonOn }) {
  return (
    <>
      {c.btype === 'both' && priority && <BBadge tone="danger" shape="pill" dot>우선 접촉</BBadge>}
      {c.b1 && <BBadge tone="info" shape="pill">B-1 경비원</BBadge>}
      {c.b2 && <BBadge tone="warning" shape="pill">B-2 중요실</BBadge>}
      {c.nearFire && <BBadge tone="warning" shape="pill" dot>최근 인근 화재</BBadge>}
      {floodSeasonOn && c.flood && c.flood.level === '주의' && <BBadge tone="info" shape="pill" dot>침수 주의</BBadge>}
      {floodSeasonOn && c.undergroundRoom && <BBadge tone="danger" shape="pill" dot>{c.undergroundRoom}</BBadge>}
    </>
  );
}

function ListBRow({ c, rank, expanded, onToggle, onResult, recorded, logCount = 0, floodSeasonOn }) {
  return (
    <div className={'lrow lrow--b' + (expanded ? ' open' : '') + (c.btype === 'both' ? ' lrow-priority' : '')}>
      <div className="lrow-main" onClick={onToggle}>
        <div className="lrow-rank">{rank}</div>
        <div className="lrow-id">
          <div className="lrow-name">{c.name} <span className="kw">{c.ind}</span></div>
          <div className="lrow-addr">{c.contractNo ? `계약번호 ${c.contractNo}` : '계약번호 미상'}</div>
          <div className="brow-badges"><TypeBadges c={c} priority floodSeasonOn={floodSeasonOn} /></div>
        </div>
        <div className="brow-actions" onClick={e => e.stopPropagation()}>
          <span className="btnbadge-wrap">
            <BButton size="sm" variant={recorded ? 'secondary' : 'primary'} onClick={() => onResult(c)}
              iconLeft={<MI n={recorded ? 'edit_note' : 'mic'} s={18} />}>{recorded ? '방문 결과 수정' : '방문 결과 입력'}</BButton>
            {logCount > 0 && <span className="btnbadge">{logCount}</span>}
          </span>
          <span className="lrow-chev" style={{ transform: expanded ? 'rotate(180deg)' : 'none' }}><MI n="expand_more" /></span>
        </div>
      </div>
      {expanded && (
        <div className="lrow-detail fadein">
          <div className="ld-grid">
            <div>
              <div className="ld-h">선정 근거 <span className="faint" style={{ fontWeight: 400 }}>· 스코어링 없음 · 전수 방문 대상</span></div>
              <div className="kwtable">{c.matches.map((m, i) => (
                <div className="kwt-row" key={i}>
                  <span className="kwt-kw">{m.kw}</span>
                  <span className="kwt-cat">{m.cat === 'B1' ? 'B-1 경비원' : 'B-2 중요실'}</span>
                  <span className="kwt-freq faint" style={{ flex: 1, textAlign: 'right', fontVariantNumeric: 'normal' }}>{m.detail}</span>
                </div>))}</div>
              {c.btype === 'both' && <div className="bnote" style={{ marginTop: 10 }}><MI n="priority_high" /><div><b>우선 접촉 대상</b> — 인력경비 운영과 중요실 보유에 모두 해당해요.</div></div>}
            </div>
            <div>
              <div className="ld-h">고객 인력경비 현황</div>
              <dl className="ld-attrs">
                <div><dt>지사</dt><dd>{c.branch}</dd></div>
                <div><dt>용도</dt><dd>{c.ind}</dd></div>
                <div><dt>현재 경비형태</dt><dd>{c.currentProduct}</dd></div>
                {c.people != null && <div><dt>배치 인원</dt><dd>{c.people}명</dd></div>}
                <div><dt>계약 유지</dt><dd>{c.contractMonths}개월</dd></div>
                <div><dt>월 경비금액</dt><dd>{won(c.monthlyFee)}</dd></div>
                <div><dt>지역</dt><dd>{c.address}</dd></div>
              </dl>
              {floodSeasonOn && c.flood && c.flood.level === '주의' && (
                <div className="ld-flood">
                  <div className="ld-h" style={{ margin: 0, color: 'var(--accent)' }}><MI n="water_drop" s={18} /> 침수 위험 신호 <span className="faint" style={{ fontWeight: 400 }}>· 혹서기·풍수해기(6~9월) 시즌 신호</span></div>
                  <p><b>도시침수 예상구역</b> 내 위치 · {c.flood.area} (기왕최대 시나리오)</p>
                  {c.undergroundRoom
                    ? <p><b style={{ color: 'var(--s1-red-500,#e5484d)' }}>고위험 시설 — {c.undergroundRoom}</b> 보유 추정(예시) · 침수 시 최우선 안내 대상</p>
                    : <p className="faint">방재·이설 컨설팅 제안 타이밍 신호로 활용하세요.</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BCard({ c, rank, onResult, recorded, onOpen, logCount = 0, floodSeasonOn }) {
  return (
    <div className={'acard' + (c.btype === 'both' ? ' acard-priority' : '')} onClick={onOpen}>
      <div className="acard-top"><span className="acard-rank">#{rank}</span></div>
      <div className="acard-name">{c.name}</div>
      <div className="acard-addr">{c.branch} · {c.ind}</div>
      <div className="acard-tags"><TypeBadges c={c} priority floodSeasonOn={floodSeasonOn} /></div>
      <div style={{ marginTop: 12 }} onClick={e => e.stopPropagation()}>
        <span className="btnbadge-wrap" style={{ display: 'block' }}>
          <BButton size="sm" block variant={recorded ? 'secondary' : 'primary'} onClick={() => onResult(c)}
            iconLeft={<MI n={recorded ? 'edit_note' : 'mic'} s={18} />}>{recorded ? '방문 결과 수정' : '방문 결과 입력'}</BButton>
          {logCount > 0 && <span className="btnbadge">{logCount}</span>}
        </span>
      </div>
    </div>
  );
}

const TYPE_TABS = [
  { key: 'all', label: '전체' },
  { key: 'b1', label: 'B-1 경비원' },
  { key: 'b2', label: 'B-2 중요실' },
  { key: 'both', label: '우선 접촉' },
];

export function ListBScreen({ data: rawData, onResult, recordedSet, logCounts = {}, visits = {}, listMode, onListMode, floodSeasonOn = true }) {
  const [branch, setBranch] = useState('전체');
  const [gun, setGun] = useState('전체');
  const [dong, setDong] = useState('전체');
  const [tab, setTab] = useState('all');
  const [q, setQ] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [focusId, setFocusId] = useState(null);
  const [showFire, setShowFire] = useState(true);   // 화재 오버레이 기본 활성화
  const [showFlood, setShowFlood] = useState(true); // 침수 오버레이 기본 활성화
  const D = window.APPDATA || {};
  const fireDispatch = buildFireDispatchDemo();
  const data = useMemo(() => augmentListBFlood(rawData), [rawData]);
  const select = (id) => { setExpanded(id); setFocusId(id);
    setTimeout(() => { const el = document.getElementById('brow-' + id); if (el) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }, 60); };
  const branches = ['전체', ...Array.from(new Set(data.map(c => c.branch)))];
  const base = data.filter(c => branch === '전체' || c.branch === branch);
  const guns = ['전체', ...Array.from(new Set(base.map(c => c.gun).filter(Boolean)))];
  const dongs = ['전체', ...Array.from(new Set(base.filter(c => gun === '전체' || c.gun === gun).map(c => c.dong).filter(Boolean)))];
  const matchTab = (c) => tab === 'all' ? c.matchCount > 0 : tab === 'b1' ? c.b1 : tab === 'b2' ? c.b2 : c.btype === 'both';
  const qx = q.trim().toLowerCase();
  let filtered = base.filter(c =>
    (gun === '전체' || c.gun === gun) &&
    (dong === '전체' || c.dong === dong) &&
    matchTab(c) &&
    (qx === '' || (`${c.name || ''} ${c.contractNo || ''} ${c.ind || ''}`).toLowerCase().includes(qx)));
  // 점수 없음 — 우선접촉(둘다) → B-1 → B-2 순, NO_DATA는 표시 안 함(탭이 방문대상 기준)
  filtered.sort((a, b) => (b.matchWeight - a.matchWeight) || a.name.localeCompare(b.name));
  const cnt = {
    b1: base.filter(c => c.b1).length, b2: base.filter(c => c.b2).length,
    both: base.filter(c => c.btype === 'both').length, visit: base.filter(c => c.matchCount > 0).length,
  };
  // 신규 탭과 동일하게 — 보이는 고객 분포와 겹치는 침수 시군구 레이어만 표시
  const floodForView = (D.floodLayers || []).filter(fl => {
    const [a, b, c, d] = fl.bbox || [];
    return a != null && filtered.some(x => x.lat != null && x.lng != null && x.lng >= a - 0.02 && x.lng <= c + 0.02 && x.lat >= b - 0.02 && x.lat <= d + 0.02);
  });

  return (
    <div className="pc-content pc-content--wide fadein" data-screen-label="리스트 B · 기존 고객(업셀링)">
      <div className="pc-pagehead">
        <div>
          <div className="pc-pagehead__title">기존 고객 후보(업셀링) 발굴</div>
          <div className="pc-pagehead__desc">사내 데이터에서 <b>B-1 경비원 운영</b>과 <b>B-2 중요실 보유</b>를 <b>스코어링 없이 전수 방문 대상</b>으로 보여드려요.</div>
        </div>
      </div>

      <div className="bnote">
        <MI n="info" />
        <div><b>B-1</b>은 인력경비(상주·순찰) 운영 사업장, <b>B-2</b>는 전산실·기계실·서버실·서고 등 중요실 보유 사업장이에요. 두 조건 모두 해당하면 <b>우선 접촉</b>으로 강조해요.</div>
      </div>

      {/* B-1 / B-2 유형 탭 */}
      <div className="btype-tabs">
        {TYPE_TABS.map(t => (
          <button key={t.key} className={'btype-tab' + (tab === t.key ? ' on' : '')} onClick={() => setTab(t.key)}>
            {t.label}<span className="btype-tab__n">{t.key === 'all' ? cnt.visit : t.key === 'b1' ? cnt.b1 : t.key === 'b2' ? cnt.b2 : cnt.both}</span>
          </button>
        ))}
      </div>

      <div className="filterbar" style={{ marginTop: 12 }}>
        <div className="fb-row">
          <span className="fb-label"><MI n="search" s={18} />고객처명</span>
          <div style={{ width: 280 }}>
            <BTextField value={q} onChange={e => setQ(e.target.value)} placeholder="고객명·계약번호·업종으로 검색" iconLeft={<MI n="search" s={18} />} />
          </div>
          {q && <BButton size="sm" variant="line" onClick={() => setQ('')} iconLeft={<MI n="close" s={16} />}>검색 해제</BButton>}
        </div>
        {branches.length > 2 && (
          <div className="fb-row">
            <span className="fb-label"><MI n="apartment" s={18} />지사</span>
            <div className="fb-chips">{branches.map(b => <BChip key={b} selected={branch === b} onClick={() => { setBranch(b); setGun('전체'); setDong('전체'); }}>{b}</BChip>)}</div>
          </div>
        )}
        <div className="fb-row">
          <span className="fb-label"><MI n="location_on" s={18} />군·구</span>
          {guns.length > 12
            ? <div style={{ width: 200 }}><BSelect value={gun} onChange={(v) => { setGun(v); setDong('전체'); }} options={guns.map(g => ({ value: g, label: g }))} /></div>
            : <div className="fb-chips">{guns.map(r => <BChip key={r} selected={gun === r} onClick={() => { setGun(r); setDong('전체'); }}>{r}</BChip>)}</div>}
          <div className="fb-spacer">
            <span className="fb-label" style={{ marginRight: 0 }}><MI n="pin_drop" s={18} />읍·면·동</span>
            <div style={{ width: 168 }}><BSelect value={dong} onChange={setDong} options={dongs.map(d => ({ value: d, label: d }))} /></div>
          </div>
        </div>
      </div>

      <div className="pc-tabletoolbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '8px 0 12px' }}>
        <span className="muted">
          <b style={{ color: 'var(--accent)' }} className="tnum">{filtered.length}</b>곳
          <span className="faint" style={{ marginLeft: 8 }}>· 우선접촉 {cnt.both}</span>
        </span>
        {onListMode && (
          <div className="seg seg--sm">
            <button className={listMode !== 'card' ? 'on' : ''} onClick={() => onListMode('table')}><MI n="view_list" s={16} />목록</button>
            <button className={listMode === 'card' ? 'on' : ''} onClick={() => onListMode('card')}><MI n="grid_view" s={16} />카드</button>
          </div>)}
      </div>

      <div className="split">
        <div className="split-list">
          <div style={{ border: '1px solid var(--border-default)', borderRadius: 'var(--radius-m)', overflow: 'hidden', background: '#fff' }}>
            {filtered.length === 0
              ? <div className="nodata-box" style={{ margin: 12 }}><MI n="filter_alt_off" s={20} /><div>{q ? <>‘{q}’ 검색 결과가 없어요. 고객명을 다시 확인하거나 검색을 해제해 보세요.</> : '선택한 조건에 맞는 고객처가 없어요. 필터를 조정해 보세요.'}</div></div>
              : listMode === 'card'
                ? <div className="cardgrid" style={{ padding: 16 }}>{filtered.map((c, i) => <BCard key={c.id} c={c} rank={i + 1} onResult={onResult} recorded={recordedSet.has(c.id)} logCount={logCounts[c.id] || 0} onOpen={() => select(c.id)} floodSeasonOn={floodSeasonOn} />)}</div>
                : <div className="rows" style={{ padding: '4px 12px 8px' }}>{filtered.map((c, i) => (
                  <div id={'brow-' + c.id} key={c.id}>
                    <ListBRow c={c} rank={i + 1} expanded={expanded === c.id} onToggle={() => { if (expanded === c.id) setExpanded(null); else select(c.id); }} onResult={onResult} recorded={recordedSet.has(c.id)} logCount={logCounts[c.id] || 0} floodSeasonOn={floodSeasonOn} />
                  </div>))}</div>}
          </div>
        </div>
        <div className="split-map">
          <div className="map-top">
            <span className="eyebrow">고객 분포</span>
            <span className="map-top__chips">
              <BChip selected={showFire} onClick={() => setShowFire(s => !s)}>화재 오버레이</BChip>
              <BChip selected={showFlood} onClick={() => setShowFlood(s => !s)}>침수 오버레이</BChip>
            </span>
          </div>
          <div style={{ flex: 1, position: 'relative' }}>
            {filtered.length > 0
              ? <TargetMap candidates={filtered} firePoints={D.firePoints || []} fireRegions={D.fireRegions || []} liveFirePoints={fireDispatch.liveItems} floodLayers={floodForView} visits={visits} showFire={showFire} showFlood={showFlood} selectedId={expanded} onSelect={select} focusId={focusId} fitKey={`${branch}|${gun}|${dong}|${tab}|${qx}`} variant="B" />
              : <div className="map-empty"><MI n="map" s={28} /><span>표시할 고객이 없어요</span></div>}
          </div>
        </div>
      </div>
    </div>
  );
}
