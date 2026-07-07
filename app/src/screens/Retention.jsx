/* ===== Retention.jsx — 유지고객(블루스캔) 대시보드 =====
 * 테마 B(유지고객 리텐션 보강) 1차 화면. R21(유지현황 지도+신호 표시), R23(월간 리포트 초안
 * 자동생성), R25(감성터칭 메시지)까지 다룬다. 이탈 스코어·등급, 해약 방어 시나리오(R22)는
 * 아직 후속 — 신호를 있는 그대로 보여주고 "주의 필요" 여부만 규칙 기반으로 표시한다(가중치
 * 스코어 아님). 월간 리포트·감성터칭 메시지 모두 AI가 초안까지만 생성하고, "승인 발송"은
 * 버튼 클릭으로 상태만 표시하는 모의(mock) 동작이다 — 실제 발송은 하지 않는다(PRD 원칙:
 * 발송은 담당자 승인 필요).
 */
import React from 'react'
import { createPortal } from 'react-dom'
import { MI, won, DetailModal } from '../components.jsx'
import { Donut } from '../charts.jsx'
import { TargetMap } from '../map.jsx'
import { USE_TYPES, PRODUCT_TIERS } from '../retentionSchema.js'
import { buildMonthlyReportData } from '../monthlyReport.js'
import { buildEmpathyMessageDraft } from '../empathyMessage.js'
import { exportElementToPdf } from '../pdfExport.js'
import { currentSeasonKey } from '../season.js'
import { todayCompact } from '../dateUtil.js'
const { useState, useRef, useEffect } = React
const RETENTION_PER_PAGE = 5   // 페이지당 5개 + 페이지네이션

const { Card: RCard, Dialog: RDialog, Badge: RBadge, Button: RButton, TextField: RTextField, Textarea: RTextarea, Chip: RChip, Select: RSelect } = window.UXDesignSystem_59a60b;

// 다른 대시보드(Dash.jsx의 DashCard)와 동일한 카드 헤더 마크업 — 글자 크기·여백을 그대로 맞추기 위해 재사용
function RDashCard({ title, sub, action, children }) {
  return (
    <RCard variant="line">
      <div className="dashhead">
        <div><div className="dashhead__t">{title}</div>{sub && <div className="dashhead__s">{sub}</div>}</div>
        {action && <div className="dashhead__a">{action}</div>}
      </div>
      {children}
    </RCard>
  );
}

const RETENTION_SECTIONS = ['kpis', 'list'];
const RETENTION_SEC_TITLE = { kpis: '핵심 지표', list: '유지고객 목록·지도' };

// "주의 필요" 판정 — 스코어링이 아니라 raw 신호 중 하나라도 해당하면 표시하는 단순 규칙
function needsAttention(c) {
  const daysToEnd = Math.round((new Date(c.endDate) - new Date()) / 86400000);
  const hasSevereSignal = c.signalHistory.some(s => s.severity === '심각');
  return { flag: daysToEnd <= 60 || hasSevereSignal || c.unresolvedVOC > 0, daysToEnd };
}

function TierBadge({ tier }) {
  return <RBadge tone={tier === 'dual' ? 'info' : 'neutral'} shape="pill">{PRODUCT_TIERS[tier]}</RBadge>;
}

