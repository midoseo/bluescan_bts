/* ===== components.jsx — shared helpers, icons, atoms (S-1 DS) ===== */
import React from 'react'
const { useState, useEffect, useRef, useMemo, useCallback } = React

/* Material Symbols icon (matches DS icon substitution) */
export function MI({ n, s, fill, style, cls }) {
  return <span className={'material-symbols-rounded' + (fill ? ' msfill' : '') + (cls ? ' ' + cls : '')}
    style={{ fontSize: s ? s + 'px' : undefined, ...style }}>{n}</span>;
}

/* 상세 모달 — 화면 고정(스크롤 무관) · 기본 상단 정렬 · 위/아래 토글 · 본문 내부 스크롤(노트북에서 안 잘림) */
export function DetailModal({ title, subtitle, badge, onClose, children }) {
  const [pos, setPos] = useState('top'); // top | bottom
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose && onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="dmodal__scrim" onClick={onClose}>
      <div className={'dmodal dmodal--' + pos} onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="dmodal__head">
          <div className="dmodal__titles">
            <div className="dmodal__title">{title}{badge}</div>
            {subtitle && <div className="dmodal__sub">{subtitle}</div>}
          </div>
          <button className="dmodal__pos" title={pos === 'top' ? '아래로 이동' : '위로 이동'} aria-label="모달 위치 이동"
            onClick={() => setPos(p => (p === 'top' ? 'bottom' : 'top'))}>
            <MI n={pos === 'top' ? 'keyboard_double_arrow_down' : 'keyboard_double_arrow_up'} s={22} />
          </button>
          <button className="dmodal__x" title="닫기" aria-label="닫기" onClick={onClose}><MI n="close" s={24} /></button>
        </div>
        <div className="dmodal__body">{children}</div>
      </div>
    </div>
  );
}

/* 에스원 CI — 공식 시그니처 마크 이미지(빨간 정사각형 + 흰색 '에스원') */
import s1ci from './assets/s1-ci.png'
export function BrandMark({ height = 28 }) {
  return <img src={s1ci} alt="에스원" style={{ display: 'block', height: height + 'px', width: 'auto', borderRadius: 4 }} />;
}

// 블루스캔 타깃 브랜드 마크 (BLTA 붓글씨 로고) — 영문 단일 사용
import bltaEn from './assets/blta-en.png'
export function BltaMark({ height = 26, className = '', style }) {
  return <img src={bltaEn} alt="블루스캔 타깃" className={className}
    style={{ display: 'block', height: height + 'px', width: 'auto', ...style }} />;
}

/* ---------- helpers ---------- */
export const won = (n) => n == null ? '—' : (n >= 10000 ? Math.round(n / 10000).toLocaleString() + '만원' : Math.round(n).toLocaleString() + '원');
export const num = (n) => n == null ? '—' : n.toLocaleString();

/* score tiers — PRD 등급 (S 91~100 / A 81~90 / B 71~80 / C 51~70 / D ≤50) */
export function tierOf(score) {
  if (score == null) return { key: 'nodata', label: 'NO_DATA', tone: 'neutral', color: 'var(--s1-gray-400)' };
  if (score >= 91) return { key: 'S', label: 'S · 최우선', tone: 'positive', color: 'var(--s1-seagreen-700)' };
  if (score >= 81) return { key: 'A', label: 'A · 유망', tone: 'positive', color: 'var(--s1-seagreen-600)' };
  if (score >= 71) return { key: 'B', label: 'B · 보통', tone: 'info', color: 'var(--s1-blue-500, #1d6ceb)' };
  if (score >= 51) return { key: 'C', label: 'C · 하위', tone: 'warning', color: 'var(--s1-yellow-800)' };
  return { key: 'D', label: 'D · 최하위', tone: 'neutral', color: 'var(--s1-gray-500)' };
}
export const VISIT = {
  done: { label: '방문완료', tone: 'positive', dot: 'var(--s1-seagreen-600)' },
  revisit: { label: '재방문필요', tone: 'warning', dot: 'var(--s1-yellow-800)' },
  reject: { label: '거절', tone: 'danger', dot: 'var(--s1-red-500)' },
  won: { label: '수주완료', tone: 'info', dot: 'var(--s1-blue-500, #1d6ceb)' },
};

/* ---------- atoms ---------- */
export function Gauge({ score, size = 44 }) {
  const t = tierOf(score);
  if (score == null) return (
    <div className="gauge" style={{ width: size, height: size }}>
      <svg viewBox="0 0 44 44" width={size} height={size}>
        <circle cx="22" cy="22" r="18" fill="none" stroke="var(--s1-gray-100)" strokeWidth="4.5" />
        <circle cx="22" cy="22" r="18" fill="none" stroke="var(--s1-gray-300)" strokeWidth="4.5" strokeDasharray="3 4" />
      </svg>
      <div className="g-num" style={{ fontSize: 10, color: 'var(--s1-gray-400)' }}>N/A</div>
    </div>
  );
  return (
    <div className="gauge" style={{ width: size, height: size }}>
      <svg viewBox="0 0 44 44" width={size} height={size}>
        <circle cx="22" cy="22" r="18" fill="none" stroke="var(--s1-gray-100)" strokeWidth="4.5" />
        <circle cx="22" cy="22" r="18" fill="none" stroke={t.color} strokeWidth="4.5"
          strokeLinecap="round" strokeDasharray={`${score / 100 * 113} 113`} transform="rotate(-90 22 22)" />
      </svg>
      <div className="g-num" style={{ color: t.color }}>{score}</div>
    </div>
  );
}
export function Meter({ value, max, color }) {
  return <div className="mini-meter"><i style={{ width: Math.round(value / max * 100) + '%', background: color || 'var(--accent)' }} /></div>;
}

// 페이지네이션 — 10단위 블록으로 표기. 처음(«)·이전10(‹‹)·번호 1~10·다음10(››)·끝(») + 현재/전체 표시.
// 건수가 많아도 버튼이 무한정 늘지 않아 깔끔하게 유지된다.
export function Pager({ page, totalPages, onChange, block = 10 }) {
  if (totalPages <= 1) return null;
  const cur = Math.min(Math.max(1, page), totalPages);
  const bStart = Math.floor((cur - 1) / block) * block + 1;
  const bEnd = Math.min(totalPages, bStart + block - 1);
  const go = (n) => onChange(Math.min(totalPages, Math.max(1, n)));
  const nums = [];
  for (let n = bStart; n <= bEnd; n++) nums.push(n);
  return (
    <div className="pager pager--windowed">
      <button className="pager__b pager__b--nav" disabled={cur === 1} onClick={() => go(1)} aria-label="처음으로"><MI n="first_page" s={20} /></button>
      <button className="pager__b pager__b--nav" disabled={bStart === 1} onClick={() => go(bStart - 1)} aria-label="이전 10페이지"><MI n="keyboard_double_arrow_left" s={20} /></button>
      {nums.map(n => (
        <button key={n} className={'pager__b' + (n === cur ? ' on' : '')} onClick={() => go(n)}>{n}</button>
      ))}
      <button className="pager__b pager__b--nav" disabled={bEnd === totalPages} onClick={() => go(bEnd + 1)} aria-label="다음 10페이지"><MI n="keyboard_double_arrow_right" s={20} /></button>
      <button className="pager__b pager__b--nav" disabled={cur === totalPages} onClick={() => go(totalPages)} aria-label="끝으로"><MI n="last_page" s={20} /></button>
      <span className="pager__info">{cur} / {totalPages}</span>
    </div>
  );
}
