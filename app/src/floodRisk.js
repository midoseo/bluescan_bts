/* ===== floodRisk.js — 유지고객(리스트 B) 침수 위험 신호 + 중요실 세분화 (목업) =====
 * 리스트 A는 build-data.mjs가 빌드 시점에 이미 point-in-polygon 판정을 끝내고 c.flood를 심어둔다.
 * 리스트 B(922건)는 원본 CSV에 그 계산이 없었으므로, 이미 앱에 실려있는 실제 침수 폴리곤
 * (window.APPDATA.floodLayers[].geo, 도시침수 기왕최대 시나리오)을 그대로 재사용해
 * 클라이언트에서 같은 방식(bbox 필터 → ring point-in-polygon)으로 판정한다.
 * → floodRiskOf()는 실제 지오메트리 기반 계산이고, 목업이 아니다.
 *
 * undergroundRoom(지하 중요시설 세분화 태그)만 목업이다 — 실제 관제 데이터에 해당 필드가
 * 없어서, B-2(중요실 보유)이면서 침수 위험구역에 있는 고객처에 한해 id 기반 결정론적 배정으로
 * 예시 태그를 붙인다. 실연동 시 이 부분만 실제 관제/현장조사 데이터로 교체하면 된다.
 */

// 침수 시 특히 위험한 지하 중요시설 예시 (배수펌프가 무력화되면 도미노로 침수가 커지는 순서 고려)
export const UNDERGROUND_CRITICAL_ROOMS = [
  '지하 전기실(수배전반)',   // 침수 1순위 — 정전·화재로 건물 전체 기능정지
  '지하 발전기실(비상발전기)', // 정전 시 최후 보루가 같이 침수되면 무방비
  '지하 펌프실(배수펌프)',    // 침수를 막아야 할 설비 자체가 침수되면 역기능
  '지하 기계실(공조·냉난방)',
  '지하 통신실(MDF)',
  '지하 서고·문서고',
];

function ptInRing(x, y, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1], xj = ring[j][0], yj = ring[j][1];
    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) inside = !inside;
  }
  return inside;
}
function ptInGeometry(lng, lat, geometry) {
  if (!geometry) return false;
  if (geometry.type === 'Polygon') return ptInRing(lng, lat, geometry.coordinates[0]);
  if (geometry.type === 'MultiPolygon') return geometry.coordinates.some(poly => ptInRing(lng, lat, poly[0]));
  return false;
}

// 리스트 A(build-data.mjs)와 동일한 판정 방식 — 실제 침수 폴리곤 기반, 목업 아님
export function floodRiskOf(lat, lng) {
  if (lat == null || lng == null) return null;
  const layers = (window.APPDATA && window.APPDATA.floodLayers) || [];
  for (const fl of layers) {
    const [a, b, c, d] = fl.bbox || [];
    if (a == null) continue;
    if (lng < a || lng > c || lat < b || lat > d) continue;   // 이 레이어 범위 밖
    const feats = (fl.geo && fl.geo.features) || [];
    const inPoly = feats.some(f => ptInGeometry(lng, lat, f.geometry));
    return { level: inPoly ? '주의' : '안전', area: fl.label };
  }
  return null;   // 커버리지 밖 = 데이터없음 (12개 시군구만 침수 레이어 보유)
}

function hashId(id) { let h = 0; const s = String(id); for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); }

// B-2(중요실 보유) + 침수 위험구역에 있는 고객처에만, id 기반으로 항상 같은 예시 태그 배정
export function demoUndergroundRoomFor(id) {
  return UNDERGROUND_CRITICAL_ROOMS[hashId(id) % UNDERGROUND_CRITICAL_ROOMS.length];
}

// 발표·시연용 계정(서강지사·마포구, build-data.mjs 주석 기준 고정 데모 지사) 보정.
// 리스트 A에서 이미 쓰던 방식과 동일하게 "합성 좌표를 실제 침수구역 내부 샘플점에 배치"한다.
// 좌표 두 곳 모두 서울 마포구 침수(기왕최대) 폴리곤에서 실제로 내부 판정되는 지점이며,
// floodRiskOf() 판정 로직 자체는 손대지 않는다 — 입력 좌표만 시연용으로 보정.
const DEMO_RELOCATE = {
  B2318: [126.906988, 37.5727],   // [lng, lat] — 서울 마포구 침수 폴리곤 내부
  B2512: [126.877507, 37.58614],  // [lng, lat] — 서울 마포구 침수 폴리곤 내부
};

// listB 원본을 건드리지 않고, flood/undergroundRoom을 얹은 새 배열을 반환
export function augmentListBFlood(listB) {
  return (listB || []).map(b => {
    const relo = DEMO_RELOCATE[b.id];
    const lat = relo ? relo[1] : b.lat;
    const lng = relo ? relo[0] : b.lng;
    const flood = floodRiskOf(lat, lng);
    const highRisk = !!(flood && flood.level === '주의' && b.b2);
    const base = relo ? { ...b, lat, lng } : b;
    return highRisk ? { ...base, flood, undergroundRoom: demoUndergroundRoomFor(b.id) } : { ...base, flood, undergroundRoom: null };
  });
}