// --- 데모 보강: 실 계약·관제 데이터에 아직 없는 VOC·해지·이번달 개시를 id 순서 기반으로 결정론적 배정(시연용).
//     실서비스 전환 시 이 함수 대신 실제 계약/CS 집계로 채운다. (신호 급증·만료 도래는 실데이터로 판정) ---
const OPEN_IDX = new Set([2, 17, 20]);        // 이번달 개시
const TERM_IDX = new Set([9, 25]);            // 해지
const VOC_IDX = new Set([1, 4, 7, 11, 14, 22, 27]); // VOC 발생 고객처
const VOCOPEN_IDX = new Set([4, 11]);         // 미해결 VOC
function augmentRetention(data) {
  const now = new Date();
  return data.map((c, i) => {
    const daysToEnd = Math.round((new Date(c.endDate) - now) / 86400000);
    return {
      ...c,
      openThisMonth: OPEN_IDX.has(i),
      terminated: TERM_IDX.has(i),
      vocTotal: VOC_IDX.has(i) ? 1 : 0,
      unresolvedVOC: VOCOPEN_IDX.has(i) ? 1 : (c.unresolvedVOC || 0),
      manageNeeded: c.signalTrend === '증가' || (c.signalCount90d || 0) >= 120,
      expirySoon: daysToEnd >= 0 && daysToEnd <= 120,
      _daysToEnd: daysToEnd,
    };
  });
}
// KPI 구분(클릭 필터) — 관리물건/개시/해지/만료도래/VOC/미해결VOC/신호관리필요
const RET_KPIS = [
  { key: 'all', label: '관리 유지물건', icon: 'apartment', tone: '' },
  { key: 'open', label: '이번달 개시', icon: 'fiber_new', tone: 'blue' },
  { key: 'term', label: '해지', icon: 'link_off', tone: 'red' },
  { key: 'expiry', label: '계약만료 도래', icon: 'event_busy', tone: 'amber' },
  { key: 'voc', label: 'VOC 발생', icon: 'support_agent', tone: 'amber' },
  { key: 'vocopen', label: '미해결 VOC', icon: 'error', tone: 'red' },
  { key: 'manage', label: '신호 관리필요', icon: 'monitor_heart', tone: 'amber' },
];
function matchCat(c, cat) {
  switch (cat) {
    case 'open': return c.openThisMonth;
    case 'term': return c.terminated;
    case 'expiry': return c.expirySoon;
    case 'voc': return c.vocTotal > 0;
    case 'vocopen': return c.unresolvedVOC > 0;
    case 'manage': return c.manageNeeded;
    default: return true;
  }
}
// AI 추천 다음 액션 — 상태 우선순위로 판단(스코어 아님, 규칙 기반)
function aiAction(c) {
  const d = c._daysToEnd != null ? c._daysToEnd : Math.round((new Date(c.endDate) - new Date()) / 86400000);
  if (c.terminated) return { tone: 'priority', t: '해지 방어', b: '즉시 방문해 원격 전환 혜택·재계약 인센티브를 제안하세요. 최근 신호 이력과 ROI로 유지 가치를 설명합니다.' };
  if (c.unresolvedVOC > 0) return { tone: 'priority', t: '미해결 VOC 처리', b: '접수된 불만을 24시간 내 회신하고 담당자를 배정하세요. 처리 후 감성터칭으로 관계를 회복합니다.' };
  if (c.expirySoon) return { tone: 'warn', t: `계약 만료 D-${d} · 갱신 제안`, b: '3년 재계약 갱신 제안서를 준비하고 방문 일정을 잡으세요. BEP 도달 고객은 유지 가치가 큽니다.' };
  if (c.manageNeeded) return { tone: 'warn', t: '신호 급증 관리', b: '현장 점검 후 월간 리포트를 발송해 안심 소통하세요. 반복 신호는 설비 노후 점검을 권장합니다.' };
  if (c.openThisMonth) return { tone: 'ok', t: '신규 개시 온보딩', b: '개시 축하 콜과 앱 사용법을 안내하세요. 초기 만족도가 장기 유지율을 좌우합니다.' };
  return { tone: 'ok', t: '정상 유지', b: '특이 신호가 없어요. 정기 감성터칭과 분기 리포트로 관계를 관리하세요.' };
}

