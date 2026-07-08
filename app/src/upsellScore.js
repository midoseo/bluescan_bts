/* ===== upsellScore.js — 기존 고객(업셀링) 규칙 기반 스코어링 =====
 * 신규 후보(listA)와 동일한 방식으로 기존 고객도 0~100 점수 + 점수구성(comps)을 부여한다.
 * 원천 값은 이미 listB 데이터에 존재: 계약만료(expiryMonths)·월경비(monthlyFee)·유형(b1/b2)·인근화재(nearFire)·관제매칭(matchCount/matchWeight)·건축물대장(buildingLedger 실연동).
 *
 * ── 스케일 보정(2026-07) ──
 * 서강 물건은 월경비가 전부 100만원 미만·관제매칭 대부분 1건이라, 절대 임계값을 쓰면 두 축이 눌려 점수가 40 근처로 깔렸다.
 * 그래서 각 축의 임계값을 "이 모집단 실제 분포"에 맞춰 상대화하고, 잘 변별되는 축(계약만료·중요실·건축물대장 우량도)에 가중치를 더 실었다.
 * 결과적으로 우량 후보(대형·노후·중요실·만료임박)는 신규(A)와 같은 70~90대, 약한 물건은 정직하게 낮게 나온다.
 * 축 최대 합 = 26 + 20 + 28 + 10 + 16 = 100. NO_DATA(v=null) 항목은 신규 방식과 동일하게 합계에서 제외한다.
 */
const wonShort = (n) => n == null ? '—' : (n >= 10000 ? Math.round(n / 10000).toLocaleString() + '만원' : n.toLocaleString() + '원');

export function scoreExisting(c) {
  const comps = [];

  // 1) 계약 만료 임박 (max 26) — 만료가 가까울수록 블루스캔 전환 제안 적기 (분포: 3~36개월, 중앙값 ~22)
  const em = c.expiryMonths;
  let v1;
  if (em == null) v1 = null;
  else if (em <= 6) v1 = 26;
  else if (em <= 12) v1 = 20;
  else if (em <= 18) v1 = 15;
  else if (em <= 24) v1 = 11;
  else if (em <= 30) v1 = 7;
  else v1 = 4;
  comps.push({ k: '계약 만료 임박', v: v1, max: 26,
    note: em == null ? '만료일 미상' : (c.expiryDate ? `만료 ${c.expiryDate} · ${em}개월 내` : `${em}개월 내 만료`) });

  // 2) 경비 규모(전환효과) (max 20) — 월 경비가 클수록 전환 시 절감·제안 여지 큼 (분포에 맞춘 상대 임계값)
  const fee = c.monthlyFee;
  let v2;
  if (fee == null) v2 = null;
  else if (fee >= 500000) v2 = 20;
  else if (fee >= 300000) v2 = 16;
  else if (fee >= 150000) v2 = 12;
  else if (fee >= 80000) v2 = 9;
  else v2 = 6;
  comps.push({ k: '경비 규모(전환효과)', v: v2, max: 20, note: fee == null ? '월 경비 미상' : `월 ${wonShort(fee)}` });

  // 3) 중요실 · 리스크 (max 28) — B-2 중요실 보유 + 인력경비 운영 + 인근 화재
  let v3 = 0; const n3 = [];
  if (c.b2) { v3 += 18; n3.push('중요실 보유'); }
  if (c.b1) { v3 += 8; n3.push('인력경비 운영'); }
  if (c.nearFire) { v3 += 4; n3.push('인근 화재'); }
  v3 = Math.min(28, v3);
  comps.push({ k: '중요실·리스크', v: v3, max: 28, note: n3.length ? n3.join(' · ') : '해당 없음' });

  // 4) 관제 매칭도 (max 10) — 관제 키워드 매칭(가중치)이 많을수록 니즈 뚜렷
  const mw = c.matchWeight || c.matchCount || 0;
  const v4 = Math.min(10, Math.round(mw * 3));
  comps.push({ k: '관제 매칭도', v: v4, max: 10, note: `매칭 키워드 ${c.matchCount || 0}종` });

  // 5) 건축물대장 우량도 (max 16) — 실연동(build-buildingledger 배치)으로 붙은 buildingLedger 기반
  const bl = c.buildingLedger;
  if (bl && bl.matched) {
    let v5 = 0; const n5 = [];
    const g = bl.gfa || 0, ya = bl.approvalYrAgo || 0, ug = bl.ugrndFlr || 0;
    if (g >= 10000) { v5 += 7; n5.push('연면적 1만㎡↑'); }
    else if (g >= 3000) { v5 += 5; n5.push('연면적 3천㎡↑'); }
    else if (g >= 1000) { v5 += 3; n5.push('연면적 1천㎡↑'); }
    if (ya >= 30) { v5 += 6; n5.push('30년 이상 노후'); }
    else if (ya >= 20) { v5 += 4; n5.push('20년 이상 노후'); }
    else if (ya >= 10) { v5 += 2; n5.push('10년 이상 경과'); }
    if (ug >= 2) { v5 += 3; n5.push('지하 2층↑(침수·설비 리스크)'); }
    else if (ug >= 1) { v5 += 2; n5.push('지하층 보유'); }
    v5 = Math.min(16, v5);
    comps.push({ k: '건축물대장 우량도', v: v5, max: 16, note: n5.join(' · ') || '해당 없음' });
  } else if (bl && bl.matched === false) {
    comps.push({ k: '건축물대장 우량도', v: null, max: 16, note: '대장 미매칭 (NO_DATA)' });
  }

  // 합계 — NO_DATA(v=null) 항목은 신규 방식과 동일하게 합산에서 제외. 총점 100 상한.
  const score = Math.min(100, comps.reduce((s, cc) => s + (cc.v || 0), 0));
  return { score, comps };
}
