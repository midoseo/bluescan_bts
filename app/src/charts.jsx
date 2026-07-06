/* ===== charts.jsx — 경량 SVG 차트 (S-1 sub/graphic 팔레트) ===== */
import React from 'react'

export const CH = { blue: '#1d6ceb', green: '#1fb279', orange: '#ff761a', purple: '#6666dd', yellow: '#ffc200', turq: '#25b9da', gray: '#c4c4c4' };
const CH_SERIES = [CH.blue, CH.green, CH.orange, CH.purple, CH.turq];

export function ChartLegend({ items }) {
  return (
    <div className="ch-legend">
      {items.map((it, i) => <span key={i} className="ch-leg"><span className="ch-leg__dot" style={{ background: it.color }} />{it.label}</span>)}
    </div>
  );
}

/* 그룹형 막대 (categories × series) */
export function GroupedBar({ categories, series, unit }) {
  const W = 620, H = 240, padL = 40, padB = 34, padT = 12, padR = 8;
  const plotW = W - padL - padR, plotH = H - padT - padB;
  const max = Math.max(...series.flatMap(s => s.data)) * 1.1 || 1;
  const ticks = 4;
  const groupW = plotW / categories.length, barGap = 4;
  const barW = (groupW - barGap * (series.length + 1)) / series.length;
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
        {[...Array(ticks + 1)].map((_, i) => { const y = padT + plotH - (plotH * i / ticks); const v = Math.round(max * i / ticks);
          return <g key={i}><line x1={padL} y1={y} x2={W - padR} y2={y} stroke="#e9e9e9" strokeWidth="1" />
            <text x={padL - 6} y={y + 3} textAnchor="end" fontSize="10" fill="#9d9d9d">{v}</text></g>; })}
        {categories.map((c, ci) => { const gx = padL + groupW * ci;
          return <g key={ci}>
            {series.map((s, si) => { const h = plotH * (s.data[ci] / max); const x = gx + barGap + si * (barW + barGap); const y = padT + plotH - h;
              return <rect key={si} x={x} y={y} width={barW} height={h} rx="2" fill={CH_SERIES[si % CH_SERIES.length]} />; })}
            <text x={gx + groupW / 2} y={H - padB + 16} textAnchor="middle" fontSize="11" fill="#555">{c}</text>
          </g>; })}
      </svg>
      <ChartLegend items={series.map((s, i) => ({ label: s.name, color: CH_SERIES[i % CH_SERIES.length] }))} />
    </div>
  );
}

/* 면적/라인 (categories × series) */
export function AreaChartC({ categories, series, unit }) {
  const W = 620, H = 240, padL = 46, padB = 30, padT = 12, padR = 10;
  const plotW = W - padL - padR, plotH = H - padT - padB;
  const max = Math.max(...series.flatMap(s => s.data)) * 1.12 || 1, min = Math.min(...series.flatMap(s => s.data)) * 0.85;
  const X = i => padL + plotW * i / (categories.length - 1);
  const Y = v => padT + plotH - plotH * ((v - min) / (max - min));
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
        {[...Array(5)].map((_, i) => { const y = padT + plotH * i / 4; const v = Math.round(max - (max - min) * i / 4);
          return <g key={i}><line x1={padL} y1={y} x2={W - padR} y2={y} stroke="#e9e9e9" /><text x={padL - 6} y={y + 3} textAnchor="end" fontSize="10" fill="#9d9d9d">{v.toLocaleString()}</text></g>; })}
        {series.map((s, si) => { const col = CH_SERIES[si % CH_SERIES.length];
          const pts = s.data.map((v, i) => `${X(i)},${Y(v)}`).join(' ');
          const area = `${padL},${padT + plotH} ${pts} ${X(categories.length - 1)},${padT + plotH}`;
          return <g key={si}>
            {si === 0 && <polygon points={area} fill={col} opacity="0.12" />}
            <polyline points={pts} fill="none" stroke={col} strokeWidth={si === 1 ? 2 : 2.5} strokeDasharray={si === 1 ? '5 4' : '0'} strokeLinejoin="round" />
            {s.data.map((v, i) => <circle key={i} cx={X(i)} cy={Y(v)} r="3" fill="#fff" stroke={col} strokeWidth="2" />)}
          </g>; })}
        {categories.map((c, i) => <text key={i} x={X(i)} y={H - padB + 18} textAnchor="middle" fontSize="11" fill="#555">{c}</text>)}
      </svg>
      <ChartLegend items={series.map((s, i) => ({ label: s.name, color: CH_SERIES[i % CH_SERIES.length] }))} />
    </div>
  );
}