// 생애가치(BEP/ROI) — "지금 해약하면 손해인가, 할인해줘도 남는 고객인가"를 숫자로 보여준다(스코어 아님)
function LifetimeValueBox({ c }) {
  const lossIfChurn = c.netValueToDate < 0;
  return (
    <div>
      <div className="ld-h" style={{ marginTop: 14 }}>생애가치(BEP/ROI) <span className="faint" style={{ fontWeight: 400 }}>· 계약기간 3년 기준</span></div>
      <dl className="ld-attrs">
        <div><dt>공사비(정가 → 실청구)</dt><dd>{won(c.standardInstallCost)} → {won(c.installCost)} <span className="faint">(할인 {c.installCostDiscountRate}%)</span></dd></div>
        <div><dt>손익분기(BEP)</dt><dd>{c.bepMonths}개월 <RBadge tone={c.bepReached ? 'positive' : 'warning'} shape="pill">{c.bepReached ? '도달' : '미도달'}</RBadge></dd></div>
        <div><dt>3년 ROI</dt><dd>{c.roi3yr}%</dd></div>
        <div><dt>누적 순가치(현재까지)</dt><dd style={{ color: lossIfChurn ? 'var(--s1-red-500,#e5484d)' : 'var(--s1-seagreen-700, #0f8f63)' }}>{won(Math.abs(c.netValueToDate))} {lossIfChurn ? '손실 상태' : '이익 확보'}</dd></div>
      </dl>
      <div className={'bnote' + (lossIfChurn ? '' : '')} style={{ marginTop: 8 }}>
        <MI n={lossIfChurn ? 'priority_high' : 'thumb_up'} />
        <div>{lossIfChurn
          ? <><b>아직 손익분기 전</b>입니다 — 지금 해약되면 회사는 순손실이에요. 할인을 해서라도 반드시 유지시켜야 하는 고객입니다.</>
          : <><b>이미 손익분기를 넘겼습니다</b> — 해약 시즌에 할인을 제공해도 회사 입장에서 이득이 남는 여유가 있는 고객입니다.</>}</div>
      </div>
    </div>
  );
}

const SEVERITY_TONE = { 심각: 'danger', 주의: 'warning', 경미: 'neutral' };

