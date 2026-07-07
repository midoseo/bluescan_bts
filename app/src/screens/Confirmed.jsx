/* ===== Confirmed.jsx — 영업활동관리 (통합 활동 로그) =====
 * 신규 영업 방문 결과(visits) + 유지고객 월간 리포트 발송(reportSentOverrides) +
 * 감성터칭 문자 발송(touchOverrides)을 한 타임라인에 시간순으로 쌓아 보여준다.
 * 방문 항목은 인라인 수정·상세(음성/AI)·삭제가 가능하고, 리포트·문자는 읽기 전용 로그.
 */
import React from 'react'
import { MI, VISIT } from '../components.jsx'
import { VisitDialog } from './Visit.jsx'
import { todayYMD } from '../dateUtil.js'
const { useState } = React

const { Badge: CBadge, Button: CButton, Textarea: CTextarea } = window.UXDesignSystem_59a60b;

function fmtNow() { const n = new Date(); const p = (x) => String(x).padStart(2, '0'); return `${n.getFullYear()}.${p(n.getMonth() + 1)}.${p(n.getDate())} ${p(n.getHours())}:${p(n.getMinutes())}`; }
const trackLabel = (c) => c.track === 'A' ? 'A 신규' : c.track === 'B' ? 'B 기존(업셀)' : '유지';

const KIND_META = {
  visit: { label: '방문 결과', icon: 'fact_check', cls: 'visit' },
  report: { label: '리포트 발송', icon: 'description', cls: 'report' },
  msg: { label: '문자 발송', icon: 'sms', cls: 'msg' },
};
const FILTERS = [
  { key: 'all', label: '전체 활동', dot: 'all' },
  { key: 'visit', label: '방문 결과', dot: 'visit' },
  { key: 'report', label: '리포트 발송', dot: 'report' },
  { key: 'msg', label: '문자 발송', dot: 'msg' },
];

