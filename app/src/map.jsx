/* ===== map.jsx — Leaflet target map (S-1 sub/graphic palette) ===== */
import React from 'react'
import L from 'leaflet'
import { tierOf } from './components.jsx'
const { useRef, useEffect } = React

// PRD 등급별 핀 색 (S/A/B/C/D) + 미방문/NO_DATA
const TIER_HEX = { S: '#0f8f63', A: '#1fb279', B: '#1d6ceb', C: '#e2971e', D: '#9aa0a6', nodata: '#9d9d9d', visit: '#1d6ceb' };
// 방문 결과 상태별 핀 색 (방문완료-초록 / 재방문필요-노랑 / 거절-빨강 / 수주완료-파랑)
const STATUS_HEX = { done: '#1fb279', revisit: '#e2971e', reject: '#e5484d', won: '#1d6ceb' };
const STATUS_LABEL = { done: '방문완료', revisit: '재방문필요', reject: '거절', won: '수주완료' };
const FLOOD_FILL = '#2b9eff'; // 침수 위험 구역 — 선명한 파랑 (아이폰 강수량 느낌)
const FIRE_FILL = '#ff3b30';  // 최근 화재 지역 — 선명한 빨강
const BRANCH_LINE = '#7c3aed'; // 관할 경계 — 보라(침수/화재와 구분)
const floodCache = new Map(); // path -> geojson

// 마커 색/툴팁 — A(점수 티어) / B(방문 결과 상태, 미방문은 중립색) / C(유지고객 — 주의필요 여부, 스코어 아님)
function markerInfo(c, variant, visits) {
  if (variant === 'B') {
    const st = visits && visits[c.id] && visits[c.id].status;
    if (st && STATUS_HEX[st]) return { col: STATUS_HEX[st], big: st === 'won', label: `${c.name} · ${STATUS_LABEL[st]}` };
    return { col: TIER_HEX.nodata, big: false, label: `${c.name} · 미방문` };
  }
  if (variant === 'C') {
    const attention = !!c.attention;
    return { col: attention ? STATUS_HEX.reject : STATUS_HEX.won, big: attention, label: `${c.name} · ${attention ? '주의 필요' : '안정'}` };
  }
  const t = tierOf(c.score);
  return { col: TIER_HEX[t.key] || TIER_HEX.nodata, big: c.score >= 81, label: `${c.name} · ${c.score == null ? 'N/A' : c.score + '점 (' + t.key + ')'}` };
}

