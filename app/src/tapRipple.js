/* ===== tapRipple.js — 시니어 친화 클릭 피드백 =====
 * 화면 어디든 클릭/터치하면 그 지점에 밝은 원형(리플)이 잠깐 퍼졌다 사라진다.
 * "방금 눌렀다"를 확실히 인지시키기 위한 전역 시각 피드백이다.
 * 입력창·드롭다운 등 타이핑/선택 요소에서는 방해되지 않도록 제외한다.
 * 스타일은 app.css의 .tap-ripple / @keyframes tapRipple 에 있다.
 */
export function initTapRipple() {
  if (typeof document === 'undefined' || window.__tapRippleOn) return;
  window.__tapRippleOn = true;

  // 리플을 띄우지 않을 요소들 — 입력/편집 중 방해 방지
  const EXCLUDE = 'input, textarea, select, [contenteditable="true"], [data-no-ripple]';

  const spawn = (x, y) => {
    const r = document.createElement('span');
    r.className = 'tap-ripple';
    r.style.left = x + 'px';
    r.style.top = y + 'px';
    document.body.appendChild(r);
    const done = () => { if (r.parentNode) r.parentNode.removeChild(r); };
    r.addEventListener('animationend', done);
    setTimeout(done, 900); // 애니메이션 미지원/중단 시 폴백 정리
  };

  document.addEventListener('pointerdown', (e) => {
    if (e.button != null && e.button > 0) return;        // 좌클릭·터치·펜만 (우클릭/보조버튼 제외)
    const t = e.target;
    if (t && t.closest && t.closest(EXCLUDE)) return;     // 입력 요소 위에서는 생략
    spawn(e.clientX, e.clientY);
  }, { capture: true, passive: true });
}
