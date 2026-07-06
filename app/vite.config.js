import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

/* 블루스캔 타깃 발굴 — React + Vite (BUILD_SPEC: S0/M0/U0, local-first)
 * AI 방문결과 분석은 Anthropic API를 백엔드(이 Vite 미들웨어)에서 호출한다.
 * API Key는 backend .env(ANTHROPIC_API_KEY)에서만 읽고 프론트엔드 번들엔 절대 노출하지 않는다.
 * (loadEnv는 config에서만 읽으며, 클라이언트 import.meta.env에는 VITE_* 만 주입된다.) */

// 룰 기반 지식(bluescanKB.js의 RISK_DEFS·상품 가이드·결정 우선순위)을 그대로 옮긴 전문가 프롬프트
const SYSTEM_PROMPT = `[역할]
너는 에스원 '블루스캔'(원격 건물관리 솔루션) 영업기회 발굴 전문가다.
영업사원이 기록한 고객 인터뷰(음성 받아쓰기 또는 메모)를 읽고, 건물·시설 리스크와
그에 맞는 블루스캔 상품·장비를 도출한다. 입력에 근거가 없는 사실은 추측하지 않는다.

[분석 기준 — 리스크 라벨과 신호(반드시 아래 5개 라벨만 사용)]
1) "누수/침수": 침수·누수·물 넘침·물탱크·집수정·오뚜기·수위·배수·정화조·장마/역류, 지하 물, 기계실 침수
   → 추천 장비: 수위감지센서(오뚜기), 집수정감시줌카메라, 누수알림
2) "화재": 화재·수신기·주경종·이보기·소방·스프링클러·감지기·소방펌프·방재실
   → 추천 장비: 화재수신기 접점, 화재 이보기 연동, 소방펌프 연동
3) "정전": 정전·발전기·수배전·배전반·전기실·UPS·램프/부저·전력/한전
   → 추천 장비: 발전기 램프·부저 접점, 정전 감지(수배전 접점)
4) "기계/설비": 항온항습·전산실/서버실/데이터·보일러·냉동기/냉각/냉방·가스누출·온습도/결로/동파·기계실·설비 고장
   → 추천 장비: 온습도 센서, 설비 접점(보일러·냉동기), 가스누출 감지
5) "야간 관리 공백": 야간·무인·상주 부재·관리자/사람/인력 없음·인건비/최저임금/52시간·순찰·휴게/휴일/명절·전문인력 공백
   → 추천 장비: 없음(인력 대신 관제 전환으로 해결)

[상품 가이드]
- 블루스캔 듀얼(모니터링형): 에스원 관제센터가 24시간 이중 모니터링. 야간 무인·상주 부재 등
  취약시간 감시 공백이나 안전 리스크 상시 감시가 필요한 고객에 적합.
- 블루스캔 오너(자가관제형): 고객이 직접 운영. 관리 인력이 충분하거나 다수 건물 군(群)관리·
  운영 효율이 목적인 고객에 적합.
- 블루스캔 P(프리미엄): 공사·인프라 구축이 필요한 대형·특화시설(전산실/콜센터 등 중요실 대규모).

[상품 결정 우선순위]
1. '야간 관리 공백'이 확인되면 → "블루스캔 듀얼" (취약시간 24시간 이중 관제).
2. 직영/자체관리/군(群)관리/다수 건물 신호 + 안전 리스크 → "블루스캔 오너" (통합 자가관제·운영 효율).
3. 그 외 안전 리스크(누수/침수·화재·정전·기계설비)가 있으면 → "블루스캔 듀얼" (상시 감시).
4. 전산실 등 중요실 대규모 공사 수요가 뚜렷하면 → "블루스캔 P".
5. 뚜렷한 리스크 언급이 적으면 → 기본으로 "블루스캔 듀얼"을 제안.

[출력 규칙]
- detected_risks: 위 5개 라벨 중 인터뷰에 실제 근거가 있는 것만. 없으면 ["정보 없음"].
- keywords: 근거가 된 고객 발화의 핵심 표현(최대 8개).
- recommended_product: "블루스캔 듀얼" | "블루스캔 오너" | "블루스캔 P" 중 하나.
- reason: 어떤 리스크/신호 때문에 그 상품을 권하는지 2~3문장, 과장 없이 사실 기반으로.
- recommended_equipment: 탐지된 리스크별 추천 장비의 합집합(중복 제거). 해당 없으면 [].
지정된 JSON 스키마에 맞춰서만 답한다.`

