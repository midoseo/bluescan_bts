/* ===== Pipeline.jsx — 신규진행현황 (신규 후보 + 기존 고객 업셀링 통합 목록) =====
 * 신규(track A)와 기존(track B)을 하나의 목록으로 보되, 척도가 다른 점을 감안해
 *  - 점수: 신규는 도입가능성 점수, 기존은 우선접촉(경비원+중요실 둘 다)=100 / 단일유형=92
 *  - 각 행에 '구분' 배지(신규/기존)로 성격을 구분
 *  - 기존 고객은 펼치면 계약정보(계약번호·경비형태·계약유지·월경비)와 매칭 근거를 보여준다
 */
import React from 'react'
import { MI, Meter, Gauge, tierOf, num, won, DetailModal, Pager } from '../components.jsx'
import { TargetMap } from '../map.jsx'
import { getBranchBoundary } from '../branchBoundary.js'
import { FIRE_OVERLAY } from '../fireOverlay.js'
import { todayCompact } from '../dateUtil.js'
const { useState, useEffect } = React
const PER_PAGE = 6

const { Chip, Badge, Button, TextField, Select, Dialog } = window.UXDesignSystem_59a60b;

// 구분(신규/기존) 배지 — 목록에서 두 성격을 한눈에 구분
function TrackBadge({ track }) {
  return track === 'B'
    ? <Badge tone="positive" shape="pill">기존</Badge>
    : <Badge tone="info" shape="pill">신규</Badge>;
}

