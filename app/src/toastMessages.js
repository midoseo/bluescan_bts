/* ===== toastMessages.js — 포인트/배지/퀘스트 팝업 안내 문구 =====
 * 딱딱한 시스템 알림투가 아니라 동료가 옆에서 응원해주는 듯한 톤으로 쓴다.
 * gamification.js의 breakdown label 접두어로 상황을 구분해 아이콘·문구를 고른다.
 */

const POOLS = [
  { match: (l) => l.startsWith('방문 결과(수주완료)'), icon: 'celebration', tone: 'gold',
    say: ['축하드려요! 계약 성사, 정말 잘하셨어요 🎉', '오늘의 하이라이트예요! 멋진 계약 하나 만드셨네요'] },
  { match: (l) => l.startsWith('방문 결과'), icon: 'edit_note', tone: 'blue',
    say: ['수고하셨어요! 방문 기록 잘 남겨주셨네요', '기록 하나하나가 쌓여서 큰 자산이 돼요, 감사해요'] },
  { match: (l) => l.startsWith('타이밍 신호'), icon: 'bolt', tone: 'orange',
    say: ['타이밍 좋았어요! 신호에 빠르게 대응하셨네요 ⚡', '이런 순발력 최고예요, 놓치지 않으셨네요'] },
  { match: (l) => l.startsWith('월간 리포트'), icon: 'mail', tone: 'blue',
    say: ['고객님께 다정한 소식 하나 전해드렸네요 💌', '리포트 발송 완료! 꼼꼼히 챙기고 계시네요'] },
  { match: (l) => l.startsWith('감성터칭'), icon: 'favorite', tone: 'pink',
    say: ['따뜻한 안부 인사, 잘 전해졌을 거예요 🌷', '이런 세심함이 고객님 마음을 움직여요'] },
  { match: (l) => l.startsWith('주의고객 대응'), icon: 'volunteer_activism', tone: 'pink',
    say: ['중요한 순간을 놓치지 않으셨어요, 든든해요'] },
];
const DEFAULT_POOL = { icon: 'stars', tone: 'gold', say: ['잘하고 계세요! 오늘도 한 걸음 나아갔어요'] };

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

export function pointToast(label, pts) {
  const pool = POOLS.find(p => p.match(label)) || DEFAULT_POOL;
  return { icon: pool.icon, tone: pool.tone, title: pick(pool.say), sub: `+${pts}P 적립됐어요` };
}

export function badgeToast(badge) {
  return { icon: badge.icon, tone: 'gold', title: `새 배지를 얻었어요! "${badge.label}"`, sub: '축하드려요, 계속 이렇게 해주세요 🏅' };
}

export function questToast(quest) {
  return { icon: 'flag_circle', tone: 'blue', title: `퀘스트 완료! "${quest.label}"`, sub: '오늘도 목표 하나 달성하셨네요 👏' };
}