// 월간 리포트 팝업 — 통신사·카드사 청구서 느낌의 분석 리포트 레이아웃. RCard/RDialog 없이도
// 그대로 캡처되도록 순수 마크업(app.css의 .mreport* 클래스)으로 구성했다.
// 이 리포트는 고객사에 제출되는 자료라 생애가치(BEP/ROI, 할인율 등 내부 수익성 정보)는
// 절대 포함하지 않는다 — 그 정보는 컨설턴트 전용인 LifetimeValueBox(행 상세)에만 남겨둔다.
function MonthlyReportDialog({ c, allCustomers, sentDate, onMarkSent, onClose }) {
  const [report] = useState(() => buildMonthlyReportData(c, currentSeasonKey(), allCustomers));
  const reportRef = useRef(null);
  const daysToEnd = Math.round((new Date(c.endDate) - new Date()) / 86400000);

  const sevCount = { 경미: 0, 주의: 0, 심각: 0 };
  report.signalHistory.forEach(s => { sevCount[s.severity] = (sevCount[s.severity] || 0) + 1; });
  const totalSignals = report.signalHistory.length;

  const downloadPdf = async () => { await exportElementToPdf(reportRef.current, `${c.name}_${report.monthLabel}_월간리포트.pdf`); };

  // document.body에 직접 포털로 띄운다 — 목록 영역 안에서 렌더링되면 부모의 스크롤 컨테이너에
  // 갇혀 팝업이 리스트와 같이 스크롤되는 문제가 있어, 화면 중앙에 독립적으로 고정되도록 분리했다.
  return createPortal(
    <RDialog title="월간 유지관리 리포트" subtitle={`${c.name} · ${report.monthLabel}`} closeButton width={760} onClose={onClose}
      actions={[
        { label: '닫기', variant: 'secondary', onClick: onClose },
        { label: 'PDF로 다운로드', variant: 'line', onClick: downloadPdf },
        { label: '승인 후 발송 처리(모의)', onClick: () => onMarkSent(c.id) },
      ]}>
      <div className="mreport" ref={reportRef}>

        <div className="mreport__topband">
          <div className="mreport__topband-row">
            <div>
              <div className="mreport__customer">{c.name}</div>
              <div className="mreport__period">{report.monthLabel} 유지관리 리포트 · 담당 컨설턴트 {report.consultant}</div>
            </div>
            <span className="mreport__badge">{PRODUCT_TIERS[c.productTier]}</span>
          </div>
          <div className="mreport__hero">
            <div className="mreport__herocard"><div className="n">{totalSignals}건</div><div className="l">이번달 신호</div></div>
            <div className="mreport__herocard"><div className="n">{c.remoteControlUsage30d}회</div><div className="l">원격제어 사용</div></div>
            <div className="mreport__herocard"><div className="n">{daysToEnd >= 0 ? `D-${daysToEnd}` : '만료'}</div><div className="l">계약 잔여</div></div>
          </div>
        </div>

        <div className={'mreport__section' + (totalSignals === 0 ? ' mreport__section--ok' : sevCount['심각'] > 0 ? ' mreport__section--warn' : '')}>
          <div className="mreport__sectitle"><MI n="sensors" s={18} />신호 발생 내역</div>
          {totalSignals === 0
            ? <div className="nodata-box"><MI n="check_circle" s={18} /><div>이번 달 특이 신호가 없었습니다. 안정적으로 운영되고 있어요.</div></div>
            : <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
                <Donut labels={['경미', '주의', '심각']} values={[sevCount['경미'], sevCount['주의'], sevCount['심각']]} size={84} title="유형" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {['심각', '주의', '경미'].filter(sv => sevCount[sv] > 0).map(sv => (
                    <RBadge key={sv} tone={SEVERITY_TONE[sv]} shape="pill">{sv} {sevCount[sv]}건</RBadge>
                  ))}
                </div>
              </div>
              {report.signalHistory.map((s, i) => (
                <div className="mreport__row" key={i}>
                  <span className="d">{s.date}</span>
                  <span className="t">{s.type}{s.notifiedAuthority ? ' · 유관기관 통보' : ''}</span>
                  <RBadge tone={SEVERITY_TONE[s.severity]} shape="pill">{s.severity}</RBadge>
                </div>
              ))}
            </>}
        </div>

        <div className="mreport__section mreport__section--info">
          <div className="mreport__sectitle"><MI n="settings_remote" s={18} />원격제어 이용 이력 <span className="faint" style={{ fontWeight: 400 }}>· 최근 30일</span></div>
          {report.remoteControlLog.length === 0
            ? <div className="nodata-box"><MI n="info" s={18} /><div>최근 원격제어 사용 이력이 없습니다.</div></div>
            : report.remoteControlLog.map((r, i) => (
              <div className="mreport__row" key={i}><span className="d">{r.date}</span><span className="t">{r.device}</span><span className="faint">{r.action}</span></div>
            ))}
        </div>

        <div className="mreport__section mreport__section--info">
          <div className="mreport__sectitle"><MI n="newspaper" s={18} />최근 인근 사건사고</div>
          {report.nearbyFire.length === 0 && report.nearbySignals.length === 0
            ? <div className="nodata-box"><MI n="info" s={18} /><div>최근 인근 사건사고 소식이 없습니다.</div></div>
            : <>
              {report.nearbyFire.map((f, i) => (
                <div className="mreport__row" key={'f' + i}><span className="d">{f.time}</span><span className="t">{f.loc} · {f.type}</span><RBadge tone={f.scale === '대형' ? 'danger' : f.scale === '중형' ? 'warning' : 'neutral'} shape="pill">{f.scale}</RBadge></div>
              ))}
              {report.nearbySignals.map((s, i) => (
                <div className="mreport__row" key={'s' + i}><span className="d">{s.date}</span><span className="t">인근({s.dong}) 사업장 · {s.type} <span className="faint">— 다른 건물 참고 사례(익명)</span></span><RBadge tone={SEVERITY_TONE[s.severity]} shape="pill">{s.severity}</RBadge></div>
              ))}
            </>}
        </div>

        <div className="mreport__tip"><MI n="calendar_month" s={18} /><div>{report.seasonTip}</div></div>

        <div className="mreport__foot">본 리포트는 AI가 자동 생성한 초안입니다. 발송 전 담당자 검토가 필요합니다. · 발송 상태: {sentDate ? `${sentDate} 발송 처리됨` : '미발송'}</div>
      </div>
    </RDialog>,
    document.body
  );
}