// 신규(track A) 점수 구성 막대
function CompBar({ c }) {
  if (c.v == null) return (
    <div className="cbar">
      <div className="cbar-top"><span>{c.k}</span><Badge tone="neutral">NO_DATA</Badge></div>
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

// 신규 후보 상세 — 점수 구성 + 건축물대장
function NewDetail({ c, t }) {
  return (
    <div className="ld-grid">
      <div>
        <div className="ld-h">도입 가능성 점수 구성 <span className="faint" style={{ fontWeight: 400 }}>· 규칙 기반</span></div>
        <div className="ld-bars">{(c.comps || []).map((cc, i) => <CompBar key={i} c={cc} />)}</div>
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
          <div><dt>소유구분</dt><dd>{c.owner || <i className="nd">NO_DATA</i>}</dd></div>
          <div><dt>사용승인</dt><dd>{c.approvalDate ? `${c.approvalDate} (${c.approvalYrAgo}년)` : <i className="nd">NO_DATA</i>}</dd></div>
        </dl>
      </div>
    </div>
  );
}

// 기존 고객 상세 — (스코어링 데이터 있으면) 업셀링 점수 구성 + 계약정보 + 매칭 근거
function ExistingDetail({ c }) {
  const t = tierOf(c.score);
  const hasComps = Array.isArray(c.comps) && c.comps.length > 0;
  return (
    <div className="ld-grid">
      <div>
        {hasComps ? (
          <>
            <div className="ld-h">업셀링 적합도 점수 구성 <span className="faint" style={{ fontWeight: 400 }}>· 규칙 기반</span></div>
            <div className="ld-bars">{c.comps.map((cc, i) => <CompBar key={i} c={cc} />)}</div>
            <div className="ld-total">
              <span className="faint">계약·규모·리스크·매칭 합산</span>
              <span style={{ marginLeft: 'auto' }} className="faint">합계</span>
              <span className="score-num" style={{ fontSize: 24, color: t.color }}>{c.score}</span>
            </div>
          </>
        ) : (
          <>
            <div className="ld-h">업셀링 선정 근거 <span className="faint" style={{ fontWeight: 400 }}>· 관제 키워드 매칭</span></div>
            <div className="kwtable">{(c.matches || []).map((m, i) => (
              <div className="kwt-row" key={i}>
                <span className="kwt-kw">{m.kw}</span>
                <span className="kwt-cat">{m.cat === 'B1' ? 'B-1 경비원' : 'B-2 중요실'}</span>
                <span className="kwt-freq faint" style={{ flex: 1, textAlign: 'right', fontVariantNumeric: 'normal' }}>{m.detail}</span>
              </div>))}</div>
          </>
        )}
        {c.btype === 'both' && <div className="bnote" style={{ marginTop: 10 }}><MI n="priority_high" /><div><b>우선 접촉 대상</b> — 인력경비 운영과 중요실 보유에 모두 해당해요.</div></div>}
      </div>
      <div>
        <div className="ld-h">계약 정보</div>
        <dl className="ld-attrs">
          <div><dt>계약번호</dt><dd>{c.contractNo || <i className="nd">미상</i>}</dd></div>
          <div><dt>지사</dt><dd>{c.branch || <i className="nd">—</i>}</dd></div>
          <div><dt>용도</dt><dd>{c.ind || <i className="nd">—</i>}</dd></div>
          <div><dt>현재 경비형태</dt><dd>{c.currentProduct || <i className="nd">—</i>}</dd></div>
          {c.people != null && <div><dt>배치 인원</dt><dd>{c.people}명</dd></div>}
          <div><dt>계약 유지</dt><dd>{c.contractMonths != null ? c.contractMonths + '개월' : <i className="nd">—</i>}</dd></div>
          <div><dt>월 경비금액</dt><dd>{won(c.monthlyFee)}</dd></div>
        </dl>
        {c.buildingLedger && c.buildingLedger.matched && (
          <>
            <div className="ld-h" style={{ marginTop: 14 }}>건축물대장 <span className="faint" style={{ fontWeight: 400 }}>· 실연동(건축HUB)</span></div>
            <dl className="ld-attrs">
              <div><dt>연면적</dt><dd>{c.buildingLedger.gfa ? num(c.buildingLedger.gfa) + '㎡' : <i className="nd">NO_DATA</i>}</dd></div>
              <div><dt>층수</dt><dd>지상 {c.buildingLedger.grndFlr ?? '—'}층 / 지하 {c.buildingLedger.ugrndFlr ?? 0}층</dd></div>
              <div><dt>사용승인</dt><dd>{c.buildingLedger.approvalDate ? `${c.buildingLedger.approvalDate} (${c.buildingLedger.approvalYrAgo}년)` : <i className="nd">NO_DATA</i>}</dd></div>
              <div><dt>구조</dt><dd>{c.buildingLedger.struct || <i className="nd">—</i>}</dd></div>
              <div><dt>주용도</dt><dd>{c.buildingLedger.mainUse || <i className="nd">—</i>}</dd></div>
            </dl>
          </>
        )}
      </div>
    </div>
  );
}

// 통합 행
function PipelineRow({ c, rank, expanded, onToggle, onResult, recorded, logCount = 0 }) {
  const t = tierOf(c.score);
  const isB = c.track === 'B';
  const addr = isB
    ? `${c.contractNo ? '계약 ' + c.contractNo : '계약번호 미상'} · ${c.ind || ''}${c.branch ? ' · ' + c.branch : ''}`
    : `${c.address || ''}${c.use ? ' · ' + c.use : ''}${c.owner ? ' · ' + c.owner : ''}`;
  return (
    <div className={'lrow' + (expanded ? ' open' : '') + (isB && c.btype === 'both' ? ' lrow-priority' : '')}>
      <div className="lrow-main" onClick={onToggle}>
        <div className="lrow-rank">{rank}</div>
        <div className="lrow-id">
          <div className="lrow-name">
            {c.name}
            <TrackBadge track={c.track} />
            {isB && c.btype === 'both' && <Badge tone="danger" shape="pill" dot>우선 접촉</Badge>}
            {isB && c.b1 && <Badge tone="info" shape="pill">B-1 경비원</Badge>}
            {isB && c.b2 && <Badge tone="warning" shape="pill">B-2 중요실</Badge>}
            {isB && c.buildingLedger && c.buildingLedger.matched && <Badge tone="positive" shape="pill">건축물대장 매칭</Badge>}
            {!isB && c.noData && c.noData.length > 0 && <Badge tone="neutral">NO_DATA {c.noData.length}</Badge>}
          </div>
          <div className="lrow-addr">{addr}</div>
        </div>
        <div className="lrow-score">
          <Gauge score={c.score} />
          <span className="tierlab" style={{ color: t.color }}>{t.label}</span>
        </div>
        <div style={{ flex: 'none' }} onClick={e => e.stopPropagation()}>
          <span className="btnbadge-wrap">
            <Button size="sm" variant={recorded ? 'secondary' : 'primary'} onClick={() => onResult(c)}
              iconLeft={<MI n={recorded ? 'edit_note' : 'mic'} s={18} />}>{recorded ? '방문 결과 수정' : '방문 결과 입력'}</Button>
            {logCount > 0 && <span className="btnbadge">{logCount}</span>}
          </span>
        </div>
        <span className="lrow-more" aria-hidden="true">자세히<MI n="chevron_right" s={18} /></span>
      </div>
    </div>
  );
}

export function PipelineScreen({ data, onResult, recordedSet, logCounts = {}, floodSeasonOn = true }) {
  const D = window.APPDATA;
  const [track, setTrack] = useState('전체');   // 전체 / 신규 / 기존
  const [q, setQ] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [focusId, setFocusId] = useState(null);
  const [showFire, setShowFire] = useState(true);
  const [showFlood, setShowFlood] = useState(true);
  const [page, setPage] = useState(1);

  // 신규 후보의 제외/중복 항목은 목록에서 제외 (기존 고객엔 해당 없음)
  const active = data.filter(c => !(c.track === 'A' && (c.excluded || c.duplicate)));
  const qx = q.trim().toLowerCase();
  const filtered = active.filter(c =>
    (track === '전체' || (track === '신규' && c.track === 'A') || (track === '기존' && c.track === 'B')) &&
    (qx === '' || (`${c.name || ''} ${c.address || ''} ${c.ind || ''}`).toLowerCase().includes(qx)));
  filtered.sort((a, b) => (b.score == null ? -1 : b.score) - (a.score == null ? -1 : a.score));

  const counts = {
    all: active.length,
    new: active.filter(c => c.track === 'A').length,
    exist: active.filter(c => c.track === 'B').length,
  };

  useEffect(() => { setPage(1); }, [track, q]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const curPage = Math.min(page, totalPages);
  const pageBase = (curPage - 1) * PER_PAGE;
  const pageItems = filtered.slice(pageBase, pageBase + PER_PAGE);

  const branchName = (data.find(c => c.branch) || {}).branch;
  const branchBoundary = getBranchBoundary(branchName);
  const floodForView = (D.floodLayers || []).filter(fl => {
    const [a, b, c, d] = fl.bbox || [];
    return a != null && filtered.some(x => x.lat != null && x.lng != null && x.lng >= a - 0.02 && x.lng <= c + 0.02 && x.lat >= b - 0.02 && x.lat <= d + 0.02);
  });

  const downloadCsv = () => {
    const head = ['순위', '구분', '대상', '지역/계약정보', '점수', '등급'];
    const rows = filtered.map((c, i) => [i + 1, c.track === 'B' ? '기존' : '신규', c.name,
      c.track === 'B' ? (c.contractNo || '계약번호 미상') : (c.address || ''),
      c.score == null ? 'NO_DATA' : c.score, tierOf(c.score).label]);
    const csv = '﻿' + [head, ...rows].map(r => r.map(x => `"${String(x).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `신규진행현황_${todayCompact()}.csv`; a.click();
  };

  const select = (id) => { setExpanded(id); setFocusId(id); };
  const openItem = expanded != null ? filtered.find(c => c.id === expanded) : null;

  return (
    <div className="pc-content pc-content--wide fadein" data-screen-label="신규진행현황">
      <div className="retkpis rankkpis">
        {RANK_KPIS.map(k => (
          <button key={k.key} className={'retkpi' + (k.tone ? ' retkpi--' + k.tone : '') + (tierF === k.key ? ' on' : '')}
            onClick={() => setTierF(tierF === k.key && k.key !== 'all' ? 'all' : k.key)}>
            <span className="retkpi__ico"><MI n={k.icon} s={18} /></span>
            <span className="retkpi__n tnum">{tierCount(k.key)}<i>건</i></span>
            <span className="retkpi__lab">{k.label}</span>
          </button>
        ))}
      </div>
      <div className="filterbar">
        <div className="fb-row">
          <span className="fb-label"><MI n="filter_list" s={18} />구분</span>
          <div className="fb-chips" style={{ flex: '0 0 auto' }}>
            <Chip selected={track === '전체'} onClick={() => setTrack('전체')}>전체 {counts.all}</Chip>
            <Chip selected={track === '신규'} onClick={() => setTrack('신규')}>신규 {counts.new}</Chip>
            <Chip selected={track === '기존'} onClick={() => setTrack('기존')}>기존 {counts.exist}</Chip>
          </div>
          <span className="fb-label" style={{ marginLeft: 12 }}><MI n="search" s={18} />검색</span>
          <div style={{ width: 220 }}>
            <TextField value={q} onChange={e => setQ(e.target.value)} placeholder="상호·건물명·업종 검색" iconLeft={<MI n="search" s={18} />} />
          </div>
          {q && <Button size="sm" variant="line" onClick={() => setQ('')} iconLeft={<MI n="close" s={16} />}>해제</Button>}
        </div>
      </div>

      <div className="split">
        <div className="split-list">
          <div className="list-meta">
            <span className="muted"><b className="tnum">{filtered.length}</b>개 · 점수순 (기존 고객 우선 접촉 상위)</span>
            <Button size="sm" variant="line" onClick={downloadCsv} iconLeft={<MI n="download" s={18} />}>엑셀 다운로드</Button>
          </div>
          {filtered.length === 0
            ? <div className="nodata-box" style={{ margin: 12 }}><MI n="filter_alt_off" s={20} /><div>{q ? <>‘{q}’ 검색 결과가 없어요.</> : '해당 구분에 표시할 대상이 없어요.'}</div></div>
            : <>
              <div className="rows" style={{ padding: '4px 12px 12px' }}>
                {pageItems.map((c, i) => (
                  <div id={'row-' + c.id} key={c.id}>
                    <PipelineRow c={c} rank={pageBase + i + 1} expanded={expanded === c.id}
                      onToggle={() => { if (expanded === c.id) setExpanded(null); else select(c.id); }}
                      onResult={onResult} recorded={recordedSet.has(c.id)} logCount={logCounts[c.id] || 0} />
                  </div>))}
              </div>
              <Pager page={curPage} totalPages={totalPages} onChange={setPage} />
            </>}
        </div>
        <div className="split-map">
          <div className="map-top">
            <span className="eyebrow">타깃 분포</span>
            <span className="map-top__chips">
              <Chip selected={showFire} onClick={() => setShowFire(s => !s)}>최근 화재 위치</Chip>
              <Chip selected={showFlood} onClick={() => setShowFlood(s => !s)}>침수 위험 구역</Chip>
            </span>
          </div>
          <div style={{ flex: 1, position: 'relative' }}>
            {filtered.some(x => x.lat != null)
              ? <TargetMap candidates={filtered} firePointsLive={FIRE_OVERLAY.points} showFire={showFire} showFlood={showFlood} floodLayers={floodForView} branchBoundary={branchBoundary} selectedId={expanded} onSelect={select} focusId={focusId} fitKey={branchName || 'all'} variant="A" />
              : <div className="map-empty"><MI n="map" s={28} /><span>지도에 표시할 좌표가 없어요</span></div>}
          </div>
        </div>
      </div>
      {openItem && (
        <DetailModal title={openItem.name} subtitle={openItem.track === 'B' ? '기존 고객 · 업셀링' : '신규 후보'} onClose={() => setExpanded(null)}>
          {openItem.track === 'B' ? <ExistingDetail c={openItem} /> : <NewDetail c={openItem} t={tierOf(openItem.score)} />}
        </DetailModal>
      )}
    </div>
  );
}
