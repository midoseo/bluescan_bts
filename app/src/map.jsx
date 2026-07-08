/* ===== map.jsx — Kakao Maps target map (S-1 sub/graphic palette) =====
 * Leaflet → 카카오맵 이식. 현재 화면이 그리던 것만 이식한다:
 *  후보 마커(등급/상태/주의 색), 화재 구역(빨간 점선 폴리곤 + 이름 핀), 침수 구역(하늘색 채움),
 *  후보 범위로 자동 확대(fitBounds), 선택 시 포커스(panTo).
 * (branchBoundary·firePointsLive·firePoints prop은 기존 Leaflet 버전에서도 미사용이라 그대로 무시한다.)
 * SDK는 index.html에서 autoload=false로 로드 → 여기서 kakao.maps.load 로 초기화한다.
 */
import React from 'react'
import { tierOf } from './components.jsx'
const { useRef, useEffect, useState } = React

// PRD 등급별 핀 색 (S/A/B/C/D) + 미방문/NO_DATA
const TIER_HEX = { S: '#0f8f63', A: '#1fb279', B: '#1d6ceb', C: '#e2971e', D: '#9aa0a6', nodata: '#9d9d9d', visit: '#1d6ceb' };
// 방문 결과 상태별 핀 색
const STATUS_HEX = { done: '#1fb279', revisit: '#e2971e', reject: '#e5484d', won: '#1d6ceb' };
const STATUS_LABEL = { done: '방문완료', revisit: '재방문필요', reject: '거절', won: '수주완료' };
// 도시침수 예상구역 — 시니어 식별력이 높은 장파장(경고 주황) 계열로. 강 색과도, 단파장 대비 시인성도↑
const FLOOD_FILL = '#f97316';    // 경고 주황(채움) — 장파장, 위험 강조
const FLOOD_STROKE = '#c2410c';  // 진한 주황(테두리) — 구역 경계를 또렷하게
const floodCache = new Map();

// GeoJSON(Feature/FeatureCollection/Polygon/MultiPolygon) → 카카오 LatLng 경로 배열(외곽 링만)
function geoToKakaoPaths(geo) {
  const kakao = window.kakao;
  const out = [];
  if (!geo) return out;
  const ring = (coords) => coords.map(([lng, lat]) => new kakao.maps.LatLng(lat, lng));
  const g = geo.type === 'Feature' ? geo.geometry : geo;
  if (!g) return out;
  if (g.type === 'Polygon') { if (g.coordinates && g.coordinates[0]) out.push(ring(g.coordinates[0])); }
  else if (g.type === 'MultiPolygon') { (g.coordinates || []).forEach(poly => { if (poly[0]) out.push(ring(poly[0])); }); }
  else if (g.type === 'FeatureCollection') { (g.features || []).forEach(f => geoToKakaoPaths(f).forEach(p => out.push(p))); }
  return out;
}

// 마커 색/라벨 — A(점수 티어) / B(방문 상태) / C(유지 주의여부)
function markerInfo(c, variant, visits) {
  if (variant === 'B') {
    const st = visits && visits[c.id] && visits[c.id].status;
    if (st && STATUS_HEX[st]) return { col: STATUS_HEX[st], big: st === 'won', label: `${c.name} · ${STATUS_LABEL[st]}` };
    return { col: TIER_HEX.nodata, big: false, label: `${c.name} · 미방문` };
  }
  if (variant === 'C') {
    return c.attention
      ? { col: '#e5484d', big: true, label: `${c.name} · 주의 필요` }
      : { col: '#1d6ceb', big: false, label: `${c.name} · 안정` };
  }
  const t = tierOf(c.score);
  return { col: TIER_HEX[t.key] || TIER_HEX.nodata, big: c.score >= 81, label: `${c.name} · ${c.score == null ? 'N/A' : c.score + '점 (' + t.key + ')'}` };
}

