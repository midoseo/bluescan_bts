/* ===== Insight.jsx — 인사이트 페이지 =====
   세 가지를 세그먼트 탭으로 구성한다.
   ① 신호 인사이트 리포트 — 관제 신호 마스 데이터 분석(월별 경향·계절 신호·고객 3분류·제안 활용)
   ② 화재 뉴스 — 블루스캔 관련 화재 뉴스(현재 더미, 일별 크롤링은 별도 연동 예정)
   ③ 실 화재 사례 — 화재 대시보드에서 끌어온 실 화재 포인트를 앱 UI에 맞춘 네이티브 카드로 표시
   ※ 외부 대시보드 iframe 임베드는 제외(별도 연동 예정).
*/
import React, { useState } from 'react'
import { MI } from '../components.jsx'
import { TargetMap } from '../map.jsx'
import { FIRE_OVERLAY } from '../fireOverlay.js'
import { SIGNAL_INSIGHTS as SI, SEOGANG_INSIGHTS as SG } from '../signalInsights.js'
import { AreaChartC, GroupedBar } from '../charts.jsx'

const TABS = [
  { key: 'report', label: '신호 인사이트 리포트', icon: 'insights' },
  { key: 'news', label: '화재 뉴스', icon: 'newspaper' },
  { key: 'cases', label: '실 화재 사례', icon: 'local_fire_department' },
]

/* 화재 유형 → 심각도 톤 */
function fireTone(type) {
  const t = String(type || '')
  if (/대형|고층/.test(t)) return 'red'
  if (/일반/.test(t)) return 'orange'
  return 'gray'
}