// 감성터칭 메시지 팝업(R25) — AI가 신호 맥락 기반 초안을 만들고, 담당자가 톤·타이밍을 직접
// 수정한 뒤 승인 발송한다(모의). MonthlyReportDialog와 같은 이유로 document.body에 포털로 띄운다.
function EmpathyMessageDialog({ c, signal, onClose, onSent }) {
  const [text, setText] = useState(() => buildEmpathyMessageDraft(c, signal));
  const send = () => { onSent(c.id); onClose(); };
  return createPortal(
    <RDialog title="감성터칭 메시지" subtitle={`${c.name} · ${signal.date} ${signal.type} 신호`} closeButton width={520} onClose={onClose}
      actions={[
        { label: '닫기', variant: 'secondary', onClick: onClose },
        { label: '승인 발송(모의)', onClick: send },
      ]}>
      <div style={{ padding: 4 }}>
        <div className="faint" style={{ font: 'var(--type-13r)', marginBottom: 8 }}>
          AI가 신호 맥락에 맞춰 초안을 만들었어요. 톤·타이밍을 확인하고 필요하면 직접 수정한 뒤 승인해 주세요.
        </div>
        <RTextarea value={text} onChange={e => setText(e.target.value)} rows={8} />
      </div>
    </RDialog>,
    document.body
  );
}

