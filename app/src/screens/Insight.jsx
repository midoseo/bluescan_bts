/* ===== Insight.jsx — 인사이트 페이지 =====
   화재 현황(외부 스케줄링 대시보드 iframe) + 블루스캔 관련 뉴스.
*/
import React from 'react'
import { MI } from '../components.jsx'
import { TargetMap } from '../map.jsx'
import { FIRE_OVERLAY } from '../fireOverlay.js'

const FIRE_DASHBOARD_URL = 'https://loquacious-semifreddo-e21627.netlify.app/'

export function InsightScreen() {
  const D = (typeof window !== 'undefined' && window.APPDATA) || {}
  const newsAll = (D.firePoints || []).filter(f => f.title).slice().sort((a, b) => a.days - b.days).slice(0, 12)
  const dayLabel = (d) => d <= 0 ? '오늘' : d === 1 ? '어제' : d + '일 전'

  return (
    <div className="pc-content pc-content--wide fadein">
      <div className="pc-pagehead"><div>
        <h1 className="pc-pagehead__title">인사이트</h1>
        <p className="pc-pagehead__desc">전국 화재 현황과 블루스캔 관련 뉴스를 한곳에서 봐요. 화재 현황은 매일 자동으로 갱신됩니다.</p>
      </div></div>

      {/* 전국 화재 글로우 지도 — 실데이터(국민안전24) 포인트 */}
      <div className="insight-card" style={{ marginBottom: 16 }}>
        <div className="insight-card__head">
          <span className="insight-card__title"><MI n="local_fire_department" s={22} />오늘의 전국 화재<span className="insight-live">{FIRE_OVERLAY.updated} · {FIRE_OVERLAY.points.length}건</span></span>
        </div>
        <div style={{ position: 'relative', height: 460, borderRadius: 12, overflow: 'hidden', border: '1px solid #eaecf0' }}>
          <TargetMap candidates={[]} firePointsLive={FIRE_OVERLAY.points} showFire showFlood={false} variant="fire" fitKey={`fire-${FIRE_OVERLAY.points.length}`} />
        </div>
        <div className="insight-note"><MI n="info" s={16} />국민안전24 실시간 화재정보(WGS84 좌표) 기반 · 최근일수록 진하게 표시. 아래는 뉴스·시도별 통계가 포함된 원본 대시보드입니다.</div>
      </div>

      {/* 화재 현황 — 외부 스케줄링 대시보드 임베드 */}
      <div className="insight-card">
        <div className="insight-card__head">
          <span className="insight-card__title"><MI n="local_fire_department" s={22} />전국 화재 현황<span className="insight-live">자동 갱신</span></span>
          <a className="insight-open" href={FIRE_DASHBOARD_URL} target="_blank" rel="noopener noreferrer"><MI n="open_in_new" s={18} />새 탭에서 크게 보기</a>
        </div>
        <iframe className="insight-frame" src={FIRE_DASHBOARD_URL} title="전국 화재정보 대시보드" loading="lazy" />
        <div className="insight-note"><MI n="info" s={16} />국가화재정보시스템(NFDS) 기반으로 매일 자동 갱신되는 화재 대시보드를 그대로 불러옵니다. 지도·데이터 로드에는 인터넷 연결이 필요해요.</div>
      </div>

      {/* 블루스캔 관련 뉴스 */}
      <div className="insight-card" style={{ marginTop: 16 }}>
        <div className="insight-card__head">
          <span className="insight-card__title"><MI n="newspaper" s={22} />블루스캔 관련 뉴스</span>
        </div>
        {newsAll.length === 0
          ? <div className="nodata-box"><MI n="info" s={20} /><div>표시할 뉴스가 없어요.</div></div>
          : <div className="news-feed">
            {newsAll.map((f, i) => (
              <a className="news-item" key={i} href={f.url || '#'} target="_blank" rel="noopener noreferrer" onClick={e => { if (!f.url) e.preventDefault() }}>
                <div className={'news-day' + (f.days <= 1 ? ' hot' : '')}>{dayLabel(f.days)}</div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div className="news-title">{f.title}</div>
                  <div className="news-meta">
                    {f.sigungu && <span className="news-region"><MI n="location_on" s={14} />{f.sigungu}</span>}
                    {f.source && <span className="news-src">{f.source}</span>}
                  </div>
                </div>
                {f.url && <MI n="chevron_right" s={20} className="news-ext" />}
              </a>
            ))}
          </div>}
      </div>
    </div>
  )
}
