/* ===== upsellScore.js — 기존 고객(업셀링) 규칙 기반 스코어링 =====
 * 신규 후보(listA)와 동일한 방식으로 기존 고객도 0~100 점수 + 점수구성(comps)을 부여한다.
 * 원천 값은 이미 listB 데이터에 존재: 계약만료(expiryMonths)·월경비(monthlyFee)·유형(b1/b2)·인근화재(nearFire)·관제매칭(matchCount/matchWeight).
 * 가중치(각 항목 max)는 여기 숫자만 바꾸면 조정된다. NO_DATA 항목은 신규 방식과 동일하게 합계에서 제외한다.
 */
const wonShort = (n) => n == null ? '—' : (n >= 10000 ? Math.round(n / 10000).toLocaleString() + '만원' : n.toLocaleString() + '원');

export function scoreExisting(c) {
  const comps = [];

  // 1) 계약 만료 임박 (max 30) — 만료가 가까울수록 블루스캔 전환 제안 적기
  const em = c.expiryMonths;
  let v1;
  if (em == null) v1 = null;
  else if (em <= 2) v1 = 30;
  else if (em <= 4) v1 = 24;
  else if (em <= 6) v1 = 18;
  else if (em <= 12) v1 = 10;
  else v1 = 4;
  comps.push({ k: '계약 만료 임박', v: v1, max: 30,
    note: em == null ? '만료일 미상' : (c.expiryDate ? `만료 ${c.expiryDate} · ${em}개월 내` : `${em}개월 내 만료`) });

  // 2) 경비 규모(전환 효과) (max 25) — 월 경비가 클수록 전환 시 절감·제안 여지 큼
  const fee = c.monthlyFee;
  let v2;
  if (fee == null) v2 = null;
  else if (fee >= 3000000) v2 = 25;
  else if (fee >= 2000000) v2 = 21;
  else if (fee >= 1000000) v2 = 16;
  else if (fee >= 500000) v2 = 10;
  else v2 = 6;
  comps.push({ k: '경비 규모(전환효과)', v: v2, max: 25, note: fee == null ? '월 경비 미상' : `월 ${wonShort(fee)}` });

  // 3) 중요실 · 리스크 (max 25) — B-2 중요실 보유 + 인력경비 운영 + 인근 화재
  let v3 = 0; const n3 = [];
  if (c.b2) { v3 += 16; n3.push('중요실 보유'); }
  if (c.b1) { v3 += 5; n3.push('인력경비 운영'); }
  if (c.nearFire) { v3 += 4; n3.push('인근 화재'); }
  v3 = Math.min(25, v3);
  comps.push({ k: '중요실·리스크', v: v3, max: 25, note: n3.length ? n3.join(' · ') : '해당 없음' });

  // 4) 관제 매칭도 (max 20) — 관제 키워드 매칭(가중치)이 많을수록 니즈 뚜렷
  const mw = c.matchWeight || c.matchCount || 0;
  const v4 = Math.min(20, Math.round(mw * 4));
  comps.push({ k: '관제 매칭도', v: v4, max: 20, note: `매칭 키워드 ${c.matchCount || 0}종` });

  // 합계 — NO_DATA(v=null) 항목은 신규 방식과 동일하게 합산에서 제외
  const score = comps.reduce((s, cc) => s + (cc.v || 0), 0);
  return { score, comps };
}
