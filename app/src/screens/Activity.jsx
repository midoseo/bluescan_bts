/* ===== Activity.jsx — 미션 & 랭킹 페이지 =====
   컴팩트 구성(시니어 폰트 준수): ① 오늘의 미션 ② 이달 미션 목표(활동) ③ 누적 목표 배지
   ④ 실적 랭킹(월/분기/반기 · 지사/사업팀/전체 · 상위 10 + 내 순위).
   데이터·로직은 gamification.js의 함수를 재사용한다.
*/
import React, { useState } from 'react'
import { MI } from '../components.jsx'
import { todayMissions, monthMissions, badgeStatus, buildPerfRanking, buildBroadcast } from '../gamification.js'

const NEWS_SCOPE = { branch: { label: '우리지사', cls: 'branch' }, team: { label: '사업팀', cls: 'team' }, all: { label: '전국', cls: 'all' } }

const SCOPES = [
  { key: 'branch', label: '우리 지사' },
  { key: 'team', label: '사업팀' },
  { key: 'all', label: '전체' },
]
const PERIODS = [
  { key: 'month', label: '월간' },
  { key: 'quarter', label: '분기' },
  { key: 'half', label: '반기' },
]
function fmtWon(n) {
  if (n >= 100000000) return (Math.round((n / 100000000) * 10) / 10) + '억'
  return Math.round(n / 10000).toLocaleString() + '만'
}