function RetentionDetail({ c, sentDate, onOpenReport, touchDate, onOpenEmpathy }) {
  return (
    <>
          <div className="ld-grid">
            <div>
              <div className="ld-h">계약 정보</div>
              <dl className="ld-attrs">
                <div><dt>지사</dt><dd>{c.branch}</dd></div>
                <div><dt>계약일</dt><dd>{c.contractDate}</dd></div>
                <div><dt>개시일</dt><dd>{c.startDate}</dd></div>
                <div><dt>계약종료(예상)</dt><dd>{c.endDate}</dd></div>
                <div><dt>누적 유지기간</dt><dd>{c.contractMonths}개월</dd></div>
                <div><dt>월 서비스료(계약 당시)</dt><dd>{won(c.monthlyFee)}</dd></div>
              </dl>
              <div className="ld-h" style={{ marginTop: 14 }}>설비 구성</div>
              <div className="brow-badges">
                {c.sensorTypes.map(s => <RBadge key={s} tone="neutral" shape="pill">{s} 센서</RBadge>)}
                {c.remoteControlDevices.map(d => <RBadge key={d} tone="info" shape="pill">원격제어 · {d}</RBadge>)}
              </div>
              <LifetimeValueBox c={c} />
            </div>
            <div>
              <div className="ld-h">관제 신호 이력 <span className="faint" style={{ fontWeight: 400 }}>· {c.signal3mWindow || '최근 3개월'} 총 {c.signal3mTotal ?? c.signalHistory.length}건</span></div>
              {c.signalHistory.length === 0
                ? <div className="nodata-box"><MI n="info" s={18} /><div>최근 3개월 신호가 없어요.</div></div>
                : <>
                  <div className="kwtable">
                    {c.signalHistory.map((s, i) => (
                      <div className="kwt-row" key={i}>
                        <span className="kwt-kw">{s.date} · {s.type}</span>
                        <span className="kwt-cat"><RBadge tone={s.severity === '심각' ? 'danger' : s.severity === '주의' ? 'warning' : 'neutral'} shape="pill">{s.severity}</RBadge></span>
                        <span className="kwt-freq faint" style={{ flex: 1, textAlign: 'right', fontVariantNumeric: 'normal' }}>
                          {s.notifiedAuthority ? '유관기관 통보' : ''}
                        </span>
                        <button className="kwt-touch" title="감성터칭 메시지 생성" onClick={e => { e.stopPropagation(); onOpenEmpathy(c, s); }}>
                          <MI n="favorite" s={16} />
                        </button>
                      </div>))}
                  </div>
                  {(c.signalRestSummary && c.signalRestSummary.length > 0) && (
                    <div className="sig-rest">
                      <span className="sig-rest__lab">그 외 3개월 신호</span>
                      {c.signalRestSummary.map(r => (
                        <span className="sig-rest__chip" key={r.type}>{r.type} <b>{r.count}</b></span>
                      ))}
                    </div>
                  )}
                </>}
              <div className="ld-h" style={{ marginTop: 14 }}>활성도·소통</div>
              <dl className="ld-attrs">
                <div><dt>원격제어 사용(30일)</dt><dd>{c.remoteControlUsage30d}회</dd></div>
                <div><dt>앱·웹 마지막 접속</dt><dd>{c.lastAppAccessDate}</dd></div>
                <div><dt>미해결 VOC</dt><dd>{c.unresolvedVOC}건</dd></div>
                <div><dt>월간 리포트 최근 발송</dt><dd>{sentDate || <i className="nd">미발송</i>}</dd></div>
                <div><dt>감성터칭 최근 발송</dt><dd>{touchDate || <i className="nd">없음</i>}</dd></div>
              </dl>
              <div className="ld-h" style={{ marginTop: 14 }}>월간 리포트 <span className="faint" style={{ fontWeight: 400 }}>· AI 자동생성 · 발송 전 검토 필요</span></div>
              <div onClick={e => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <RButton size="sm" variant="line" onClick={() => onOpenReport(c)} iconLeft={<MI n="description" s={18} />}>월간 리포트 보기</RButton>
                <span className="faint" style={{ font: 'var(--type-12r)' }}>발송 상태: {sentDate || '미발송'}</span>
              </div>
            </div>
          </div>
          {(() => { const a = aiAction(c); return (
            <div className={'ld-ai ld-ai--' + a.tone}>
              <div className="ld-ai__ico"><MI n="smart_toy" s={20} /></div>
              <div className="ld-ai__body">
                <div className="ld-ai__badge">AI 추천 다음 액션</div>
                <div className="ld-ai__t">{a.t}</div>
                <div className="ld-ai__b">{a.b}</div>
              </div>
            </div>
          ); })()}
    </>
  );
}

function RetentionRow({ c, expanded, onToggle, sentDate, onOpenReport, touchDate, onOpenEmpathy }) {
  const att = needsAttention(c);
  return (
    <div className={'lrow lrow--b' + (expanded ? ' open' : '') + (att.flag ? ' lrow-priority' : '')}>
      <div className="lrow-main" onClick={onToggle}>
        <div className="lrow-id">
          <div className="lrow-name">{c.name} <span className="kw">{c.use}</span>
            {c.terminated && <RBadge tone="danger" shape="pill">해지</RBadge>}
            {c.unresolvedVOC > 0 ? <RBadge tone="danger" shape="pill">미해결 VOC</RBadge> : (c.vocTotal > 0 && <RBadge tone="warning" shape="pill">VOC</RBadge>)}
            {c.expirySoon && <RBadge tone="warning" shape="pill">만료 D-{c._daysToEnd}</RBadge>}
            {c.openThisMonth && <RBadge tone="info" shape="pill">이번달 개시</RBadge>}
            {att.flag && !c.terminated && <RBadge tone="danger" shape="pill" dot>주의 필요</RBadge>}
            <TierBadge tier={c.productTier} />
          </div>
          <div className="lrow-addr">{c.address} · 계약번호 {c.contractNo} · 담당 {c.assignedConsultant}</div>
        </div>
        <div style={{ flex: 'none', display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ textAlign: 'right' }}>
            <div className="faint" style={{ font: 'var(--type-12r)' }}>최근 30일 신호</div>
            <div className="tnum" style={{ font: 'var(--type-15m)' }}>{c.signalCount30d}건 <span className="faint" style={{ font: 'var(--type-12r)' }}>({c.signalTrend})</span></div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="faint" style={{ font: 'var(--type-12r)' }}>계약 종료(예상)</div>
            <div className="tnum" style={{ font: 'var(--type-15m)', color: att.daysToEnd <= 60 ? 'var(--s1-red-500,#e5484d)' : undefined }}>
              {att.daysToEnd >= 0 ? `D-${att.daysToEnd}` : `만료 ${-att.daysToEnd}일 경과`}
            </div>
          </div>
        </div>
        <span className="lrow-more" aria-hidden="true">자세히<MI n="chevron_right" s={18} /></span>
      </div>
    </div>
  );
}

export function RetentionScreen({ data, listMode, onListMode, reportSentOverrides: sentOverrides, onMarkReportSent: markSent, touchOverrides, onMarkTouched: markTouched }) {
  const [branch, setBranch] = useState('전체');
  const [use, setUse] = useState('전체');
  const [tier, setTier] = useState('all');
  const [q, setQ] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [focusId, setFocusId] = useState(null); // 선택 고객 — 지도 핀 focus+zoom 대상
  const [showAttentionOnly, setShowAttentionOnly] = useState(false);
  const [reportFor, setReportFor] = useState(null); // 월간 리포트 팝업 대상 고객
  const [empathyFor, setEmpathyFor] = useState(null); // { c, signal } — 감성터칭 메시지 팝업 대상
  const [page, setPage] = useState(1);
  const [cat, setCat] = useState('all'); // KPI 구분 필터
  // 리포트·감성터칭 발송 상태는 App.jsx로 끌어올려졌다(게이미피케이션 포인트 계산에 필요해서) —
  // sentOverrides/markSent/touchOverrides/markTouched는 위에서 props를 받아온 이름 그대로 재사용한다.

  const aug = augmentRetention(data);
  const branches = ['전체', ...Array.from(new Set(aug.map(c => c.branch)))];
  const qx = q.trim().toLowerCase();
  const withAttention = aug.map(c => ({ c, att: needsAttention(c) }));
  const filtered = withAttention.filter(({ c, att }) =>
    matchCat(c, cat) &&
    (branch === '전체' || c.branch === branch) &&
    (use === '전체' || c.use === use) &&
    (tier === 'all' || c.productTier === tier) &&
    (!showAttentionOnly || att.flag) &&
    (qx === '' || (`${c.name} ${c.contractNo}`).toLowerCase().includes(qx))
  ).map(x => x.c);

  // 페이지네이션 (신규진행현황과 동일) — 필터/검색이 바뀌면 1페이지로
  useEffect(() => { setPage(1); }, [branch, use, tier, q, showAttentionOnly, cat]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / RETENTION_PER_PAGE));
  const curPage = Math.min(page, totalPages);
  const pageBase = (curPage - 1) * RETENTION_PER_PAGE;
  const pageItems = filtered.slice(pageBase, pageBase + RETENTION_PER_PAGE);

  const downloadCsv = () => {
    const head = ['계약처', '지사', '업종', '상품', '계약번호', '계약종료(예상)', '최근30일신호', '주의필요'];
    const rows = filtered.map(c => { const att = needsAttention(c); return [c.name, c.branch, c.use, PRODUCT_TIERS[c.productTier], c.contractNo, c.endDate, c.signalCount30d, att.flag ? 'Y' : '']; });
    const csv = '﻿' + [head, ...rows].map(r => r.map(x => `"${String(x).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `유지관리현황_${todayCompact()}.csv`; a.click();
  };

  const kpiCount = (key) => key === 'all' ? aug.length : aug.filter(c => matchCat(c, key)).length;

  const mapCands = filtered.map(c => ({ ...c, attention: needsAttention(c).flag }));

  const blocks = {
    kpis: (
      <div className="retkpis">
        {RET_KPIS.map(k => (
          <button key={k.key} className={'retkpi' + (k.tone ? ' retkpi--' + k.tone : '') + (cat === k.key ? ' on' : '')}
            onClick={() => setCat(cat === k.key && k.key !== 'all' ? 'all' : k.key)}>
            <span className="retkpi__ico"><MI n={k.icon} s={18} /></span>
            <span className="retkpi__n tnum">{kpiCount(k.key)}<i>건</i></span>
            <span className="retkpi__lab">{k.label}</span>
          </button>
        ))}
      </div>
    ),
    list: (
      <>
        <div className="filterbar">
          <div className="fb-row">
            <span className="fb-label"><MI n="search" s={18} />검색</span>
            <div style={{ width: 220 }}><RTextField value={q} onChange={e => setQ(e.target.value)} placeholder="계약처명·계약번호로 검색" iconLeft={<MI n="search" s={18} />} /></div>
            {q && <RButton size="sm" variant="line" onClick={() => setQ('')} iconLeft={<MI n="close" s={16} />}>해제</RButton>}
            <span className="fb-label" style={{ marginLeft: 12 }}><MI n="category" s={18} />업종</span>
            <div className="fb-chips" style={{ flex: '0 0 auto' }}>
              <RChip selected={use === '전체'} onClick={() => setUse('전체')}>전체</RChip>
              {USE_TYPES.map(u => <RChip key={u} selected={use === u} onClick={() => setUse(u)}>{u}</RChip>)}
            </div>
            <div className="fb-spacer">
              <RChip selected={tier === 'all'} onClick={() => setTier('all')}>전체 상품</RChip>
              <RChip selected={tier === 'dual'} onClick={() => setTier('dual')}>듀얼</RChip>
              <RChip selected={tier === 'owner'} onClick={() => setTier('owner')}>오너</RChip>
              <RChip selected={showAttentionOnly} onClick={() => setShowAttentionOnly(v => !v)}>주의 필요만</RChip>
            </div>
          </div>
        </div>

        <div className="split">
          <div className="split-list">
            <div className="list-meta">
              <span className="muted"><b className="tnum">{filtered.length}</b>곳</span>
              <RButton size="sm" variant="line" onClick={downloadCsv} iconLeft={<MI n="download" s={18} />}>엑셀 다운로드</RButton>
            </div>
            {filtered.length === 0
              ? <div className="nodata-box" style={{ margin: 12 }}><MI n="filter_alt_off" s={20} /><div>조건에 맞는 유지고객이 없어요.</div></div>
              : <>
                <div className="rows" style={{ padding: '4px 12px 12px' }}>
                  {pageItems.map(c => (
                    <div key={c.id}>
                      <RetentionRow c={c} expanded={expanded === c.id} onToggle={() => { setExpanded(c.id); setFocusId(c.id); }}
                        sentDate={sentOverrides[c.id] ?? c.monthlyReportSent} onOpenReport={setReportFor}
                        touchDate={touchOverrides[c.id] ?? c.lastTouchDate} onOpenEmpathy={(cust, signal) => setEmpathyFor({ c: cust, signal })} />
                    </div>
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="pager">
                    <button className="pager__b" disabled={curPage === 1} onClick={() => setPage(curPage - 1)} aria-label="이전 페이지"><MI n="chevron_left" s={20} /></button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                      <button key={n} className={'pager__b' + (n === curPage ? ' on' : '')} onClick={() => setPage(n)}>{n}</button>
                    ))}
                    <button className="pager__b" disabled={curPage === totalPages} onClick={() => setPage(curPage + 1)} aria-label="다음 페이지"><MI n="chevron_right" s={20} /></button>
                  </div>
                )}
              </>}
          </div>
          <div className="split-map">
            <div className="map-top">
              <span className="eyebrow">유지현황 지도</span>
              <span className="map-top__chips faint" style={{ font: 'var(--type-12r)' }}>🔺 주의 필요 · 🔵 안정</span>
            </div>
            <div style={{ flex: 1, position: 'relative' }}>
              {mapCands.length > 0
                ? <TargetMap candidates={mapCands} showFire={false} showFlood={false} selectedId={expanded} onSelect={(id) => { setExpanded(id); setFocusId(id); }} focusId={focusId} fitKey={`${branch}|${use}|${tier}|${showAttentionOnly}|${qx}`} variant="C" />
                : <div className="map-empty"><MI n="map" s={28} /><span>표시할 고객이 없어요</span></div>}
            </div>
          </div>
        </div>
      </>
    ),
  };

  return (
    <div className="pc-content pc-content--wide fadein" data-screen-label="유지관리현황">
      {blocks.kpis}
      {blocks.list}
      {expanded != null && (() => { const c = filtered.find(x => x.id === expanded); if (!c) return null; return (
        <DetailModal title={c.name} subtitle={`${c.use} · 계약 ${c.contractNo}`} onClose={() => setExpanded(null)}>
          <RetentionDetail c={c} sentDate={sentOverrides[c.id] ?? c.monthlyReportSent} onOpenReport={setReportFor}
            touchDate={touchOverrides[c.id] ?? c.lastTouchDate} onOpenEmpathy={(cust, signal) => setEmpathyFor({ c: cust, signal })} />
        </DetailModal>); })()}
      {reportFor && (
        <MonthlyReportDialog c={reportFor} allCustomers={data}
          sentDate={sentOverrides[reportFor.id] ?? reportFor.monthlyReportSent}
          onMarkSent={(id) => { markSent(id); }}
          onClose={() => setReportFor(null)} />
      )}
      {empathyFor && (
        <EmpathyMessageDialog c={empathyFor.c} signal={empathyFor.signal}
          onSent={markTouched} onClose={() => setEmpathyFor(null)} />
      )}
    </div>
  );
}
