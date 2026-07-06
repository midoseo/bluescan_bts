/* ===== bluescanKB.js — 블루스캔 영업기회 발굴 에이전트 지식베이스 + 규칙 분석기 =====
 * 교육자료(블루스캔 오너/듀얼/P, 리플릿, "이것만 알아도 블루스캔 전문가")를 학습해 정리한 RAG 데이터.
 * window.claude(LLM)가 있으면 LLM 분석, 없으면 이 규칙 엔진이 동일 JSON 스키마로 분석한다.
 */

// 시스템 프롬프트 (LLM 사용 시) — 사용자가 지정한 역할/기준/출력 규칙
export const SYSTEM_PROMPT = `[역할]
너는 에스원 블루스캔 영업 기회 발굴 에이전트야. 영업사원이 입력한 고객 인터뷰 내용을 분석하여 영업 기회와 추천 상품을 도출해야 해.

[분석 기준 (RAG 참조 데이터)]
1. 화재 리스크: 수신기 주경종, 화재 이보기, 소방펌프 연동 관련 언급
2. 정전 리스크: 정전 인지, 발전기 램프/부저 접점, 화재이보기 연동 관련 언급
3. 누수 리스크: 기계실 침수, 집수정, 물탱크 수위, 오뚜기 수위센서, 누수알림 관련 언급
4. 운영 리스크: 인건비 상승, 야간 상주 관리자 부재, 시설 전문가 공백 언급

[상품 가이드]
- 블루스캔 듀얼(모니터링형): 에스원 관제센터의 24시간 이중 모니터링. 야간 무인·상주 부재·취약시간 감시공백이 있는 고객에 적합.
- 블루스캔 오너(자가관제형): 고객이 직접 운영. 관리 인력이 충분하거나 다수 건물 군(群)관리 효율이 목적인 고객에 적합.
- 블루스캔 P(프리미엄): 공사·인프라 구축이 필요한 대형·특화시설(전산실/콜센터 등).

[출력 규칙]
반드시 아래 JSON 포맷으로만 답변하고, 다른 부연 설명은 절대 하지 마십시오.
{
  "detected_risks": ["누수/침수", "야간 관리 공백"],
  "keywords": ["기계실 침수 걱정", "야간에 사람 없음"],
  "recommended_product": "블루스캔 듀얼",
  "reason": "...",
  "recommended_equipment": ["수위감지센서(오뚜기)", "집수정감시줌카메라", "누수알림"]
}`

// 리스크 정의 — 라벨, 탐지 패턴, 추천 장비
export const RISK_DEFS = [
  {
    id: 'flood', label: '누수/침수',
    patterns: [/침수/, /누수/, /물\s?넘/, /물탱크/, /집수정/, /오뚜기/, /수위/, /배수/, /정화조/, /빗물|장마|역류/, /지하.{0,4}(물|침수)/, /기계실.{0,6}(침수|물)/],
    equipment: ['수위감지센서(오뚜기)', '집수정감시줌카메라', '누수알림'],
  },
  {
    id: 'fire', label: '화재',
    patterns: [/화재/, /수신기/, /주경종/, /이보기/, /소방/, /스프링클러/, /감지기/, /소방펌프/, /방재실/],
    equipment: ['화재수신기 접점', '화재 이보기 연동', '소방펌프 연동'],
  },
  {
    id: 'power', label: '정전',
    patterns: [/정전/, /발전기/, /수배전/, /배전반/, /전기실/, /UPS/i, /램프|부저/, /전력|한전/],
    equipment: ['발전기 램프·부저 접점', '정전 감지(수배전 접점)'],
  },
  {
    id: 'facility', label: '기계/설비',
    patterns: [/항온항습/, /전산실|서버실|데이터/, /보일러/, /냉동기|냉각|냉방/, /가스\s?누(출|설)/, /온도|습도|결로|동파/, /기계실/, /설비\s?(고장|이상)/],
    equipment: ['온습도 센서', '설비 접점(보일러·냉동기)', '가스누출 감지'],
  },
  {
    id: 'ops', label: '야간 관리 공백',
    patterns: [/야간/, /무인/, /상주.{0,6}(없|부재|공백|어렵)/, /(관리자|사람|인력).{0,6}없/, /인건비|최저임금|52시간/, /순찰/, /휴게|휴일|명절|휴가/, /전문\s?(인력|가).{0,6}(없|부재|공백)/, /비전문/],
    equipment: [],
  },
]

