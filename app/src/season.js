/* ===== season.js — 시즌별 특화 타깃 (엑셀 고도화 항목 · 담당 서지나) =====
 * 1차 적용 범위: 혹서기·풍수해기(6~9월) 침수 위험 신호.
 * 이후 동절기(냉동창고·전산실 등 저온/설비 타깃), 평시 테마는 같은 구조로 확장 가능.
 */

export const SEASON_DEF = {
  flood: { key: 'flood', label: '혹서기·풍수해기 (6~9월)', months: [6, 7, 8, 9], icon: 'rainy', theme: '도시침수 예상구역 연계 · 방재·관리 수요 제안 적기' },
  winter: { key: 'winter', label: '동절기 (12~2월)', months: [12, 1, 2], icon: 'ac_unit', theme: '전산실·냉동창고 등 저온설비 타깃 (후속 예정)' },
  normal: { key: 'normal', label: '평시 (3~5, 10~11월)', months: [3, 4, 5, 10, 11], icon: 'wb_sunny', theme: '시즌 신호 없음' },
};
export const SEASON_ORDER = ['flood', 'winter', 'normal'];

export function currentSeasonKey(d = new Date()) {
  const m = d.getMonth() + 1;
  for (const key of SEASON_ORDER) { if (SEASON_DEF[key].months.includes(m)) return key; }
  return 'normal';
}