/* 가로 누적 막대 */
export function HBarStacked({ categories, series }) {
  const totals = categories.map((_, ci) => series.reduce((s, se) => s + se.data[ci], 0));
  const max = Math.max(...totals) || 1;
  return (
    <div>
      <div className="hbar-wrap">
        {categories.map((c, ci) => (
          <div className="hbar-row" key={ci}>
            <span className="hbar-lab">{c}</span>
            <div className="hbar-track">
              {series.map((s, si) => { const w = s.data[ci] / max * 100;
                return <div key={si} className="hbar-seg" style={{ width: w + '%', background: CH_SERIES[si % CH_SERIES.length] }} title={`${s.name} ${s.data[ci]}`} />; })}
            </div>
            <span className="hbar-total tnum">{totals[ci]}</span>
          </div>))}
      </div>
      <ChartLegend items={series.map((s, i) => ({ label: s.name, color: CH_SERIES[i % CH_SERIES.length] }))} />
    </div>
  );
}

/* 도넛 */
export function Donut({ labels, values, size = 132, title }) {
  const total = values.reduce((a, b) => a + b, 0) || 1, R = size / 2, r = R * 0.62, C = 2 * Math.PI * r;
  let acc = 0;
  const palette = [CH.blue, CH.green, CH.orange, CH.purple, CH.turq, CH.yellow, '#9d9d9d'];
  return (
    <div className="donut">
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
        <circle cx={R} cy={R} r={r} fill="none" stroke="#f0f0f0" strokeWidth={R * 0.34} />
        {values.map((v, i) => { const frac = v / total; const dash = `${C * frac} ${C * (1 - frac)}`; const off = -C * acc; acc += frac;
          return <circle key={i} cx={R} cy={R} r={r} fill="none" stroke={palette[i % palette.length]} strokeWidth={R * 0.34}
            strokeDasharray={dash} strokeDashoffset={off} transform={`rotate(-90 ${R} ${R})`} />; })}
        <text x={R} y={R - 2} textAnchor="middle" fontSize={size * 0.2} fontWeight="700" fill="#202020">{total}</text>
        <text x={R} y={R + R * 0.22} textAnchor="middle" fontSize={size * 0.1} fill="#9d9d9d">건</text>
      </svg>
      {title && <div className="donut-title">{title}</div>}
    </div>
  );
}

/* 레이더 */
export function Radar({ categories, series, size = 240 }) {
  const cx = size / 2, cy = size / 2, R = size * 0.36;
  const max = Math.max(...series.flatMap(s => s.data)) || 1;
  const n = categories.length;
  const pt = (i, val) => { const a = -Math.PI / 2 + 2 * Math.PI * i / n; const rr = R * val / max; return [cx + rr * Math.cos(a), cy + rr * Math.sin(a)]; };
  const axisPt = (i, f = 1) => { const a = -Math.PI / 2 + 2 * Math.PI * i / n; return [cx + R * f * Math.cos(a), cy + R * f * Math.sin(a)]; };
  return (
    <div>
      <svg viewBox={`0 0 ${size} ${size}`} width="100%" style={{ maxWidth: size, display: 'block', margin: '0 auto' }}>
        {[0.25, 0.5, 0.75, 1].map((f, i) => <polygon key={i} points={categories.map((_, j) => axisPt(j, f).join(',')).join(' ')} fill="none" stroke="#e9e9e9" />)}
        {categories.map((_, i) => { const [x, y] = axisPt(i); return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#e9e9e9" />; })}
        {series.map((s, si) => { const col = CH_SERIES[si % CH_SERIES.length];
          return <polygon key={si} points={s.data.map((v, i) => pt(i, v).join(',')).join(' ')} fill={col} fillOpacity="0.16" stroke={col} strokeWidth="2" />; })}
        {categories.map((c, i) => { const [x, y] = axisPt(i, 1.16); return <text key={i} x={x} y={y + 3} textAnchor="middle" fontSize="9.5" fill="#757575">{c}</text>; })}
      </svg>
      <ChartLegend items={series.map((s, i) => ({ label: s.name, color: CH_SERIES[i % CH_SERIES.length] }))} />
    </div>
  );
}