// Structured Outputs 스키마 (응답 형식 강제 — bluescanKB 규칙 엔진과 동일한 필드)
const ANALYSIS_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    detected_risks: { type: 'array', items: { type: 'string' } },
    keywords: { type: 'array', items: { type: 'string' } },
    recommended_product: { type: 'string', enum: ['블루스캔 듀얼', '블루스캔 오너', '블루스캔 P'] },
    reason: { type: 'string' },
    recommended_equipment: { type: 'array', items: { type: 'string' } },
  },
  required: ['detected_risks', 'keywords', 'recommended_product', 'reason', 'recommended_equipment'],
}

function readBody(req) {
  return new Promise((resolve) => {
    let b = ''
    req.on('data', (c) => { b += c })
    req.on('end', () => { try { resolve(JSON.parse(b || '{}')) } catch { resolve({}) } })
    req.on('error', () => resolve({}))
  })
}

// 방문결과 음성/메모 → Anthropic(공식 SDK) 분석 프록시. 키는 .env에서만 읽는다.
function analyzeProxy(env) {
  const API_KEY = env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY || ''
  // 속도 우선: 기본은 가장 빠른 Haiku 4.5. 품질을 더 원하면 .env 의 ANTHROPIC_MODEL 로 변경(예: claude-opus-4-8)
  const MODEL = env.ANTHROPIC_MODEL || process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5'
  return async (req, res, next) => {
    if (!req.url || !req.url.startsWith('/api/analyze-visit')) return next()
    const send = (code, obj) => { res.statusCode = code; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(obj)) }
    if (req.method !== 'POST') return send(405, { ok: false, error: 'method' })
    const body = await readBody(req)
    const transcript = (body.transcript || body.text || '').toString().trim()
    if (!transcript) return send(400, { ok: false, error: 'empty' })
    if (!API_KEY) return send(503, { ok: false, error: 'no_api_key', message: '백엔드 .env에 ANTHROPIC_API_KEY가 없어요.' })

    let Anthropic
    try { Anthropic = (await import('@anthropic-ai/sdk')).default }
    catch { return send(503, { ok: false, error: 'sdk_missing', message: '@anthropic-ai/sdk 미설치 — `npm install @anthropic-ai/sdk` 후 사용하세요.' }) }

    try {
      const client = new Anthropic({ apiKey: API_KEY })
      // 속도 우선: thinking/effort 미사용(가벼운 추출 작업), Structured Outputs로 형식만 강제.
      // (effort 파라미터는 Haiku 4.5 에서 미지원 — 보내지 않음. 모델만 바꿔도 그대로 동작)
      const msg = await client.messages.create({
        model: MODEL,
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        output_config: { format: { type: 'json_schema', schema: ANALYSIS_SCHEMA } },
        messages: [{ role: 'user', content: `[고객 인터뷰 내용]\n${transcript}` }],
      })
      const text = (msg.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('').trim()
      let parsed
      try { parsed = JSON.parse(text) } catch { return send(200, { ok: false, error: 'parse_failed', raw: text.slice(0, 400) }) }
      return send(200, { ok: true, model: MODEL, data: parsed })
    } catch (e) {
      const status = (e && e.status) || 502
      return send(typeof status === 'number' ? status : 502, { ok: false, error: 'anthropic_error', message: String((e && e.message) || e).slice(0, 400) })
    }
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    root: '.',
    plugins: [
      react(),
      {
        name: 'anthropic-visit-proxy',
        configureServer(server) { server.middlewares.use(analyzeProxy(env)) },
        configurePreviewServer(server) { server.middlewares.use(analyzeProxy(env)) },
      },
    ],
    server: { port: 5173, host: true, open: true },
    build: { outDir: 'dist', sourcemap: true },
  }
})