export function TargetMap({ candidates, fireRegions, showFire, showFlood = true, floodLayers, visits, selectedId, onSelect, focusId, fitKey, variant = 'A' }) {
  const elRef = useRef(null), mapRef = useRef(null), infoRef = useRef(null);
  const candOverlays = useRef([]), fireOverlays = useRef([]), floodOverlays = useRef([]);
  const markerMap = useRef({});
  const [ready, setReady] = useState(false);

  // 초기화 — SDK/컨테이너가 준비될 때까지 재시도(탭을 먼저 열든 나중에 열든 확실히 렌더).
  // autoload=false 이므로 kakao.maps.load 로 로딩을 시작하고, kakao.maps.Map(생성자)과 elRef가
  // 모두 준비된 순간 지도를 만든다. (한 번만 시도하면 첫 로드 타이밍에 빈 지도가 되는 문제를 방지)
  useEffect(() => {
    let cancelled = false, ro = null, t = null, loadAsked = false;
    const finish = (map) => {
      mapRef.current = map;
      infoRef.current = new window.kakao.maps.InfoWindow({ removable: true, zIndex: 5 });
      setReady(true);
      [60, 200, 500, 1000].forEach(ms => setTimeout(() => { try { map.relayout(); } catch (e) { /* ignore */ } }, ms));
      if (typeof ResizeObserver !== 'undefined' && elRef.current) {
        ro = new ResizeObserver(() => { try { map.relayout(); } catch (e) { /* ignore */ } });
        ro.observe(elRef.current);
      }
    };
    const tryCreate = () => {
      if (cancelled || mapRef.current) return true;
      const k = window.kakao;
      if (!k || !k.maps) return false;
      if (typeof k.maps.Map !== 'function') {          // 아직 maps 라이브러리 로딩 전 → 로딩 시작
        if (!loadAsked && typeof k.maps.load === 'function') { loadAsked = true; k.maps.load(() => { }); }
        return false;
      }
      if (!elRef.current) return false;
      try { finish(new k.maps.Map(elRef.current, { center: new k.maps.LatLng(37.49, 126.90), level: 6 })); return true; }
      catch (e) { return false; }                       // 인증 실패 등 — 계속 재시도(무해)
    };
    if (!tryCreate()) t = setInterval(() => { if (tryCreate()) { clearInterval(t); t = null; } }, 100);
    return () => { cancelled = true; if (t) clearInterval(t); if (ro) { try { ro.disconnect(); } catch (e) { /* ignore */ } } mapRef.current = null; };
  }, []);

  const openInfo = (html, pos) => {
    const map = mapRef.current; if (!map || !infoRef.current) return;
    infoRef.current.setContent(`<div style="padding:6px 10px;font:13px/1.4 'SamsungOne Korean',Pretendard,system-ui,sans-serif;white-space:nowrap;max-width:240px;">${html}</div>`);
    infoRef.current.setPosition(pos);
    infoRef.current.open(map);
  };

  // 후보 마커
  useEffect(() => {
    if (!ready) return;
    const map = mapRef.current, kakao = window.kakao; if (!map) return;
    candOverlays.current.forEach(o => o.setMap(null));
    candOverlays.current = []; markerMap.current = {};
    // 선택/방문된 핀이 위로 오도록 정렬
    const rank = (c) => (c.id === selectedId ? 2 : (visits && visits[c.id] ? 1 : 0));
    [...candidates].sort((a, b) => rank(a) - rank(b)).forEach(c => {
      if (c.lat == null || c.lng == null) return;
      const sel = c.id === selectedId;
      const { col, big, label } = markerInfo(c, variant, visits);
      // 물방울 핀(시안 B) — 위치를 꼭짓점으로 가리키고, 마우스 오버 시 물건명 툴팁을 띄운다.
      const escName = String(c.name || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const dw = sel ? 38 : (big ? 34 : 30);
      const dh = Math.round(dw / 30 * 40);
      const el = document.createElement('div');
      el.className = 'mk-pin' + (sel ? ' mk-pin--sel' : '') + (big ? ' mk-pin--big' : '');
      el.style.setProperty('--mkcol', col);
      el.innerHTML =
        `<span class="mk-tip">${escName}</span>` +
        `<svg class="mk-drop" width="${dw}" height="${dh}" viewBox="0 0 30 40" aria-hidden="true">` +
          `<path d="M15 1.5 C7.5 1.5 2 7 2 14.5 C2 23 15 38.5 15 38.5 C15 38.5 28 23 28 14.5 C28 7 22.5 1.5 15 1.5 Z" fill="${col}" stroke="#fff" stroke-width="2.4"/>` +
          `<circle cx="15" cy="14.5" r="4.8" fill="#fff"/>` +
        `</svg>`;
      el.title = label;
      const pos = new kakao.maps.LatLng(c.lat, c.lng);
      const ov = new kakao.maps.CustomOverlay({ position: pos, content: el, xAnchor: 0.5, yAnchor: 1, zIndex: sel ? 40 : (big ? 20 : 10), clickable: true });
      el.addEventListener('click', () => { onSelect && onSelect(c.id); openInfo(label, pos); });
      ov.setMap(map);
      candOverlays.current.push(ov);
      markerMap.current[c.id] = { pos, label };
    });
  }, [ready, candidates, selectedId, variant, visits]);

  // 화재 구역 — 후보 분포 범위와 겹치는 구역만 (전국 난립 방지)
  useEffect(() => {
    if (!ready) return;
    const map = mapRef.current, kakao = window.kakao; if (!map) return;
    fireOverlays.current.forEach(o => o.setMap(null)); fireOverlays.current = [];
    if (!showFire) return;
    const pts = candidates.filter(c => c.lat != null && c.lng != null);
    let bb = null;
    if (pts.length) { let a = 999, b = 999, c = -999, d = -999; pts.forEach(p => { if (p.lng < a) a = p.lng; if (p.lng > c) c = p.lng; if (p.lat < b) b = p.lat; if (p.lat > d) d = p.lat; }); bb = [a - 0.18, b - 0.18, c + 0.18, d + 0.18]; }
    const regions = (fireRegions || []).filter(r => { if (!bb || !r.bbox) return true; const [a, b, c, d] = r.bbox; return !(c < bb[0] || a > bb[2] || d < bb[1] || b > bb[3]); });
    regions.forEach(r => {
      if (!r.geo) return;
      const recent = r.minDays < 30;
      geoToKakaoPaths(r.geo).forEach(path => {
        const poly = new kakao.maps.Polygon({ path, strokeWeight: recent ? 2 : 1, strokeColor: '#dc2626', strokeOpacity: 0.9, strokeStyle: 'shortdash', fillColor: '#dc2626', fillOpacity: recent ? 0.08 : 0.04 });
        poly.setMap(map); fireOverlays.current.push(poly);
        kakao.maps.event.addListener(poly, 'click', (me) => openInfo(`<b style="color:#dc2626">🔥 ${r.name} · 최근 화재 ${r.count}건</b><br><span style="color:#555">${(r.fires || []).map(x => `· ${x.days}일 전 ${x.scale} — ${x.title || ''}`).join('<br>')}</span>`, me.latLng));
      });
      if (Array.isArray(r.bbox)) {
        const [a, b, c, d] = r.bbox;
        const el = document.createElement('div');
        el.style.cssText = 'background:#dc2626;color:#fff;font:11px/1 sans-serif;padding:3px 7px;border-radius:11px;white-space:nowrap;box-shadow:0 1px 3px rgba(0,0,0,.3);';
        el.textContent = `🔥 ${r.name} ${r.count}건`;
        const pin = new kakao.maps.CustomOverlay({ position: new kakao.maps.LatLng((b + d) / 2, (a + c) / 2), content: el, xAnchor: 0.5, yAnchor: 0.5, zIndex: 3 });
        pin.setMap(map); fireOverlays.current.push(pin);
      }
    });
  }, [ready, showFire, fireRegions, candidates]);

  // 침수 예상구역 — 강수량 지도처럼 진한 인디고 채움 + 또렷한 테두리로 강조
  useEffect(() => {
    if (!ready) return;
    const map = mapRef.current, kakao = window.kakao; if (!map) return;
    floodOverlays.current.forEach(o => o.setMap(null)); floodOverlays.current = [];
    if (!showFlood || !floodLayers || !floodLayers.length) return;
    let cancelled = false;
    const draw = (data) => {
      if (cancelled) return;
      geoToKakaoPaths(data).forEach(path => {
        const poly = new kakao.maps.Polygon({ path, strokeWeight: 2, strokeColor: FLOOD_STROKE, strokeOpacity: 0.9, strokeStyle: 'solid', fillColor: FLOOD_FILL, fillOpacity: 0.55 });
        poly.setMap(map); floodOverlays.current.push(poly);
      });
    };
    floodLayers.forEach(layer => {
      if (layer.geo) draw(layer.geo);
      else if (floodCache.has(layer.path)) draw(floodCache.get(layer.path));
      else if (layer.path) fetch(layer.path).then(r => r.json()).then(d => { floodCache.set(layer.path, d); draw(d); }).catch(() => { });
    });
    return () => { cancelled = true; };
  }, [ready, floodLayers, showFlood]);

  // 필터 변경 시 후보 범위로 자동 확대
  useEffect(() => {
    if (!ready) return;
    const map = mapRef.current, kakao = window.kakao; if (!map) return;
    const pts = candidates.filter(c => c.lat != null && c.lng != null);
    const id = setTimeout(() => {
      try {
        map.relayout();
        if (pts.length === 0) { map.setCenter(new kakao.maps.LatLng(37.49, 126.90)); map.setLevel(8); return; }
        if (pts.length === 1) { map.setCenter(new kakao.maps.LatLng(pts[0].lat, pts[0].lng)); map.setLevel(4); return; }
        const bounds = new kakao.maps.LatLngBounds();
        pts.forEach(p => bounds.extend(new kakao.maps.LatLng(p.lat, p.lng)));
        map.setBounds(bounds);
      } catch (e) { /* ignore */ }
    }, 120);
    return () => clearTimeout(id);
  }, [ready, fitKey]);

  // 선택 포커스 — 해당 위치로 이동 + 정보창
  useEffect(() => {
    if (!ready || !focusId) return;
    const map = mapRef.current, kakao = window.kakao; if (!map) return;
    const c = candidates.find(x => x.id === focusId);
    if (c && c.lat != null) {
      try { map.setLevel(3); map.panTo(new kakao.maps.LatLng(c.lat, c.lng)); } catch (e) { /* ignore */ }
      const m = markerMap.current[focusId];
      if (m) openInfo(m.label, m.pos);
    }
  }, [ready, focusId]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={elRef} style={{ position: 'absolute', inset: 0 }} />
      <div className="map-legend">
        {variant === 'B' ? (
          <>
            <div className="row"><span className="dot" style={{ background: STATUS_HEX.done }} />방문완료</div>
            <div className="row"><span className="dot" style={{ background: STATUS_HEX.revisit }} />재방문필요</div>
            <div className="row"><span className="dot" style={{ background: STATUS_HEX.reject }} />거절</div>
            <div className="row"><span className="dot" style={{ background: STATUS_HEX.won }} />수주완료</div>
            <div className="row"><span className="dot" style={{ background: TIER_HEX.nodata }} />미방문</div>
            <div className="row"><span className="lg-dash" />최근 화재 발생 구역</div>
            <div className="row"><span className="dot dot--flood" style={{ background: FLOOD_FILL }} />도시침수 예상구역</div>
          </>
        ) : variant === 'C' ? (
          <>
            <div className="row"><span className="dot dot--tri" />주의 필요</div>
            <div className="row"><span className="dot" style={{ background: '#1d6ceb' }} />안정</div>
          </>
        ) : (
          <>
            <div className="row"><span className="dot" style={{ background: TIER_HEX.S }} />S 91+ · 최우선</div>
            <div className="row"><span className="dot" style={{ background: TIER_HEX.A }} />A 81–90 · 유망</div>
            <div className="row"><span className="dot" style={{ background: TIER_HEX.B }} />B 71–80 · 관계형성</div>
            <div className="row"><span className="dot" style={{ background: TIER_HEX.C }} />C 51–70 · 모니터링</div>
            <div className="row"><span className="dot" style={{ background: TIER_HEX.D }} />D 50↓ / NO_DATA</div>
            <div className="row"><span className="lg-dash" />최근 화재 발생 구역</div>
            <div className="row"><span className="dot dot--flood" style={{ background: FLOOD_FILL }} />도시침수 예상구역</div>
          </>
        )}
      </div>
    </div>
  );
}
