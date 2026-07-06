/* ===== components.jsx — shared helpers, icons, atoms (S-1 DS) ===== */
import React from 'react'
const { useState, useEffect, useRef, useMemo, useCallback } = React

/* Material Symbols icon (matches DS icon substitution) */
export function MI({ n, s, fill, style, cls }) {
  return <span className={'material-symbols-rounded' + (fill ? ' msfill' : '') + (cls ? ' ' + cls : '')}
    style={{ fontSize: s ? s + 'px' : undefined, ...style }}>{n}</span>;
}

/* 에스원 CI 로고 — 공식 워드마크 이미지(s1.co.kr /images/ko/common/h1_logo.png) */
import s1logo from './assets/s1-logo.png'
export function BrandMark({ height = 28 }) {
  return <img src={s1logo} alt="에스원" style={{ display: 'block', height: height + 'px', width: 'auto' }} />;
}

// 블루스캔 타깃 브랜드 마크 (BLTA 붓글씨 로고) — 영문 단일 사용
import bltaEn from './assets/blta-en.png'
export function BltaMark({ height = 26, className = '', style }) {
  return <img src={bltaEn} alt="블루스캔 타깃" className={className}
    style={{ display: 'block', height: height + 'px', width: 'auto', ...style }} />;
}

/* ---------- helpers ---------- */
export const won = (n) => n == null ? '—' : (n >= 10000 ? (n / 10000).toLocaleString() + '만원' : n.toLocaleString() + '원');
export const num = (n) => n == null ? '—' : n.toLocaleString();

/* score tiers — PRD 등급 (S 91~100 / A 81~90 / B 71~80 / C 51~70 / D ≤50) */
export function tierOf(score) {
  if (score == null) return { key: 'nodata', label: 'NO_DATA', tone: 'neutral', color: 'var(--s1-gray-400)' };
  if (score >= 91) return { key: 'S', label: 'S · 최우선', tone: 'positive', color: 'var(--s1-seagreen-700)' };
  if (score >= 81) return { key: 'A', label: 'A · 유망', tone: 'positive', color: 'var(--s1-seagreen-600)' };
  if (score >= 71) return { key: 'B', label: 'B · 관계형성', tone: 'info', color: 'var(--s1-blue-500, #1d6ceb)' };
  if (score >= 51) return { key: 'C', label: 'C · 모니터링', tone: 'warning', color: 'var(--s1-yellow-800)' };
  return { key: 'D', label: 'D · 낮음', tone: 'neutral', color: 'var(--s1-gray-500)' };
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
