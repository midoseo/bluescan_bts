/* ===== Confirmed.jsx — 방문 결과 기록 (목록 인라인 수정 + 상세 다이얼로그) ===== */
import React from 'react'
import { MI, VISIT } from '../components.jsx'
import { VisitDialog } from './Visit.jsx'
import { todayYMD } from '../dateUtil.js'
const { useState } = React

const { Badge: CBadge, Button: CButton, Textarea: CTextarea } = window.UXDesignSystem_59a60b;

function fmtNow() { const n = new Date(); const p = (x) => String(x).padStart(2, '0'); return `${n.getFullYear()}.${p(n.getMonth() + 1)}.${p(n.getDate())} ${p(n.getHours())}:${p(n.getMinutes())}`; }

export function ConfirmedScreen({ confirmed, visits, onVisit, onRemove, onDownload }) {
  const [modal, setModal] = useState(null);
  const [editId, setEditId] = useState(null);     // 인라인 수정 중인 행
  const [eStatus, setEStatus] = useState('done');
  const [eMemo, setEMemo] = useState('');

  const cnt = { done: 0, revisit: 0, reject: 0, won: 0 };
  confirmed.forEach(c => { const v = visits[c.id]; if (v && cnt[v.status] != null) cnt[v.status]++; });

  const startEdit = (c) => { const v = visits[c.id] || {}; setEditId(c.id); setEStatus(v.status || 'done'); setEMemo(v.memo || ''); };
  const cancelEdit = () => setEditId(null);
  const saveEdit = (c) => {
    const prev = visits[c.id] || {};
    const text = eMemo.trim() || `상태 업데이트 · ${VISIT[eStatus]?.label || eStatus}`;
    const logs = [{ id: Date.now(), status: eStatus, date: fmtNow(), text }, ...(Array.isArray(prev.logs) ? prev.logs : [])];
    onVisit(c.id, { ...prev, status: eStatus, memo: text, logs, date: prev.date || todayYMD() });
    setEditId(null);
  };

  if (confirmed.length === 0) return (
    <div className="pc-content fadein" data-screen-label="방문 결과 기록 (빈 상태)">
      <div className="empty">
        <div className="empty__ico"><MI n="fact_check" s={32} /></div>
        <h3>아직 입력된 방문 결과가 없어요</h3>
        <p>신규 고객 후보·기존 고객 후보(업셀링) 목록에서 <b style={{ color: 'var(--text-body)' }}>결과 입력</b>을 누르면 방문 결과가 이곳에 쌓여요.</p>
      </div>
    </div>
  );

  return (
    <div className="pc-content fadein" data-screen-label="방문 결과 기록">
      <div className="pc-pagehead">
        <div>
          <div className="pc-pagehead__title">방문 결과 기록</div>
          <div className="pc-pagehead__desc">입력한 방문 결과를 목록에서 <b style={{ color: 'var(--text-body)' }}>바로 수정</b>하거나, 상세(음성·AI)로 보강하고 파일로 내려받을 수 있어요.</div>
        </div>
      </div>

      <div className="conf-head">
        <div className="cp-prog">
          <div className="cp-item"><span className="cp-num tnum">{confirmed.length}</span><span className="k">전체 기록</span></div>
          <div className="cp-bar"><div className="cp-fill" style={{ width: (cnt.done / confirmed.length * 100) + '%' }} /></div>
          <div className="cp-item"><span className="cp-num tnum" style={{ color: 'var(--s1-seagreen-700)' }}>{cnt.done}</span><span className="k">방문완료</span></div>
          <div className="cp-item"><span className="cp-num tnum" style={{ color: 'var(--s1-yellow-800)' }}>{cnt.revisit}</span><span className="k">재방문필요</span></div>
          <div className="cp-item"><span className="cp-num tnum" style={{ color: 'var(--s1-red-500)' }}>{cnt.reject}</span><span className="k">거절</span></div>
          <div className="cp-item"><span className="cp-num tnum" style={{ color: 'var(--s1-blue-500, #1d6ceb)' }}>{cnt.won}</span><span className="k">수주완료</span></div>
        </div>
        <CButton onClick={onDownload} iconLeft={<MI n="download" s={18} />}>CSV 다운로드</CButton>
      </div>
      <div className="mgr-note"><MI n="info" /> 방문 상태·메모는 행의 <b>수정</b>으로 바로 변경할 수 있어요. 음성·AI 분석이 필요하면 <b>상세</b>를 이용하세요.</div>

      <div style={{ border: '1px solid var(--border-default)', borderRadius: 'var(--radius-m)', overflow: 'hidden' }}>
        <table className="s1table">
          <thead><tr>
            <th style={{ width: 118 }}>트랙</th><th>대상</th><th>지역 · 정보</th>
            <th className="c" style={{ width: 110 }}>방문 상태</th><th>메모</th><th style={{ width: 184 }}></th>
          </tr></thead>
          <tbody>
            {confirmed.map(c => {
              const v = visits[c.id]; const vm = v ? VISIT[v.status] : null;
              const editing = editId === c.id;
              return (
                <React.Fragment key={c.id}>
                  <tr className={editing ? 'row-editing' : ''}>
                    <td><CBadge tone={c.track === 'A' ? 'info' : 'neutral'}>{c.track === 'A' ? 'A 신규' : 'B 기존(업셀링)'}</CBadge></td>
                    <td><b>{c.name}</b></td>
                    <td>{c.track === 'A' ? `${c.sigungu} · ${c.use}` : `${c.branch} · ${c.ind}`}</td>
                    <td className="c">{vm ? <CBadge tone={vm.tone} dot>{vm.label}</CBadge> : <CBadge tone="neutral">미입력</CBadge>}</td>
                    <td className="memo-cell">{v?.memo || '—'}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        <CButton size="sm" variant={editing ? 'primary' : 'line'} onClick={() => editing ? cancelEdit() : startEdit(c)} iconLeft={<MI n={editing ? 'close' : 'edit'} s={16} />}>{editing ? '닫기' : '수정'}</CButton>
                        <CButton size="sm" variant="line" onClick={() => setModal(c)} iconLeft={<MI n="mic" s={16} />}>상세</CButton>
                        <CButton size="sm" variant="secondary" onClick={() => onRemove(c.id)} iconLeft={<MI n="delete" s={18} />}>{''}</CButton>
                      </div>
                    </td>
                  </tr>
                  {editing && (
                    <tr className="conf-edit-row">
                      <td colSpan={6}>
                        <div className="conf-edit">
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
                            <CTextarea value={eMemo} onChange={e => setEMemo(e.target.value)} rows={2} maxLength={500}
                              placeholder="방문 결과·후속 조치를 입력하세요. (저장하면 기록 타임라인에 반영돼요)" />
                          </div>
                          <div className="conf-edit__actions">
                            <CButton variant="secondary" onClick={cancelEdit}>취소</CButton>
                            <CButton onClick={() => saveEdit(c)} iconLeft={<MI n="check" s={18} />}>저장</CButton>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>);
            })}
          </tbody>
        </table>
      </div>
      {modal && <VisitDialog item={modal} initial={visits[modal.id]} onClose={() => setModal(null)} onSave={(id, rec) => onVisit(id, rec)} />}
    </div>
  );
}
