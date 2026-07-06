/* ===== dateUtil.js — 공통 날짜 유틸 =====
 * 하드코딩된 '오늘'을 실행 시점(new Date()) 기준으로 계산한다.
 * 데모/시연이 언제 열려도 '오늘'이 진짜 오늘이 되도록 하기 위한 것.
 */
const p = (x) => String(x).padStart(2, '0');

// 오늘 'YYYY-MM-DD' (로컬 기준)
export const todayYMD = () => {
  const n = new Date();
  return `${n.getFullYear()}-${p(n.getMonth() + 1)}-${p(n.getDate())}`;
};

// 오늘 'YYYYMMDD' (파일명 등)
export const todayCompact = () => {
  const n = new Date();
  return `${n.getFullYear()}${p(n.getMonth() + 1)}${p(n.getDate())}`;
};

// 오늘 'MM/DD'
export const todayMMDD = () => {
  const n = new Date();
  return `${p(n.getMonth() + 1)}/${p(n.getDate())}`;
};

// n일 전 'YYYY-MM-DD'
export const ymdDaysAgo = (days) => {
  const n = new Date();
  n.setDate(n.getDate() - days);
  return `${n.getFullYear()}-${p(n.getMonth() + 1)}-${p(n.getDate())}`;
};

// n일 전 'YYYY.MM.DD HH:MM'
export const dateTimeDaysAgo = (days, hh, mm) => {
  const n = new Date();
  n.setDate(n.getDate() - days);
  return `${n.getFullYear()}.${p(n.getMonth() + 1)}.${p(n.getDate())} ${p(hh)}:${p(mm)}`;
};

// 이번 달 1일부터 오늘까지의 영업일(주말 제외) 수 = "이달 N영업일차"
export const businessDayOfMonth = (base = new Date()) => {
  let c = 0;
  for (let day = 1; day <= base.getDate(); day++) {
    const wd = new Date(base.getFullYear(), base.getMonth(), day).getDay();
    if (wd !== 0 && wd !== 6) c++;
  }
  return c;
};

// 이번 달 전체 영업일(주말 제외) 수
export const businessDaysInMonth = (base = new Date()) => {
  const y = base.getFullYear(), m = base.getMonth();
  const last = new Date(y, m + 1, 0).getDate();
  let c = 0;
  for (let day = 1; day <= last; day++) {
    const wd = new Date(y, m, day).getDay();
    if (wd !== 0 && wd !== 6) c++;
  }
  return c;
};