// 군(群)관리/자가운영 신호 (오너형 적합) — 단, 야간 무인이면 듀얼 우선
const SELF_MANAGE = [/직영/, /자체\s?관리/, /직접\s?관리/, /군관리|群관리/, /다수\s?건물|여러\s?건물|다\s?보유|다보유|건물.{0,3}많/, /FM/i, /관리\s?인력.{0,6}(충분|있)/]

const firstMatch = (text, patterns) => { for (const p of patterns) { const m = text.match(p); if (m) return m[0]; } return null }

/* 규칙 기반 분석 — 교육자료 RAG 기준. (LLM 미사용 시 동일 스키마 출력) */
export function analyzeBluescan(rawText) {
  const text = (rawText || '').toString()
  const detected_risks = [], keywords = []
  for (const r of RISK_DEFS) {
    let hit = false
    for (const p of r.patterns) { const m = text.match(p); if (m) { hit = true; if (keywords.length < 8 && !keywords.includes(m[0])) keywords.push(m[0]); } }
    if (hit) detected_risks.push(r.label)
  }
  const has = (id) => detected_risks.includes(RISK_DEFS.find(r => r.id === id).label)
  const nightGap = has('ops')
  const selfManage = SELF_MANAGE.some(p => p.test(text))
  const safetyRisk = has('flood') || has('fire') || has('power') || has('facility')

  // 추천 상품
  let recommended_product, prodReason
  if (nightGap) { recommended_product = '블루스캔 듀얼'; prodReason = '야간 무인·상주 인력 공백 등 취약시간 감시 공백이 있어, 에스원 관제센터가 24시간 이중 모니터링하는 듀얼이 적합' }
  else if (selfManage && safetyRisk) { recommended_product = '블루스캔 오너'; prodReason = '관리 인력을 갖추고 다수 건물을 직접 군(群)관리하는 형태로, 자가관제형 오너로 통합 모니터링·운영 효율화가 적합' }
  else if (safetyRisk) { recommended_product = '블루스캔 듀얼'; prodReason = '설비 이상 리스크가 확인되고 상시 감시 체계가 필요해, 관제센터 이중 모니터링의 듀얼이 적합' }
  else if (selfManage) { recommended_product = '블루스캔 오너'; prodReason = '다수 건물 군관리·운영 효율이 주목적으로 자가관제형 오너가 적합' }
  else { recommended_product = '블루스캔 듀얼'; prodReason = '구체 리스크는 적게 언급됐으나, 안전관리 수요 대비 관제센터 이중 모니터링의 듀얼을 기본 제안' }

  // 추천 장비 (탐지 리스크별 장비 합집합)
  const eqSet = []
  for (const r of RISK_DEFS) if (detected_risks.includes(r.label)) for (const e of r.equipment) if (!eqSet.includes(e)) eqSet.push(e)

  // 사유 문장
  const riskTxt = detected_risks.length ? detected_risks.join(', ') + ' 리스크가 확인됨' : '뚜렷한 리스크 언급은 적음'
  const reason = `고객 인터뷰에서 ${riskTxt}. ${prodReason}.`

  return {
    detected_risks: detected_risks.length ? detected_risks : ['정보 없음'],
    keywords: keywords.length ? keywords : ['정보 없음'],
    recommended_product,
    reason,
    recommended_equipment: eqSet,
  }
}