export function ActivityScreen({ gamify, visits, listA, listB, retention, reportSentOverrides, touchOverrides, myEmpno, myBranch }) {
  const ctx = { visits: visits || {}, listA, listB, retention, reportSentOverrides, touchOverrides }
  const myPoints = gamify ? gamify.total : 0

  const [scope, setScope] = useState('branch')
  const [period, setPeriod] = useState('month')

  const today = todayMissions(ctx)
  const todayDone = today.filter(m => m.done).length
  const todayPts = today.filter(m => m.done).reduce((s, m) => s + m.pts, 0)
  const month = monthMissions(ctx)
  const monthDone = month.filter(m => m.done).length
  const badges = badgeStatus(ctx)
  const badgeGot = badges.filter(b => b.unlocked).length

  const accounts = (typeof window !== 'undefined' && window.APP_ACCOUNTS) || []
  const rank = buildPerfRanking({ accounts, myEmpno, myBranch, period, scope })
  const meInTop = rank.me && rank.top.some(r => r.isMe)
  const news = buildBroadcast({ accounts, myBranch })

  return (
    <div className="pc-content pc-content--wide fadein">
      <div className="pc-pagehead"><div>
        <h1 className="pc-pagehead__title">미션 &amp; 랭킹</h1>
        <p className="pc-pagehead__desc">오늘 해야 할 미션과 이달 목표를 채우고, 실적 랭킹에서 내 위치를 확인해요.</p>
      </div></div>

      {/* 실시간 소식 — GM 방송 티커 */}
      {news.length > 0 && (
        <div className="bcast">
          <div className="bcast__gm"><MI n="campaign" s={20} fill />실시간 소식</div>
          <div className="bcast__view">
            <div className="bcast__track">
              {news.concat(news).map((it, i) => (
                <span className={'bnews bnews--' + it.tone} key={i}>
                  <span className={'bnews__scope scope--' + NEWS_SCOPE[it.scope].cls}>{NEWS_SCOPE[it.scope].label}</span>
                  <MI n={it.icon} s={16} />{it.text}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="act-hero">
        <div className="act-hero__pts"><MI n="stars" s={30} fill /><span className="tnum">{myPoints}P</span></div>
        <div className="act-hero__meta">
          <div><b className="tnum">+{todayPts}P</b><span>오늘 획득</span></div>
          <div><b className="tnum">{todayDone}/{today.length}</b><span>오늘 미션</span></div>
          <div><b className="tnum">{monthDone}/{month.length}</b><span>이달 목표</span></div>
          <div><b className="tnum">{rank.me ? `${rank.me.rank}위` : '-'}</b><span>내 실적 순위</span></div>
          <div><b className="tnum">{badgeGot}/{badges.length}</b><span>배지</span></div>
        </div>
      </div>

      <div className="act-grid">
        {/* 오늘의 미션 */}
        <div className="act-card">
          <div className="act-card__title"><MI n="today" s={22} />오늘의 미션</div>
          <div className="mlist">
            {today.map(m => (
              <div className={'mrow' + (m.done ? ' done' : '')} key={m.id}>
                <span className="mrow__ico"><MI n={m.done ? 'check_circle' : m.icon} s={22} fill={m.done} /></span>
                <span className="mrow__lab">{m.label}</span>
                <span className="mrow__pts">+{m.pts}P</span>
              </div>
            ))}
          </div>
        </div>

        {/* 이달 미션 목표 */}
        <div className="act-card">
          <div className="act-card__title"><MI n="calendar_month" s={22} />이달 미션 목표 <span className="faint" style={{ fontWeight: 400, fontSize: 13 }}>· 활동 위주</span></div>
          <div className="mlist">
            {month.map(m => (
              <div className={'mgoal' + (m.done ? ' done' : '')} key={m.id}>
                <span className="mgoal__ico"><MI n={m.done ? 'check_circle' : m.icon} s={20} fill={m.done} /></span>
                <div className="mgoal__body">
                  <div className="mgoal__lab">{m.label}</div>
                  <div className="mgoal__bar"><i style={{ width: `${Math.round(m.current / m.target * 100)}%` }} /></div>
                </div>
                <span className="mgoal__n tnum">{m.current}/{m.target}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 누적 목표 배지 */}
      <div className="act-card" style={{ marginTop: 14 }}>
        <div className="act-card__title"><MI n="workspace_premium" s={22} />누적 목표 배지 <span className="faint" style={{ fontWeight: 400, fontSize: 13 }}>· 일·월 누적 달성 시 획득</span></div>
        <div className="act-badges">
          {badges.map(b => (
            <div className={'act-badge' + (b.unlocked ? ' on' : '')} key={b.id}>
              <MI n={b.icon} s={26} fill={b.unlocked} />
              <span>{b.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 실적 랭킹 */}
      <div className="act-card" style={{ marginTop: 14 }}>
        <div className="act-card__head">
          <div className="act-card__title"><MI n="leaderboard" s={22} />실적 랭킹 <span className="faint" style={{ fontWeight: 400, fontSize: 13 }}>· 누적 실적(금액)</span></div>
          <div className="seg seg--sm">
            {PERIODS.map(p => (
              <button key={p.key} className={period === p.key ? 'on' : ''} onClick={() => setPeriod(p.key)}>{p.label}</button>
            ))}
          </div>
        </div>
        <div className="rank-periods">
          {SCOPES.map(s => (
            <button key={s.key} className={'rank-chip' + (scope === s.key ? ' on' : '')} onClick={() => setScope(s.key)}>{s.label}</button>
          ))}
          <span className="faint" style={{ fontSize: 13, marginLeft: 'auto', alignSelf: 'center' }}>대상 {rank.total.toLocaleString()}명</span>
        </div>

        <div className="rtable">
          <div className="rtable__head">
            <span className="rt-rank">순위</span><span className="rt-name">이름</span><span className="rt-br">소속지사</span><span className="rt-team">사업팀</span><span className="rt-amt">실적</span>
          </div>
          {rank.top.map(r => (
            <div className={'rtable__row' + (r.isMe ? ' me' : '')} key={r.empno}>
              <span className={'rt-rank' + (r.rank <= 3 ? ' top' : '')}>{r.rank}</span>
              <span className="rt-name">{r.isMe ? `${r.name} (나)` : r.name}</span>
              <span className="rt-br">{r.branch}</span>
              <span className="rt-team">{r.team}</span>
              <span className="rt-amt tnum">{fmtWon(r.amount)}</span>
            </div>
          ))}
          {rank.me && !meInTop && (
            <>
              <div className="rtable__gap">⋯</div>
              <div className="rtable__row me">
                <span className="rt-rank">{rank.me.rank}</span>
                <span className="rt-name">{rank.me.name} (나)</span>
                <span className="rt-br">{rank.me.branch}</span>
                <span className="rt-team">{rank.me.team}</span>
                <span className="rt-amt tnum">{fmtWon(rank.me.amount)}</span>
              </div>
            </>
          )}
        </div>
        <div className="insight-note" style={{ marginTop: 10 }}>
          <MI n="info" s={16} />실적 금액은 데모용 예시값이며, 실서비스 시 기간별 수주·계약 집계로 대체됩니다. 상위 10명과 내 순위를 함께 표시해요.
        </div>
      </div>
    </div>
  )
}
