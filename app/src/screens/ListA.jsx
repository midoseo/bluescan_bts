/* ===== ListA.jsx — 리스트 A 신규 후보 (지도 포함) ===== */
import React from 'react'
import { MI, Meter, Gauge, tierOf, num } from '../components.jsx'
import { TargetMap } from '../map.jsx'
import { buildFireDispatchDemo } from '../fireDispatch.demo.js'
const { useState, useEffect } = React
const PER_PAGE = 5  // 한 화면에 담기도록 페이지당 표시 건수 (스크롤 대신 페이지 번호)

const { Chip: AChip, Badge: ABadge, Button: AButton, TextField: ATextField } = window.UXDesignSystem_59a60b;

function CompBar({ c }) {
  if (c.v == null) return (
    <div className="cbar">
      <div className="cbar-top"><span>{c.k}</span><ABadge tone="neutral">NO_DATA</ABadge></div>
      <div className="mini-meter" style={{ opacity: .55 }}><i style={{ width: '100%', background: 'repeating-linear-gradient(45deg,#d9d9d9,#d9d9d9 4px,#efefef 4px,#efefef 8px)' }} /></div>
      <div className="cbar-note">데이터 없음 · 점수 미산입</div>
    </div>
  );
  return (
    <div className="cbar">
      <div className="cbar-top"><span>{c.k}</span><span className="tnum"><b>{c.v}</b> / {c.max}</span></div>
      <Meter value={c.v} max={c.max} color="var(--accent)" />
      <div className="cbar-note">{c.note}</div>
    </div>
  );
}