/* 신호 인사이트 리포트 — 전국 */
function NationalReport() {
  return (
    <div className="fadein">
      <div className="scope-badge nat"><MI n="public" s={16} />전국 기준</div>
      <div className="ins-src"><MI n="database" s={16} />{SI.period} · {SI.source}</div>

      <div className="ins-kpis">
        {SI.kpis.map(k => (
          <div className="ins-kpi" key={k.key}>
            <div className="ins-kpi__ico"><MI n={k.icon} s={20} /></div>
            <div className="ins-kpi__body">
              <div className="ins-kpi__val">{k.value}<span>{k.unit}</span></div>
              <div className="ins-kpi__label">{k.label}</div>
              <div className="ins-kpi__note">{k.note}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="insight-card" style={{ marginTop: 16 }}>
        <div className="insight-card__head">
          <span className="insight-card__title"><MI n="show_chart" s={22} />월별 관제 신호량</span>
        </div>
        <AreaChartC categories={SI.monthly.categories} series={[{ name: '월 신호량', data: SI.monthly.data }]} unit="건" />
        <div className="insight-note"><MI n="trending_up" s={16} />{SI.monthly.momText}. 단순 고객 증가가 아니라 여름 진입에 따른 계절 신호가 더해진 결과예요.</div>
      </div>

      <div className="insight-card" style={{ marginTop: 16 }}>
        <div className="insight-card__head">
          <span className="insight-card__title"><MI n="wb_sunny" s={22} />계절형 신호 급증 (2월 → 5월)</span>
        </div>
        <GroupedBar
          categories={SI.seasonal.categories}
          series={[{ name: '2월', data: SI.seasonal.feb }, { name: '5월', data: SI.seasonal.may }]}
          unit="건" />
        <div className="ins-growth">
          {SI.seasonal.categories.map((c, i) => (
            <span className={'ins-growth__chip' + (SI.seasonal.growthPct[i] >= 90 ? ' hot' : '')} key={c}>
              {c} <b>+{SI.seasonal.growthPct[i]}%</b>
            </span>
          ))}
        </div>
        <div className="insight-note"><MI n="ac_unit" s={16} />온도·냉방·침수 계열이 여름 대비 관리 수요를 그대로 보여주는 선행 지표예요. 화재·전력은 거의 평탄.</div>
      </div>

      <div className="insight-card" style={{ marginTop: 16 }}>
        <div className="insight-card__head">
          <span className="insight-card__title"><MI n="groups" s={22} />고객 리텐션 신호 3분류</span>
        </div>
        <div className="ins-segs">
          {SI.segments.map(sg => (
            <div className={'ins-seg-card ins-seg-card--' + sg.tone} key={sg.key}>
              <div className="ins-seg-card__head"><MI n={sg.icon} s={18} />{sg.title}</div>
              <p className="ins-seg-card__desc">{sg.desc}</p>
              <div className="ins-seg-card__list">
                {sg.items.map((it, i) => (
                  <div className="ins-cust" key={i}>
                    <span className="ins-cust__name">{it.name}</span>
                    <span className="ins-cust__trend">{it.trend}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="insight-card ins-proposal" style={{ marginTop: 16 }}>
        <div className="insight-card__head">
          <span className="insight-card__title"><MI n="lightbulb" s={22} />고객 제안에 이렇게 활용하세요</span>
        </div>
        <div className="ins-props">
          {SI.proposals.map((p, i) => (
            <div className="ins-prop" key={i}>
              <div className="ins-prop__ico"><MI n={p.icon} s={20} /></div>
              <div>
                <div className="ins-prop__title">{p.title}</div>
                <div className="ins-prop__body">{p.body}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* 신호 인사이트 리포트 — 서강지사 */
function SeogangReport() {
  const catMax = Math.max(...SG.categories.map(c => c.n))
  return (
    <div className="fadein">
      <div className="scope-badge sg"><MI n="location_city" s={16} />{SG.branch} · {SG.area}</div>
      <div className="ins-src"><MI n="database" s={16} />{SG.source}</div>

      <div className="ins-kpis">
        {SG.kpis.map(k => (
          <div className="ins-kpi" key={k.key}>
            <div className="ins-kpi__ico"><MI n={k.icon} s={20} /></div>
            <div className="ins-kpi__body">
              <div className="ins-kpi__val">{k.value}<span>{k.unit}</span></div>
              <div className="ins-kpi__label">{k.label}</div>
              <div className="ins-kpi__note">{k.note}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="insight-card" style={{ marginTop: 16 }}>
        <div className="insight-card__head">
          <span className="insight-card__title ins-title--sg"><MI n="apartment" s={22} />계약 기반 특성 — 도심 오피스·상가 밀집</span>
        </div>
        <div className="ins-uchips">
          {SG.industries.map(u => (
            <span className="ins-uchip" key={u.name}>{u.name}<b>{u.n.toLocaleString()}</b></span>
          ))}
        </div>
        <div className="insight-note"><MI n="info" s={16} />{SG.contractNote}</div>
      </div>

      <div className="insight-card" style={{ marginTop: 16 }}>
        <div className="insight-card__head">
          <span className="insight-card__title ins-title--sg"><MI n="water_drop" s={22} />서강 관제 신호 — 침수·배수가 1순위</span>
        </div>
        <div className="ins-hbar">
          {SG.categories.map(c => (
            <div className="ins-hbar__row" key={c.name}>
              <div className="ins-hbar__name">{c.name}</div>
              <div className="ins-hbar__track"><div className={'ins-hbar__fill' + (c.hot ? ' hot' : '')} style={{ width: (c.n / catMax * 100) + '%' }} /></div>
              <div className="ins-hbar__val">{c.n}건</div>
            </div>
          ))}
        </div>
        <div className="insight-note"><MI n="tips_and_updates" s={16} />{SG.categoryNote}</div>
      </div>

      <div className="insight-card" style={{ marginTop: 16 }}>
        <div className="insight-card__head">
          <span className="insight-card__title ins-title--sg"><MI n="domain" s={22} />주요 관제 고객 (금융·오피스 중심)</span>
        </div>
        <div className="ins-clist">
          {SG.topCustomers.map(c => (
            <div className="ins-crow" key={c.name}><span className="ins-crow__n">{c.name}</span><span className="ins-crow__v">{c.n}건</span></div>
          ))}
        </div>
        <div className="insight-note"><MI n="south_east" s={16} />{SG.customerNote}</div>
      </div>

      <div className="insight-card ins-proposal" style={{ marginTop: 16 }}>
        <div className="insight-card__head">
          <span className="insight-card__title ins-title--sg"><MI n="lightbulb" s={22} />서강지사 제안 전략</span>
        </div>
        <div className="ins-props">
          {SG.proposals.map((p, i) => (
            <div className="ins-prop" key={i}>
              <div className="ins-prop__ico"><MI n={p.icon} s={20} /></div>
              <div>
                <div className="ins-prop__title">{p.title}</div>
                <div className="ins-prop__body">{p.body}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function InsightScreen() {
  const [tab, setTab] = useState('report')
  const [scope, setScope] = useState('nat')
  const D = (typeof window !== 'undefined' && window.APPDATA) || {}
  const newsAll = (D.firePoints || []).filter(f => f.title).slice().sort((a, b) => a.days - b.days).slice(0, 12)
  const dayLabel = (d) => d <= 0 ? '오늘' : d === 1 ? '어제' : d + '일 전'
  const cases = FIRE_OVERLAY.points.slice()

  return (
    <div className="pc-content pc-content--wide fadein">
      <div className="pc-pagehead"><div>
        <h1 className="pc-pagehead__title">인사이트</h1>
        <p className="pc-pagehead__desc">관제 신호 분석과 화재 동향을 바탕으로 고객 제안에 쓸 인사이트를 제공해요.</p>
      </div></div>

      {/* 범위 스위치 (전국/서강지사) */}
      <div className="ins-scope">
        <span className="ins-scope__label">범위</span>
        <div className="seg ins-scope__seg" role="tablist">
          <button className={scope === 'nat' ? 'on' : ''} onClick={() => setScope('nat')}><MI n="public" s={17} />전국</button>
          <button className={scope === 'sg' ? 'on' : ''} onClick={() => setScope('sg')}><MI n="location_city" s={17} />서강지사</button>
        </div>
      </div>

      {/* 탭 스위처 */}
      <div className="seg ins-seg" role="tablist" style={{ marginBottom: 16 }}>
        {TABS.map(t => (
          <button key={t.key} className={tab === t.key ? 'on' : ''} role="tab" aria-selected={tab === t.key} onClick={() => setTab(t.key)}>
            <MI n={t.icon} s={18} />{t.label}
          </button>
        ))}
      </div>

      {/* ① 신호 인사이트 리포트 (전국/서강 분리) */}
      {tab === 'report' && (scope === 'nat' ? <NationalReport /> : <SeogangReport />)}

      {/* ② 화재 뉴스 */}
      {tab === 'news' && (
        <div className="insight-card fadein">
          <div className="insight-card__head">
            <span className="insight-card__title"><MI n="newspaper" s={22} />블루스캔 관련 화재 뉴스</span>
            <span className="ins-badge-dummy">샘플 데이터</span>
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
          <div className="insight-note"><MI n="info" s={16} />현재는 샘플 뉴스예요. 일별 자동 크롤링 연동은 별도로 진행할 예정입니다.</div>
        </div>
      )}

      {/* ③ 실 화재 사례 (네이티브 카드) */}
      {tab === 'cases' && (
        <div className="fadein">
          <div className="insight-card" style={{ marginBottom: 16 }}>
            <div className="insight-card__head">
              <span className="insight-card__title"><MI n="local_fire_department" s={22} />전국 화재 발생 지도<span className="insight-live">{FIRE_OVERLAY.updated} · {cases.length}건</span></span>
            </div>
            <div style={{ position: 'relative', height: 420, borderRadius: 12, overflow: 'hidden', border: '1px solid #eaecf0' }}>
              <TargetMap candidates={[]} firePointsLive={FIRE_OVERLAY.points} showFire showFlood={false} variant="fire" fitKey={`fire-${FIRE_OVERLAY.points.length}`} />
            </div>
            <div className="insight-note"><MI n="info" s={16} />국민안전24 실시간 화재정보(WGS84 좌표) 기반. 최근일수록 진하게 표시돼요.</div>
          </div>

          <div className="insight-card">
            <div className="insight-card__head">
              <span className="insight-card__title"><MI n="format_list_bulleted" s={22} />최근 화재 사례</span>
            </div>
            <div className="firecases">
              {cases.map((c, i) => {
                const tone = fireTone(c.type)
                return (
                  <div className={'firecase firecase--' + tone} key={i}>
                    <div className="firecase__top">
                      <span className={'firecase__type firecase__type--' + tone}>{c.type}</span>
                      <span className="firecase__time">{(c.time || '').split(' ')[1] || c.time}</span>
                    </div>
                    <div className="firecase__loc"><MI n="location_on" s={16} />{c.loc}</div>
                  </div>
                )
              })}
            </div>
            <div className="insight-note"><MI n="tips_and_updates" s={16} />화재 인근·용도 유사 고객처는 재접촉 타이밍 신호로 활용할 수 있어요. 대형·고층 화재일수록 우선.</div>
          </div>
        </div>
      )}
    </div>
  )
}
