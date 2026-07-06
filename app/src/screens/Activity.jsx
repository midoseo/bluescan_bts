/* ===== Activity.jsx — 미션 & 랭킹 페이지 =====
   게이미피케이션 모음: 활동 점수 + 이번 주 미션(퀘스트) + 지사 랭킹 + 배지.
   데이터는 gamification.js의 함수를 그대로 재사용한다.
*/
import React from 'react'
import { MI } from '../components.jsx'
import { questProgress, badgeStatus, buildLeaderboard } from '../gamification.js'

export function ActivityScreen({ gamify, visits, listA, listB, retention, reportSentOverrides, touchOverrides, myEmpno, myBranch }) {
  const ctx = { visits: visits || {}, listA, listB, retention, reportSentOverrides, touchOverrides }
  const myPoints = gamify ? gamify.total : 0
  const quests = questProgress(ctx)
  const badges = badgeStatus(ctx)
  const roster = (window.APP_ACCOUNTS || []).filter(a => a.role === 'consultant' && a.branch === myBranch)
  const leaderboard = buildLeaderboard(roster, myEmpno, myPoints).slice(0, 8)
  const myRank = leaderboard.findIndex(r => r.isMe) + 1
  const questDone = quests.filter(q => q.done).length
  const badgeGot = badges.filter(b => b.unlocked).length

  return (
    <div className="pc-content pc-content--wide fadein">
      <div className="pc-pagehead"><div>
        <h1 className="pc-pagehead__title">미션 &amp; 랭킹</h1>
        <p className="pc-pagehead__desc">오늘의 활동 점수와 미션 달성, 지사 안에서의 랭킹을 한눈에 확인해요.</p>
      </div></div>

      <div className="act-hero">
        <div className="act-hero__pts"><MI n="stars" s={30} fill /><span className="tnum">{myPoints}P</span></div>
        <div className="act-hero__meta">
          <div><b>{myRank > 0 ? `${myRank}위` : '-'}</b><span>지사 랭킹</span></div>
          <div><b className="tnum">{questDone}/{quests.length}</b><span>미션 달성</span></div>
          <div><b className="tnum">{badgeGot}/{badges.length}</b><span>획득 배지</span></div>
        </div>
      </div>

      <div className="act-grid">
        <div className="act-card">
          <div className="act-card__title"><MI n="task_alt" s={22} />이번 주 미션</div>
          <div className="act-quests">
            {quests.map(q => (
              <div className={'act-quest' + (q.done ? ' done' : '')} key={q.id}>
                <span className="act-quest__ico"><MI n={q.done ? 'check_circle' : q.icon} s={24} fill={q.done} /></span>
                <div className="act-quest__body">
                  <div className="act-quest__lab">{q.label}</div>
                  <div className="act-quest__bar"><i style={{ width: `${Math.round(q.current / q.target * 100)}%` }} /></div>
                </div>
                <span className="act-quest__n tnum">{q.current}/{q.target}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="act-card">
          <div className="act-card__title"><MI n="leaderboard" s={22} />지사 랭킹</div>
          <div className="act-rank">
            {leaderboard.map((r, i) => (
              <div className={'act-rankrow' + (r.isMe ? ' me' : '')} key={r.empno}>
                <span className={'act-rankn' + (i < 3 ? ' top' : '')}>{i + 1}</span>
                <span className="act-rankname">{r.isMe ? `${r.name} (나)` : r.name}</span>
                <span className="act-rankpts tnum">{r.points}P</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="act-card" style={{ marginTop: 16 }}>
        <div className="act-card__title"><MI n="workspace_premium" s={22} />배지</div>
        <div className="act-badges">
          {badges.map(b => (
            <div className={'act-badge' + (b.unlocked ? ' on' : '')} key={b.id}>
              <MI n={b.icon} s={28} fill={b.unlocked} />
              <span>{b.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