function ListARow({ c, rank, expanded, onToggle, onResult, recorded, logCount = 0, floodSeasonOn = true }) {
  const t = tierOf(c.score);
  if (c.excluded || c.duplicate) {
    return (
      <div className="lrow lrow-dim">
        <div className="lrow-main">
          <div className="lrow-rank">—</div>
          <div className="lrow-id">
            <div className="lrow-name" style={{ textDecoration: c.excluded ? 'line-through' : 'none', color: 'var(--text-tertiary)' }}>{c.name}</div>
            <div className="lrow-addr">{c.address}</div>
          </div>
          <div style={{ flex: 'none' }}>
            {c.excluded ? <ABadge tone="danger">{c.excludeReason}</ABadge>
              : <ABadge tone="neutral" dot>중복 차단 · {c.duplicateOf}</ABadge>}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className={'lrow' + (expanded ? ' open' : '')}>
      <div className="lrow-main" onClick={onToggle}>
        <div className="lrow-rank">{rank}</div>
        <div className="lrow-id">
          <div className="lrow-name">{c.name}
            {c.nearFire && <ABadge tone="warning" shape="pill" dot>최근 인근 화재</ABadge>}
            {floodSeasonOn && c.flood && c.flood.level === '주의' && <ABadge tone="info" shape="pill" dot>침수 주의</ABadge>}
            {c.noData.length > 0 && <ABadge tone="neutral">NO_DATA {c.noData.length}</ABadge>}
          </div>
          <div className="lrow-addr">{c.address} · {c.use} · {c.owner}</div>
        </div>
        <div className="lrow-score">
          <Gauge score={c.score} />
          <span className="tierlab" style={{ color: t.color }}>{t.label}</span>
        </div>
        <div style={{ flex: 'none' }} onClick={e => e.stopPropagation()}>
          <span className="btnbadge-wrap">
            <AButton size="sm" variant={recorded ? 'secondary' : 'primary'} onClick={() => onResult(c)}
              iconLeft={<MI n={recorded ? 'edit_note' : 'mic'} s={18} />}>{recorded ? '방문 결과 수정' : '방문 결과 입력'}</AButton>
            {logCount > 0 && <span className="btnbadge">{logCount}</span>}
          </span>
        </div>
        <span className="lrow-chev" style={{ transform: expanded ? 'rotate(180deg)' : 'none' }}><MI n="expand_more" /></span>
      </div>
      {expanded && (
        <div className="lrow-detail fadein">
          <div className="ld-grid">
            <div>
              <div className="ld-h">도입 가능성 점수 구성 <span className="faint" style={{ fontWeight: 400 }}>· 규칙 기반</span></div>
              <div className="ld-bars">{c.comps.map((cc, i) => <CompBar key={i} c={cc} />)}</div>
              <div className="ld-total">
                <span className="faint">규모·용도·복잡도·노후화 합산</span>
                <span style={{ marginLeft: 'auto' }} className="faint">합계</span>
                <span className="score-num" style={{ fontSize: 24, color: t.color }}>{c.score}</span>
              </div>
            </div>
            <div>
              <div className="ld-h">건축물대장 속성</div>
              <dl className="ld-attrs">
                <div><dt>연면적</dt><dd>{c.gfa ? num(c.gfa) + '㎡' : <i className="nd">NO_DATA</i>}</dd></div>
                <div><dt>건축면적</dt><dd>{c.bldgArea ? num(c.bldgArea) + '㎡' : <i className="nd">NO_DATA</i>}</dd></div>
                <div><dt>부속동수</dt><dd>{c.annex != null ? c.annex + '개동' : <i className="nd">NO_DATA</i>}</dd></div>
                <div><dt>주차</dt><dd>{c.parking != null ? c.parking + '면' : <i className="nd">NO_DATA</i>}</dd></div>
                <div><dt>소유구분</dt><dd>{c.owner}</dd></div>
                <div><dt>사용승인</dt><dd>{c.approvalDate ? `${c.approvalDate} (${c.approvalYrAgo}년)` : <i className="nd">NO_DATA</i>}</dd></div>
              </dl>
              {c.nearFire && (
                <div className="ld-fire">
                  <div className="ld-h" style={{ margin: 0, color: 'var(--s1-orange-600)' }}><MI n="local_fire_department" s={18} /> 영업 타이밍 신호</div>
                  <p>인근 <b>{c.nearFire.dist}m</b> 지점 · <b>{c.nearFire.days}일 전</b> {c.nearFire.scale} 화재</p>
                  <p className="faint">{c.nearFire.title}</p>
                </div>
              )}
              {floodSeasonOn && c.flood && c.flood.level === '주의' && (
                <div className="ld-flood">
                  <div className="ld-h" style={{ margin: 0, color: 'var(--accent)' }}><MI n="water_drop" s={18} /> 침수 위험 신호 <span className="faint" style={{ fontWeight: 400 }}>· 혹서기·풍수해기(6~9월) 시즌 신호</span></div>
                  <p><b>도시침수 예상구역</b> 내 위치 · {c.flood.area} (기왕최대 시나리오)</p>
                  <p className="faint">건물관리·방재 솔루션 제안 타이밍 신호로 활용하세요.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ACard({ c, rank, onResult, recorded, onOpen, logCount = 0, floodSeasonOn = true }) {
  const t = tierOf(c.score);
  return (
    <div className="acard" onClick={onOpen}>
      <div className="acard-top"><span className="acard-rank">#{rank}</span><Gauge score={c.score} size={40} /></div>
      <div className="acard-name">{c.name}</div>
      <div className="acard-addr">{c.address}</div>
      <div className="acard-tags">
        <span className="kw">{c.use}</span>
        {c.nearFire && <ABadge tone="warning" shape="pill" dot>화재</ABadge>}
        {floodSeasonOn && c.flood && c.flood.level === '주의' && <ABadge tone="info" shape="pill" dot>침수</ABadge>}
        {c.noData.length > 0 && <ABadge tone="neutral">NO_DATA</ABadge>}
      </div>
      <div style={{ marginTop: 12 }} onClick={e => e.stopPropagation()}>
        <span className="btnbadge-wrap" style={{ display: 'block' }}>
          <AButton size="sm" block variant={recorded ? 'secondary' : 'primary'} onClick={() => onResult(c)}
            iconLeft={<MI n={recorded ? 'edit_note' : 'mic'} s={18} />}>{recorded ? '방문 결과 수정' : '방문 결과 입력'}</AButton>
          {logCount > 0 && <span className="btnbadge">{logCount}</span>}
        </span>
      </div>
    </div>
  );
}

export function ListAScreen({ data, onResult, recordedSet, logCounts = {}, listMode, onListMode, floodSeasonOn = true }) {
  const D = window.APPDATA;
  const fireDispatch = buildFireDispatchDemo();
  const [gun, setGun] = useState('전체');
  const [dong, setDong] = useState('전체');
  const [use, setUse] = useState('전체');
  const [q, setQ] = useState('');
  const [fireOnly, setFireOnly] = useState(false);
  const [sort, setSort] = useState('score');
  const [expanded, setExpanded] = useState(null);
  const [focusId, setFocusId] = useState(null);
  const [showFire, setShowFire] = useState(true);
  const [showFlood, setShowFlood] = useState(true);

  const active = data.filter(c => !c.excluded && !c.duplicate);
  const guns = ['전체', ...Array.from(new Set(active.map(c => c.gun).filter(Boolean)))];
  const dongs = ['전체', ...Array.from(new Set(active.filter(c => gun === '전체' || c.gun === gun).map(c => c.dong).filter(Boolean)))];
  const uses = ['전체', ...Array.from(new Set(active.map(c => c.use).filter(Boolean)))];
  const qx = q.trim().toLowerCase();
  const filtered = active.filter(c =>
    (gun === '전체' || c.gun === gun) &&
    (dong === '전체' || c.dong === dong) &&
    (use === '전체' || c.use === use) &&
    (!fireOnly || c.nearFire) &&
    (qx === '' || (`${c.name || ''} ${c.address || ''}`).toLowerCase().includes(qx)));
  filtered.sort((a, b) => {
    if (sort === 'score') return (b.score == null ? -1 : b.score) - (a.score == null ? -1 : a.score);
    if (sort === 'age') return (b.approvalYrAgo || 0) - (a.approvalYrAgo || 0);
    if (sort === 'gfa') return (b.gfa || 0) - (a.gfa || 0);
    return 0;
  });
  const dimItems = data.filter(c => c.excluded || c.duplicate);

  // 페이지네이션 — 스크롤 대신 페이지 번호. 필터/검색/정렬이 바뀌면 1페이지로.
  const [page, setPage] = useState(1);
  useEffect(() => { setPage(1); }, [gun, dong, use, q, fireOnly, sort]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const curPage = Math.min(page, totalPages);
  const pageBase = (curPage - 1) * PER_PAGE;
  const pageItems = filtered.slice(pageBase, pageBase + PER_PAGE);
  // 지도엔 보이는 후보가 위치한 시군구의 침수 레이어만 그림 (12개 전부 그리면 무거움)
  const floodForView = (D.floodLayers || []).filter(fl => {
    const [a, b, c, d] = fl.bbox || [];
    return a != null && filtered.some(x => x.lat != null && x.lng != null && x.lng >= a - 0.02 && x.lng <= c + 0.02 && x.lat >= b - 0.02 && x.lat <= d + 0.02);
  });

  const select = (id) => { setExpanded(id); setFocusId(id);
    setTimeout(() => { const el = document.getElementById('row-' + id); if (el) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }, 60); };

  return (
    <div className="pc-content pc-content--wide fadein" data-screen-label="리스트 A · 신규 후보">
      <div className="pc-pagehead">
        <div>
          <div className="pc-pagehead__title">신규 후보 발굴</div>
        </div>
      </div>

      {active.length === 0 ? (
        <div className="empty">
          <div className="empty__ico"><MI n="travel_explore" s={32} /></div>
          <h3>이 지사에 표시할 신규 후보가 없어요</h3>
          <p>현재 로그인한 지사에 매칭된 건축물대장 후보가 없어요. 신규 후보 데이터가 있는 지사 계정으로 로그인하거나, <b style={{ color: 'var(--text-body)' }}>관리자(박팀장)</b> 계정에서 전체 후보를 확인할 수 있어요.</p>
        </div>
      ) : (
        <>
          <div className="filterbar">
            <div className="fb-row">
              <span className="fb-label"><MI n="search" s={18} />고객처명</span>
              <div style={{ width: 220 }}>
                <ATextField value={q} onChange={e => setQ(e.target.value)} placeholder="상호·건물명 검색" iconLeft={<MI n="search" s={18} />} />
              </div>
              {q && <AButton size="sm" variant="line" onClick={() => setQ('')} iconLeft={<MI n="close" s={16} />}>해제</AButton>}
              <span className="fb-label" style={{ marginLeft: 12 }}><MI n="location_on" s={18} />군·구</span>
              {guns.length > 12
                ? <div style={{ width: 180 }}><DSSelect value={gun} onChange={(v) => { setGun(v); setDong('전체'); }} options={guns.map(g => ({ value: g, label: g }))} /></div>
                : <div className="fb-chips">{guns.map(r => <AChip key={r} selected={gun === r} onClick={() => { setGun(r); setDong('전체'); }}>{r}</AChip>)}</div>}
            </div>
            <div className="fb-row">
              <span className="fb-label"><MI n="apartment" s={18} />용도</span>
              <div className="fb-chips">{uses.map(u => <AChip key={u} selected={use === u} onClick={() => setUse(u)}>{u}</AChip>)}</div>
              <div className="fb-spacer">
                <span className="fb-label" style={{ marginRight: 0 }}><MI n="pin_drop" s={18} />읍·면·동</span>
                <div style={{ width: 150 }}><DSSelect value={dong} onChange={setDong} options={dongs.map(d => ({ value: d, label: d }))} /></div>
                <AChip selected={fireOnly} onClick={() => setFireOnly(f => !f)}>인근 화재 발생</AChip>
                <div style={{ width: 140 }}><DSSelectSort sort={sort} setSort={setSort} /></div>
              </div>
            </div>
          </div>

          <div className="split">
            <div className="split-list">
              <div className="list-meta">
                <span style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <span className="muted"><b className="tnum">{filtered.length}</b>개 후보 · {sort === 'score' ? '점수순' : sort === 'age' ? '노후화순' : '규모순'}</span>
                  <span className="faint" style={{ font: 'var(--type-12r)' }}>멸실·중복 {dimItems.length}건 제외</span>
                </span>
                {onListMode && (
                  <div className="seg seg--sm">
                    <button className={listMode !== 'card' ? 'on' : ''} onClick={() => onListMode('table')}><MI n="view_list" s={16} />목록</button>
                    <button className={listMode === 'card' ? 'on' : ''} onClick={() => onListMode('card')}><MI n="grid_view" s={16} />카드</button>
                  </div>)}
              </div>
              {filtered.length === 0
                ? <div className="nodata-box" style={{ margin: 12 }}><MI n="filter_alt_off" s={20} /><div>{q ? <>‘{q}’ 검색 결과가 없어요. 고객처명을 다시 확인하거나 검색을 해제해 보세요.</> : '선택한 조건에 맞는 후보가 없어요. 군·구·동·용도 필터를 조정해 보세요.'}</div></div>
                : <>
                  {listMode === 'card'
                    ? <div className="cardgrid">{pageItems.map((c, i) => <ACard key={c.id} c={c} rank={pageBase + i + 1} onResult={onResult} recorded={recordedSet.has(c.id)} logCount={logCounts[c.id] || 0} onOpen={() => select(c.id)} floodSeasonOn={floodSeasonOn} />)}</div>
                    : <div className="rows" style={{ padding: '4px 12px 12px' }}>
                      {pageItems.map((c, i) => (
                        <div id={'row-' + c.id} key={c.id}>
                          <ListARow c={c} rank={pageBase + i + 1} expanded={expanded === c.id} onToggle={() => { if (expanded === c.id) setExpanded(null); else select(c.id); }} onResult={onResult} recorded={recordedSet.has(c.id)} logCount={logCounts[c.id] || 0} floodSeasonOn={floodSeasonOn} />
                        </div>))}
                    </div>}
                  {totalPages > 1 && (
                    <div className="pager">
                      <button className="pager__b" disabled={curPage === 1} onClick={() => setPage(curPage - 1)} aria-label="이전 페이지"><MI n="chevron_left" s={20} /></button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                        <button key={n} className={'pager__b' + (n === curPage ? ' on' : '')} onClick={() => setPage(n)}>{n}</button>
                      ))}
                      <button className="pager__b" disabled={curPage === totalPages} onClick={() => setPage(curPage + 1)} aria-label="다음 페이지"><MI n="chevron_right" s={20} /></button>
                    </div>
                  )}
                </>}
            </div>
            <div className="split-map">
              <div className="map-top">
                <span className="eyebrow">타깃 분포</span>
                <span className="map-top__chips">
                  <AChip selected={showFire} onClick={() => setShowFire(s => !s)}>화재 오버레이</AChip>
                  <AChip selected={showFlood} onClick={() => setShowFlood(s => !s)}>침수 오버레이</AChip>
                </span>
              </div>
              <div style={{ flex: 1, position: 'relative' }}>
                {filtered.length > 0
                  ? <TargetMap candidates={pageItems} firePoints={D.firePoints} fireRegions={D.fireRegions} liveFirePoints={fireDispatch.liveItems} showFire={showFire} showFlood={showFlood} floodLayers={floodForView} selectedId={expanded} onSelect={select} focusId={focusId} fitKey={`${gun}|${dong}|${qx}|${curPage}`} variant="A" />
                  : <div className="map-empty"><MI n="map" s={28} /><span>표시할 후보가 없어요</span></div>}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function DSSelectSort({ sort, setSort }) {
  const { Select } = window.UXDesignSystem_59a60b;
  return <Select value={sort} onChange={setSort} options={[{ value: 'score', label: '점수순' }, { value: 'age', label: '노후화순' }, { value: 'gfa', label: '규모순' }]} />;
}
function DSSelect({ value, onChange, options }) {
  const { Select } = window.UXDesignSystem_59a60b;
  return <Select value={value} onChange={onChange} options={options} />;
}
