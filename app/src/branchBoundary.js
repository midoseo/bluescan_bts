/* ===== branchBoundary.js — 지사 관할 경계(근사) 폴리곤 생성 =====
 * 우편번호 경계 GeoJSON이 없으므로, 해당 지사로 매핑된 사업장 좌표들의
 * 볼록 껍질(convex hull)에 바깥쪽 여유(buffer)를 줘 "관할 영역"을 근사한다.
 * 결과는 GeoJSON Feature(Polygon). 지사별로 1회 계산 후 캐시.
 */
const _cache = new Map()

// Andrew's monotone chain — 입력/출력 좌표는 [lng, lat]
function convexHull(points) {
  const pts = points.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1])
  if (pts.length <= 2) return pts
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
  const lower = []
  for (const p of pts) { while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop(); lower.push(p) }
  const upper = []
  for (let i = pts.length - 1; i >= 0; i--) { const p = pts[i]; while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop(); upper.push(p) }
  lower.pop(); upper.pop()
  return lower.concat(upper)
}

// 중심에서 바깥으로 밀어 여유를 준다 (관할 경계가 사업장을 넉넉히 감싸도록)
function bufferHull(hull, factor = 0.18, minDeg = 0.004) {
  const cx = hull.reduce((s, p) => s + p[0], 0) / hull.length
  const cy = hull.reduce((s, p) => s + p[1], 0) / hull.length
  return hull.map(([x, y]) => {
    let dx = x - cx, dy = y - cy
    const len = Math.hypot(dx, dy) || 1
    const push = Math.max(len * factor, minDeg)
    return [x + (dx / len) * push, y + (dy / len) * push]
  })
}

export function getBranchBoundary(branch) {
  if (!branch) return null
  if (_cache.has(branch)) return _cache.get(branch)
  const D = (typeof window !== 'undefined' && window.APPDATA) || {}
  const src = [...(D.listA || []), ...(D.listB || [])]
    .filter(c => c.branch === branch && c.lat != null && c.lng != null)
    .map(c => [c.lng, c.lat])
  let out = null
  if (src.length >= 3) {
    let ring = bufferHull(convexHull(src))
    ring = ring.concat([ring[0]]) // 링 닫기
    out = { type: 'Feature', properties: { branch }, geometry: { type: 'Polygon', coordinates: [ring] } }
  }
  _cache.set(branch, out)
  return out
}
