/* convert-flood.mjs — 도시침수 Shapefile(EPSG:5186) → WGS84 GeoJSON (public/flood/)
 * 데이터 폴더의 모든 "행정구역 … 도시침수지도" 하위 폴더 + 루트의 CFM_SGG_*.shp 를 자동 탐색해 변환. */
import * as shapefile from 'shapefile'
import proj4 from 'proj4'
import { mkdirSync, writeFileSync, readFileSync, readdirSync, statSync, existsSync } from 'node:fs'

const DATA = 'C:/Users/User/Desktop/26.6.9-12/빌더작업/데이터'
const OUTDIR = 'C:/Users/User/Desktop/260610 프로젝트/app/public/flood'
proj4.defs('EPSG:5186', '+proj=tmerc +lat_0=38 +lon_0=127 +k=1 +x_0=200000 +y_0=600000 +ellps=GRS80 +units=m +no_defs')
const toWGS = (xy) => proj4('EPSG:5186', 'WGS84', xy)
const SIDO_SHORT = { '서울특별시': '서울', '부산광역시': '부산', '대구광역시': '대구', '인천광역시': '인천', '광주광역시': '광주', '대전광역시': '대전', '울산광역시': '울산', '세종특별자치시': '세종', '경기도': '경기', '강원특별자치도': '강원', '충청북도': '충북', '충청남도': '충남', '전북특별자치도': '전북', '전라남도': '전남', '경상북도': '경북', '경상남도': '경남', '제주특별자치도': '제주' }

function reproj(geom) {
  const map = (coords, depth) => depth === 1 ? coords.map(p => { const [lng, lat] = toWGS([p[0], p[1]]); return [+lng.toFixed(6), +lat.toFixed(6)]; })
    : coords.map(c => map(c, depth - 1))
  if (geom.type === 'Polygon') return { type: 'Polygon', coordinates: map(geom.coordinates, 2) }
  if (geom.type === 'MultiPolygon') return { type: 'MultiPolygon', coordinates: map(geom.coordinates, 3) }
  return geom
}

// 폴더명 "행정구역 서울특별시 강남구 기왕최대 도시침수지도" → "서울 강남구"
function labelFromFolder(name) {
  const m = name.match(/행정구역\s+(.+?)\s+기왕최대/)
  if (!m) return name
  const toks = m[1].split(/\s+/)
  const sido = SIDO_SHORT[toks[0]] || toks[0]
  const rest = toks.slice(1).filter(t => /(구|군|시)$/.test(t))
  return `${sido} ${rest.length ? rest[rest.length - 1] : toks.slice(1).join(' ')}`  // 마지막 구/군 우선
}

// 데이터 폴더 스캔: { code, shp, dbf, label }
function discover() {
  const found = new Map() // code -> {shp,dbf,label}
  for (const ent of readdirSync(DATA)) {
    const p = `${DATA}/${ent}`
    if (statSync(p).isDirectory() && /도시침수지도/.test(ent)) {
      for (const f of readdirSync(p)) {
        const m = f.match(/^CFM_SGG_(\d+)_MAX\.shp$/)
        if (m) found.set(m[1], { shp: `${p}/${f}`, dbf: `${p}/CFM_SGG_${m[1]}_MAX.dbf`, label: labelFromFolder(ent) })
      }
    }
  }
  // 루트의 loose CFM_SGG_*.shp (폴더에 없는 코드만)
  for (const f of readdirSync(DATA)) {
    const m = f.match(/^CFM_SGG_(\d+)_MAX\.shp$/)
    if (m && !found.has(m[1])) found.set(m[1], { shp: `${DATA}/${f}`, dbf: `${DATA}/CFM_SGG_${m[1]}_MAX.dbf`, label: `시군구 ${m[1]}` })
  }
  return found
}

async function convert(code, shp, dbf, label) {
  const source = await shapefile.open(shp, existsSync(dbf) ? dbf : null, { encoding: 'utf-8' })
  const features = []
  let r
  while (!(r = await source.read()).done) { const f = r.value; if (!f.geometry) continue; features.push({ type: 'Feature', properties: f.properties || {}, geometry: reproj(f.geometry) }) }
  const fc = { type: 'FeatureCollection', features }
  mkdirSync(OUTDIR, { recursive: true })
  writeFileSync(`${OUTDIR}/urban_${code}_MAX.geojson`, JSON.stringify(fc))
  console.log(`  [${code}] ${label} — features=${features.length}  bytes=${JSON.stringify(fc).length}`)
  return features.length
}

const layers = discover()
console.log('발견된 침수 시군구:', layers.size)
const manifest = []
for (const [code, { shp, dbf, label }] of layers) { const n = await convert(code, shp, dbf, label); manifest.push({ code, label, path: `/flood/urban_${code}_MAX.geojson`, file: `public/flood/urban_${code}_MAX.geojson`, features: n }) }
writeFileSync(`${OUTDIR}/manifest.json`, JSON.stringify(manifest, null, 0))
console.log('완료 →', OUTDIR, '(manifest.json 포함)')