export function TargetMap({ candidates, firePoints, fireRegions, liveFirePoints, firePointsLive, showFire, showFlood = true, floodLayers, branchBoundary, visits, selectedId, onSelect, focusId, fitKey, variant = 'A' }) {
  const elRef = useRef(null), mapRef = useRef(null);
  const candLayer = useRef(null), fireLayer = useRef(null), floodLayer = useRef(null), liveFireLayer = useRef(null), fireGlowLayer = useRef(null), branchLayer = useRef(null), markers = useRef({});

  useEffect(() => {
    if (mapRef.current || !L || !elRef.current) return;
    let map;
    try {
      map = L.map(elRef.current, { zoomControl: true, attributionControl: false,
        center: [37.49, 126.90], zoom: 11, scrollWheelZoom: true });
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { maxZoom: 19, subdomains: 'abcd' }).addTo(map);
      L.control.attribution({ prefix: false }).addAttribution('© OpenStreetMap, © CARTO').addTo(map);
      // feather(아이폰 강수량) 효과용 blur pane + 관할 경계 pane (마커 pane=600보다 아래)
      try {
        map.createPane('branchPane'); map.getPane('branchPane').style.zIndex = 383; map.getPane('branchPane').style.filter = 'blur(1.5px)';
        map.createPane('floodPane'); map.getPane('floodPane').style.zIndex = 385; map.getPane('floodPane').style.filter = 'blur(8px)';
        map.createPane('firePane'); map.getPane('firePane').style.zIndex = 390; map.getPane('firePane').style.filter = 'blur(8px)';
      } catch (e) { /* ignore */ }
      branchLayer.current = L.layerGroup().addTo(map);
      floodLayer.current = L.layerGroup().addTo(map);
      candLayer.current = L.layerGroup().addTo(map);
      fireLayer.current = L.layerGroup().addTo(map);
      fireGlowLayer.current = L.layerGroup().addTo(map);
      liveFireLayer.current = L.layerGroup().addTo(map);
      mapRef.current = map;
      setTimeout(() => { try { map.invalidateSize(); } catch (e) { /* ignore */ } }, 60);
      setTimeout(() => { try { map.invalidateSize(); } catch (e) { /* ignore */ } }, 400);
    } catch (e) { /* Leaflet init failed — keep the rest of the screen alive */ }
    return () => {
      try { map && map.remove(); } catch (e) { /* ignore */ }
      mapRef.current = null; candLayer.current = null; fireLayer.current = null; floodLayer.current = null; liveFireLayer.current = null; fireGlowLayer.current = null; branchLayer.current = null; markers.current = {};
    };
  }, []);

  // 도시침수 예상구역 — 테두리 없이 반투명 하늘색으로만 채움 (A·B 공통)
  useEffect(() => {
    const fg = floodLayer.current; if (!fg) return;
    fg.clearLayers();
    if (!showFlood || !floodLayers || !floodLayers.length) return;
    let cancelled = false;
    floodLayers.forEach(layer => {
      const draw = (data) => {
        if (cancelled || !floodLayer.current) return;
        L.geoJSON(data, { pane: 'floodPane', style: { stroke: false, fill: true, fillColor: FLOOD_FILL, fillOpacity: 0.6 } })
          .bindPopup(`<b style="color:#0284c7">💧 침수 위험 구역 (기왕최대)</b><br><span style="color:#555">${layer.label}</span>`)
          .addTo(floodLayer.current);
      };
      if (layer.geo) draw(layer.geo);                                  // 데이터에 인라인된 GeoJSON (단일 HTML 대응)
      else if (floodCache.has(layer.path)) draw(floodCache.get(layer.path));
      else if (layer.path) fetch(layer.path).then(r => r.json()).then(d => { floodCache.set(layer.path, d); draw(d); }).catch(() => { });
    });
    return () => { cancelled = true; };
  }, [floodLayers, showFlood]);

  // 화재 오버레이 — 최근 화재가 발생한 군/구 행정구역을 빨간 점선으로 표현
  useEffect(() => {
    if (!fireLayer.current) return;
    fireLayer.current.clearLayers();
    if (!showFire) return;
    const regions = fireRegions || [];
    // 현재 후보 분포 범위와 겹치는 화재 구역만 표시 (전국 점선 난립 방지)
    const pts = candidates.filter(c => c.lat != null && c.lng != null);
    let bb = null;
    if (pts.length) { let a = 999, b = 999, c = -999, d = -999; pts.forEach(p => { if (p.lng < a) a = p.lng; if (p.lng > c) c = p.lng; if (p.lat < b) b = p.lat; if (p.lat > d) d = p.lat; }); bb = [a - 0.18, b - 0.18, c + 0.18, d + 0.18]; }
    const inView = regions.filter(r => { if (!bb || !r.bbox) return true; const [a, b, c, d] = r.bbox; return !(c < bb[0] || a > bb[2] || d < bb[1] || b > bb[3]); });
    inView.forEach(r => {
      const recent = r.minDays < 30;
      L.geoJSON(r.geo, { pane: 'firePane', style: { stroke: false, fill: true, fillColor: FIRE_FILL, fillOpacity: recent ? 0.6 : 0.42 } })
        .bindPopup(`<b style="color:#dc2626">🔥 ${r.name} · 최근 화재 ${r.count}건</b><br><span style="color:#555">${r.fires.map(x => `· ${x.days}일 전 ${x.scale} — ${x.title || ''}`).join('<br>')}</span>`)
        .addTo(fireLayer.current);
      if (Array.isArray(r.bbox)) { const [a, b, c, d] = r.bbox;
        L.marker([(b + d) / 2, (a + c) / 2], { icon: L.divIcon({ className: 'fire-pin', html: `<span>🔥 ${r.name} ${r.count}건</span>`, iconSize: null }), interactive: false, keyboard: false }).addTo(fireLayer.current); }
    });
  }, [showFire, fireRegions, candidates]);

  // 실데이터 화재 포인트 글로우 — firePane blur로 feather(아이폰 강수량 느낌), 최근일수록 진하게
  useEffect(() => {
    const g = fireGlowLayer.current; if (!g) return;
    g.clearLayers();
    if (!showFire || !firePointsLive || !firePointsLive.length) return;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    firePointsLive.forEach(f => {
      if (f.lat == null || f.lng == null) return;
      let daysAgo = 0;
      if (f.date) { const d = new Date(f.date + 'T00:00:00'); daysAgo = Math.max(0, Math.round((today - d) / 86400000)); }
      const fade = Math.max(0.28, 0.7 - daysAgo * 0.02);   // 최근=진하게, 오래될수록 옅게
      L.circleMarker([f.lat, f.lng], { pane: 'firePane', radius: 17, stroke: false, fillColor: FIRE_FILL, fillOpacity: fade * 0.55 }).addTo(g);
      L.circleMarker([f.lat, f.lng], { pane: 'firePane', radius: 7, stroke: false, fillColor: FIRE_FILL, fillOpacity: fade })
        .bindTooltip(`🔥 ${f.time || ''} · ${f.loc || ''}${f.type ? ' · ' + f.type : ''}`, { direction: 'top', offset: [0, -6] })
        .addTo(g);
    });
  }, [showFire, firePointsLive]);

  // 소방청(국민안전24) 실시간 화재 출동 지점 — 개별 마커 (같은 "화재 오버레이" 토글로 함께 켜짐)
  useEffect(() => {
    if (!liveFireLayer.current) return;
    liveFireLayer.current.clearLayers();
    if (!showFire || !liveFirePoints || !liveFirePoints.length) return;
    liveFirePoints.forEach(f => {
      if (f.lat == null || f.lng == null) return;
      L.marker([f.lat, f.lng], { icon: L.divIcon({ className: 'livefire-pin', html: '🚒', iconSize: [22, 22], iconAnchor: [11, 11] }) })
        .bindTooltip(`${f.time} · ${f.loc} · ${f.scale}`, { direction: 'top', offset: [0, -8] })
        .addTo(liveFireLayer.current);
    });
  }, [showFire, liveFirePoints]);

  // 지사 관할 경계 — 보라 점선(feather) + 옅은 채움
  useEffect(() => {
    const bl = branchLayer.current; if (!bl) return;
    bl.clearLayers();
    if (!branchBoundary) return;
    L.geoJSON(branchBoundary, { pane: 'branchPane', style: { color: BRANCH_LINE, weight: 3, opacity: .9, dashArray: '3 7', lineCap: 'round', lineJoin: 'round', fill: true, fillColor: BRANCH_LINE, fillOpacity: 0.05 } })
      .bindPopup(`<b style="color:${BRANCH_LINE}">${branchBoundary.properties?.branch || ''} 관할 경계</b><br><span style="color:#555">담당 사업장 분포 기준 근사 영역</span>`)
      .addTo(bl);
  }, [branchBoundary]);

  useEffect(() => {
    if (!candLayer.current) return;
    candLayer.current.clearLayers(); markers.current = {};
    // 겹치는 핀끼리는 '방문 결과 있는 핀'과 '선택된 핀'이 항상 위에 오도록 정렬
    // (미방문 회색 핀이 색상 핀 위를 덮어 '고리처럼' 보이는 현상 방지)
    const rank = (c) => (c.id === selectedId ? 2 : (visits && visits[c.id] ? 1 : 0));
    const ordered = [...candidates].sort((a, b) => rank(a) - rank(b));
    ordered.forEach(c => {
      if (c.lat == null) return;
      const sel = c.id === selectedId;
      const { col, big, label } = markerInfo(c, variant, visits);
      const m = L.circleMarker([c.lat, c.lng], { radius: sel ? 11 : (big ? 8 : 7), color: '#fff', weight: sel ? 3 : 2, fillColor: col, fillOpacity: 1 });
      m.bindTooltip(label, { direction: 'top', offset: [0, -6] });
      m.on('click', () => onSelect && onSelect(c.id));
      m.addTo(candLayer.current); markers.current[c.id] = m;
      if (rank(c) > 0 && m.bringToFront) m.bringToFront();
    });
  }, [candidates, selectedId, variant, visits]);

  // 군·구 / 읍·면·동 등 필터가 바뀌면 해당 범위로 지도 확대
  useEffect(() => {
    const map = mapRef.current; if (!map) return;
    const pts = candidates.filter(c => c.lat != null && c.lng != null).map(c => [c.lat, c.lng]);
    const run = () => {
      try {
        try { map.invalidateSize(); } catch (e) { /* ignore */ }
        // 관할 경계가 있으면 그 경계에 고정 (필터·페이지가 바뀌어도 지도 뷰 유지)
        if (branchBoundary && branchBoundary.geometry) {
          const ring = branchBoundary.geometry.coordinates[0].map(([lng, lat]) => [lat, lng]);
          map.fitBounds(L.latLngBounds(ring), { padding: [26, 26], maxZoom: 15 });
          return;
        }
        if (pts.length === 0) { map.setView([37.49, 126.90], 11); return; }
        if (pts.length === 1) { map.setView(pts[0], 15); return; }
        map.fitBounds(L.latLngBounds(pts), { padding: [44, 44], maxZoom: 16 });
      } catch (e) { /* ignore */ }
    };
    const id = setTimeout(run, 80);
    return () => clearTimeout(id);
  }, [fitKey]);

  useEffect(() => {
    if (!mapRef.current || !focusId) return;
    const c = candidates.find(x => x.id === focusId);
    if (c && c.lat != null) { try { mapRef.current.invalidateSize(); } catch (e) { /* ignore */ } const m = markers.current[focusId]; if (m) { try { m.openTooltip(); } catch (e) { /* ignore */ } if (m.bringToFront) m.bringToFront(); } }
  }, [focusId]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={elRef} style={{ position: 'absolute', inset: 0 }} />
      <div className="map-legend">
        {variant === 'C' ? (
          <>
            <div className="row"><span className="dot" style={{ background: STATUS_HEX.reject }} />주의 필요</div>
            <div className="row"><span className="dot" style={{ background: STATUS_HEX.won }} />안정</div>
          </>
        ) : variant === 'B' ? (
          <>
            <div className="row"><span className="dot" style={{ background: STATUS_HEX.done }} />방문완료</div>
            <div className="row"><span className="dot" style={{ background: STATUS_HEX.revisit }} />재방문필요</div>
            <div className="row"><span className="dot" style={{ background: STATUS_HEX.reject }} />거절</div>
            <div className="row"><span className="dot" style={{ background: STATUS_HEX.won }} />수주완료</div>
            <div className="row"><span className="dot" style={{ background: TIER_HEX.nodata }} />미방문</div>
            <div className="row"><span className="dot dot--flood" style={{ background: FIRE_FILL }} />최근 화재 지역</div>
            <div className="row">🚒 소방청 실시간 화재출동</div>
            <div className="row"><span className="dot dot--flood" style={{ background: FLOOD_FILL }} />침수 위험 구역</div>
            {branchBoundary && <div className="row"><span style={{ display: 'inline-block', width: 16, height: 0, borderTop: `3px dashed ${BRANCH_LINE}`, flex: 'none' }} />관할 경계</div>}
          </>
        ) : (
          <>
            <div className="row"><span className="dot" style={{ background: TIER_HEX.S }} />S 91+ · 최우선</div>
            <div className="row"><span className="dot" style={{ background: TIER_HEX.A }} />A 81–90 · 유망</div>
            <div className="row"><span className="dot" style={{ background: TIER_HEX.B }} />B 71–80 · 관계형성</div>
            <div className="row"><span className="dot" style={{ background: TIER_HEX.C }} />C 51–70 · 모니터링</div>
            <div className="row"><span className="dot" style={{ background: TIER_HEX.D }} />D 50↓ / NO_DATA</div>
            <div className="row"><span className="dot dot--flood" style={{ background: FIRE_FILL }} />최근 화재 지역</div>
            <div className="row">🚒 소방청 실시간 화재출동</div>
            <div className="row"><span className="dot dot--flood" style={{ background: FLOOD_FILL }} />침수 위험 구역</div>
            {branchBoundary && <div className="row"><span style={{ display: 'inline-block', width: 16, height: 0, borderTop: `3px dashed ${BRANCH_LINE}`, flex: 'none' }} />관할 경계</div>}
          </>
        )}
      </div>
    </div>
  );
}