export function ConfirmedScreen({ confirmed, visits, onVisit, onRemove, onDownload, retention = [], reportSentOverrides = {}, touchOverrides = {} }) {
  const [modal, setModal] = useState(null);
  const [editId, setEditId] = useState(null);
  const [eStatus, setEStatus] = useState('done');
  const [eMemo, setEMemo] = useState('');
  const [filter, setFilter] = useState('all');

  // --- 통합 활동 로그 구성 ---
  const entries = [];
  confirmed.forEach(c => {
    const v = visits[c.id];
    if (v) entries.push({ key: 'v-' + c.id, kind: 'visit', c, v, date: v.date || todayYMD(), status: v.status, desc: v.memo || `방문 상태 · ${VISIT[v.status]?.label || v.status}` });
  });
  retention.forEach(c => {
    const rd = reportSentOverrides[c.id] ?? c.monthlyReportSent;
    if (rd) entries.push({ key: 'r-' + c.id, kind: 'report', c: { ...c, track: '유지' }, date: rd, desc: `${c.name} 월간 유지관리 리포트 발송` });
    const td = touchOverrides[c.id] ?? c.lastTouchDate;
    if (td) entries.push({ key: 'm-' + c.id, kind: 'msg', c: { ...c, track: '유지' }, date: td, desc: `${c.name} 감성터칭 문자 발송` });
  });
  entries.sort((a, b) => String(b.date).localeCompare(String(a.date)));

  const cnt = { all: entries.length, visit: 0, report: 0, msg: 0 };
  entries.forEach(e => { cnt[e.kind]++; });
  const shown = entries.filter(e => filter === 'all' || e.kind === filter);

  const startEdit = (c) => { const v = visits[c.id] || {}; setEditId(c.id); setEStatus(v.status || 'done'); setEMemo(v.memo || ''); };
  const cancelEdit = () => setEditId(null);
  const saveEdit = (c) => {
    const prev = visits[c.id] || {};
    const text = eMemo.trim() || `상태 업데이트 · ${VISIT[eStatus]?.label || eStatus}`;
    const logs = [{ id: Date.now(), status: eStatus, date: fmtNow(), text }, ...(Array.isArray(prev.logs) ? prev.logs : [])];
    onVisit(c.id, { ...prev, status: eStatus, memo: text, logs, date: prev.date || todayYMD() });
    setEditId(null);
  };

  if (entries.length === 0) return (
    <div className="pc-content fadein" data-screen-label="영업활동관리 (빈 상태)">
      <div className="empty">
        <div className="empty__ico"><MI n="fact_check" s={32} /></div>
        <h3>아직 쌓인 영업활동이 없어요</h3>
        <p>신규·업셀 후보의 <b style={{ color: 'var(--text-body)' }}>방문 결과 입력</b>, 유지고객의 <b style={{ color: 'var(--text-body)' }}>월간 리포트</b>·<b style={{ color: 'var(--text-body)' }}>감성터칭 문자</b> 발송 내역이 이곳에 시간순으로 쌓여요.</p>
      </div>
    </div>
  );

  let lastDay = null;
  return (
    <div className="pc-content fadein" data-screen-label="영업활동관리">
      <div className="pc-pagehead"><div>
        <div className="pc-pagehead__title">영업활동관리</div>
        <div className="pc-pagehead__desc">신규 영업 방문 결과와 유지고객 월간 리포트·감성터칭 문자 발송 내역이 시간순으로 쌓여요.</div>
      </div></div>

      <div className="alog-kpis">
        {FILTERS.map(f => (
          <button key={f.key} className={'alog-kpi' + (filter === f.key ? ' on' : '')} onClick={() => setFilter(f.key)}>
            <span className="alog-kpi__n tnum">{cnt[f.key]}<i>건</i></span>
            <span className="alog-kpi__lab"><i className={'alog-dot alog-dot--' + f.dot} />{f.label}</span>
          </button>
        ))}
      </div>

      <div className="alog-bar">
        <div className="fb-chips">
          {FILTERS.map(f => (
            <button key={f.key} className={'rank-chip' + (filter === f.key ? ' on' : '')} onClick={() => setFilter(f.key)}>{f.label}</button>
          ))}
        </div>
        <CButton size="sm" variant="line" onClick={onDownload} iconLeft={<MI n="download" s={18} />}>CSV 다운로드</CButton>
      </div>
      <div className="mgr-note"><MI n="info" /> 방문 결과는 <b>수정</b>·<b>상세(음성·AI)</b>로 보강할 수 있어요. 리포트·문자 발송은 기록으로 남습니다.</div>

      <div className="alog-feed">
        {shown.map(e => {
          const meta = KIND_META[e.kind];
          const dayHead = e.date !== lastDay ? (lastDay = e.date) : null;
          const vm = e.kind === 'visit' && e.status ? VISIT[e.status] : null;
          const editing = e.kind === 'visit' && editId === e.c.id;
          return (
            <React.Fragment key={e.key}>
              {dayHead && <div className="alog-day">{dayHead}</div>}
              <div className={'alog-item alog-item--' + meta.cls}>
                <div className="alog-ico"><MI n={meta.icon} s={22} /></div>
                <div className="alog-body">
                  <div className="alog-top">
                    <span className="alog-type">{meta.label}</span>
                    <span className="alog-name">{e.c.name}</span>
                    <span className="alog-track">{trackLabel(e.c)}</span>
                    {vm && <CBadge tone={vm.tone} dot>{vm.label}</CBadge>}
                  </div>
                  <div className="alog-desc">{e.desc}</div>
                  {editing && (
                    <div className="conf-edit" style={{ marginTop: 10 }}>
                      <div className="conf-edit__field">
                        <div className="field-label">방문 상태</div>
                        <div className="statuspick">
                          {Object.entries(VISIT).map(([k, vv]) => (
                            <button key={k} type="button" className={'sp-opt' + (eStatus === k ? ' on' : '')} onClick={() => setEStatus(k)}>
                              <span className="sp-dot" style={{ background: vv.dot }} />{vv.label}
                            </button>))}
                        </div>
                      </div>
                      <div className="conf-edit__field">
                        <div className="field-label">메모</div>
                        <CTextarea value={eMemo} onChange={ev => setEMemo(ev.target.value)} rows={2} maxLength={500} placeholder="방문 결과·후속 조치를 입력하세요." />
                      </div>
                      <div className="conf-edit__actions">
                        <CButton variant="secondary" onClick={cancelEdit}>취소</CButton>
                        <CButton onClick={() => saveEdit(e.c)} iconLeft={<MI n="check" s={18} />}>저장</CButton>
                      </div>
                    </div>
                  )}
                </div>
                {e.kind === 'visit' && (
                  <div className="alog-actions">
                    <CButton size="sm" variant={editing ? 'primary' : 'line'} onClick={() => editing ? cancelEdit() : startEdit(e.c)} iconLeft={<MI n={editing ? 'close' : 'edit'} s={16} />}>{editing ? '닫기' : '수정'}</CButton>
                    <CButton size="sm" variant="line" onClick={() => setModal(e.c)} iconLeft={<MI n="mic" s={16} />}>상세</CButton>
                    <CButton size="sm" variant="secondary" onClick={() => onRemove(e.c.id)} iconLeft={<MI n="delete" s={18} />}>{''}</CButton>
                  </div>
                )}
              </div>
            </React.Fragment>
          );
        })}
      </div>
      {modal && <VisitDialog item={modal} initial={visits[modal.id]} onClose={() => setModal(null)} onSave={(id, rec) => onVisit(id, rec)} />}
    </div>
  );
}
