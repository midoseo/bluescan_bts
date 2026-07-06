/* ===== Visit.jsx — 방문 결과 입력 (타이핑 + 실시간 음성 + AI 분석 + 우측 로그 타임라인) ===== */
import React from 'react'
import { MI, VISIT } from '../components.jsx'
import { analyzeBluescan, SYSTEM_PROMPT } from '../agent/bluescanKB.js'
import { todayYMD } from '../dateUtil.js'
const { useState, useEffect, useRef, useCallback } = React

const { Dialog: VDialog, Textarea: VTextarea, Badge: VBadge, Button: VButton } = window.UXDesignSystem_59a60b;

/* 데모용 샘플 고객 대화 (마이크 권한이 없을 때 실시간 받아쓰기를 시연) */
const SAMPLE_DIALOG =
  "안녕하세요, 에스원 김영업입니다. 오늘 건물 관리 현황 여쭤보러 왔습니다. " +
  "네, 반갑습니다. 저희가 지하 서버실하고 지하창고 쪽이 야간에 무인으로 비어 있어서 늘 신경이 쓰였어요. " +
  "아, 그러시군요. 최근에 인근 공장에서 화재도 있었던 걸로 아는데 혹시 들으셨나요. " +
  "네 그 뉴스 봤습니다. 그래서 더 불안하던 참이었어요. 원격으로 상황을 볼 수 있으면 좋겠는데. " +
  "저희 블루스캔이 원격 건물 관리 솔루션이라 서버실 온도하고 출입까지 실시간 관제가 가능합니다. " +
  "비용이 어느 정도 될까요. 예산은 다음 분기에 잡아야 할 것 같은데. " +
  "규모를 보고 견적 정리해서 다음 주에 다시 방문드리겠습니다. 긍정적으로 검토해 주시면 감사하겠습니다. " +
  "네 좋습니다. 견적 받아보고 내부 보고드릴게요. 다음 주에 뵙겠습니다.";

function fmtTime(s) { const m = Math.floor(s / 60), ss = s % 60; return `${m}:${ss < 10 ? '0' : ''}${ss}`; }
function fmtNow() { const n = new Date(); const p = (x) => String(x).padStart(2, '0'); return `${n.getFullYear()}.${p(n.getMonth() + 1)}.${p(n.getDate())} ${p(n.getHours())}:${p(n.getMinutes())}`; }

export function VisitDialog({ item, initial, onSave, onClose }) {
  const [status, setStatus] = useState(initial?.status || 'done');
  const [memo, setMemo] = useState(initial?.memo || '');
  const [transcript, setTranscript] = useState(initial?.transcript || '');
  const [logs, setLogs] = useState(Array.isArray(initial?.logs) ? initial.logs : []); // 우측 타임라인 로그(최신순)
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [recMode, setRecMode] = useState(null); // 'real' | 'sim'
  const [hint, setHint] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(initial?.ai || null);

  const timerRef = useRef(null), recogRef = useRef(null), simRef = useRef(null), baseRef = useRef('');

  const stopAll = useCallback(() => {
    setRecording(false);
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (simRef.current) { clearInterval(simRef.current); simRef.current = null; }
    if (recogRef.current) { try { recogRef.current.stop(); } catch (e) { } recogRef.current = null; }
  }, []);
  useEffect(() => () => stopAll(), [stopAll]);

  const startTimer = () => { setElapsed(0); timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000); };

  const startSim = () => {
    setRecMode('sim'); setRecording(true); setHint('마이크 권한이 없어 샘플 대화로 시연해요.');
    baseRef.current = transcript ? transcript + ' ' : '';
    startTimer();
    const words = SAMPLE_DIALOG.split(' '); let i = 0;
    simRef.current = setInterval(() => {
      i++; setTranscript(baseRef.current + words.slice(0, i).join(' '));
      if (i >= words.length) { clearInterval(simRef.current); simRef.current = null; stopAll(); setHint('샘플 대화 받아쓰기를 마쳤어요. AI 분석을 눌러보세요.'); }
    }, 110);
  };

  const startReal = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { startSim(); return; }
    let rec;
    try { rec = new SR(); } catch (e) { startSim(); return; }
    rec.lang = 'ko-KR'; rec.continuous = true; rec.interimResults = true;
    baseRef.current = transcript ? transcript + ' ' : '';
    rec.onresult = (e) => { let txt = ''; for (let i = 0; i < e.results.length; i++) txt += e.results[i][0].transcript; setTranscript(baseRef.current + txt); };
    rec.onerror = (e) => { stopAll(); if (e.error === 'not-allowed' || e.error === 'service-not-allowed') { setHint('마이크 권한이 거부됐어요. 샘플 대화 시연 또는 직접 입력을 이용해 주세요.'); } };
    rec.onend = () => { if (recogRef.current) setRecording(false); };
    try { rec.start(); recogRef.current = rec; setRecMode('real'); setRecording(true); setHint('말씀하시면 실시간으로 받아써요.'); startTimer(); }
    catch (e) { startSim(); }
  };

  const normalize = (o) => ({
    detected_risks: Array.isArray(o.detected_risks) ? o.detected_risks : [],
    keywords: Array.isArray(o.keywords) ? o.keywords : [],
    recommended_product: o.recommended_product || '-',
    reason: o.reason || '',
    recommended_equipment: Array.isArray(o.recommended_equipment) ? o.recommended_equipment : [],
  });

  const analyze = async () => {
    if (!transcript.trim()) { setHint('먼저 음성을 녹음하거나 대화 내용을 입력해 주세요.'); return; }
    setAnalyzing(true); setHint('');
    try {
      // 1) 백엔드 Anthropic 프록시 (API Key는 서버 .env에만 — 프론트엔드 미노출)
      let res = null;
      try {
        const r = await fetch('/api/analyze-visit', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ transcript }) });
        res = await r.json().catch(() => null);   // 에러 응답(JSON)도 읽어 안내에 사용
      } catch (e) { /* 미들웨어 없음(단일 HTML 등) → 폴백 */ }
      if (res && res.ok && res.data && (res.data.detected_risks || res.data.recommended_product)) {
        setAnalysis(normalize(res.data));
        setHint(`Claude(${res.model || 'claude-opus-4-8'}) 분석 결과예요.`);
        return;
      }
      // 2) Claude Design 환경 LLM(있으면)
      if (window.claude && window.claude.complete) {
        let out = await window.claude.complete(`${SYSTEM_PROMPT}\n\n[고객 인터뷰 내용]\n${transcript}`);
        out = out.replace(/```json|```/g, '').trim();
        const obj = JSON.parse(out.slice(out.indexOf('{'), out.lastIndexOf('}') + 1));
        setAnalysis(obj && (obj.detected_risks || obj.recommended_product) ? normalize(obj) : analyzeBluescan(transcript));
        return;
      }
      // 3) 규칙 엔진 폴백(교육자료 RAG 기준)
      setAnalysis(analyzeBluescan(transcript));
      if (res && res.error === 'no_api_key') setHint('백엔드에 API 키가 없어 규칙 기반으로 분석했어요. (.env에 ANTHROPIC_API_KEY 설정 시 실제 LLM 분석)');
      else if (res && res.error === 'sdk_missing') setHint('SDK 미설치로 규칙 기반으로 분석했어요. (npm install @anthropic-ai/sdk)');
    } catch (e) {
      setAnalysis(analyzeBluescan(transcript));
    } finally { setAnalyzing(false); }
  };

  const applyToMemo = () => {
    if (!analysis) return;
    const parts = [];
    if (analysis.detected_risks?.length) parts.push('· 리스크: ' + analysis.detected_risks.join(', '));
    if (analysis.recommended_product) parts.push('· 추천 상품: ' + analysis.recommended_product);
    if (analysis.recommended_equipment?.length) parts.push('· 추천 장비: ' + analysis.recommended_equipment.join(', '));
    if (analysis.reason) parts.push(analysis.reason);
    setMemo(m => (m ? m + '\n' : '') + parts.join('\n'));
  };

  // 결과 저장 → 로그 1건 적재(최신 위로) + 타임라인 즉시 갱신. 모달은 열린 채 유지(닫기로 종료)
  const handleSave = () => {
    stopAll();
    const text = memo.trim() || `상태 업데이트 · ${VISIT[status]?.label || status}`;
    const entry = { id: Date.now(), status, date: fmtNow(), text };
    const newLogs = [entry, ...logs];
    setLogs(newLogs);
    onSave(item.id, { status, memo: text, transcript, ai: analysis, date: todayYMD(), logs: newLogs });
    setMemo('');               // 다음 메모 기록을 위해 입력창 비움 (타임라인에 적재됨)
    setHint('기록이 우측 타임라인에 적재되었어요.');
  };

  return (
    <VDialog title="방문 결과 입력" subtitle={item.name} closeButton width={1020} onClose={onClose}
      actions={[
        { label: '닫기', variant: 'secondary', onClick: () => { stopAll(); onClose(); } },
        { label: '결과 저장', onClick: handleSave },
      ]}>
      <div className="vdlg-2col">

        {/* ── 좌측: 입력 폼 ── */}
        <div className="vdlg-main">
          {/* 음성 기록 */}
          <div className="field-label"><MI n="graphic_eq" s={18} style={{ verticalAlign: '-4px', marginRight: 4, color: 'var(--accent)' }} />고객 대화 음성 기록</div>
          <div className={'recorder' + (recording ? ' rec-on' : '')}>
            <button className={'rec-btn' + (recording ? ' on' : '')} onClick={recording ? stopAll : startReal}>
              <MI n={recording ? 'stop' : 'mic'} s={24} fill={recording} />
            </button>
            <div className="rec-body">
              {recording
                ? <><div className="rec-wave">{[...Array(11)].map((_, i) => <span key={i} style={{ animationDelay: (i * 0.08) + 's' }} />)}</div>
                  <div className="rec-status"><span className="rec-live">● 녹음 중</span> · {fmtTime(elapsed)} {recMode === 'sim' && <span className="faint">(샘플 시연)</span>}</div></>
                : <><div className="rec-idle">{transcript ? '녹음을 이어가거나 내용을 직접 수정할 수 있어요.' : '마이크를 눌러 고객과의 대화를 실시간으로 기록하세요.'}</div>
                  <button className="rec-sample" onClick={startSim}><MI n="play_circle" s={16} />샘플 대화 시연</button></>}
            </div>
          </div>
          {hint && <div className="rec-hint"><MI n="info" s={15} />{hint}</div>}

          <div className="field-label" style={{ marginTop: 16 }}>받아쓰기 / 직접 입력 <span className="faint" style={{ fontWeight: 400 }}>· 타이핑으로 수정 가능</span></div>
          <VTextarea value={transcript} onChange={e => setTranscript(e.target.value)} rows={4}
            placeholder="음성이 텍스트로 변환되어 표시돼요. 직접 입력하거나 수정할 수도 있어요." />

          <div className="ai-row">
            <VButton variant="line" onClick={analyze} disabled={analyzing} iconLeft={<MI n={analyzing ? 'autorenew' : 'auto_awesome'} s={18} cls={analyzing ? 'spin' : ''} />}>
              {analyzing ? 'AI 분석 중…' : 'AI로 결과 분석'}
            </VButton>
            <span className="faint" style={{ font: 'var(--type-13r)' }}>대화 내용을 분석해 화재·정전·누수·운영 리스크와 추천 상품·장비를 도출해요.</span>
          </div>

          {analysis && (
            <div className="ai-card fadein">
              <div className="ai-card__head">
                <span className="ai-card__badge"><MI n="auto_awesome" s={15} />블루스캔 영업기회 분석</span>
                {(analysis.detected_risks || []).map((r, i) => <VBadge key={i} tone="warning" shape="pill" dot>{r}</VBadge>)}
              </div>
              <div className="ai-rec">
                <span className="ai-rec__label">추천 상품</span>
                <span className="ai-rec__product"><MI n="verified" s={16} />{analysis.recommended_product || '-'}</span>
              </div>
              {analysis.recommended_equipment?.length > 0 && (
                <div className="ai-eq">
                  <span className="ai-eq__label">추천 장비</span>
                  <div className="ai-kws">{analysis.recommended_equipment.map((e, i) => <span key={i} className="kw hot">{e}</span>)}</div>
                </div>)}
              {analysis.keywords?.length > 0 && (
                <div className="ai-kws" style={{ marginTop: 8 }}>{analysis.keywords.map((k, i) => <span key={i} className="kw">{k}</span>)}</div>)}
              {analysis.reason && <p className="ai-card__sum" style={{ marginTop: 10 }}>{analysis.reason}</p>}
              <div className="ai-card__apply">
                <VButton size="sm" variant="line" onClick={applyToMemo} iconLeft={<MI n="note_add" s={16} />}>분석 결과를 메모에 추가</VButton>
              </div>
            </div>)}

          {/* 방문 상태 */}
          <div className="field-label" style={{ marginTop: 20 }}>방문 상태</div>
          <div className="statuspick">
            {Object.entries(VISIT).map(([k, v]) => (
              <button key={k} className={'sp-opt' + (status === k ? ' on' : '')} onClick={() => setStatus(k)}>
                <span className="sp-dot" style={{ background: v.dot }} />{v.label}
              </button>))}
          </div>

          <div className="field-label" style={{ marginTop: 18 }}>메모 <span className="faint" style={{ fontWeight: 400 }}>· 저장하면 우측 타임라인에 적재돼요</span></div>
          <VTextarea value={memo} onChange={e => setMemo(e.target.value)} rows={3} maxLength={500}
            placeholder="방문 결과, 담당자 반응, 후속 조치 등을 입력해 주세요." />
          <div className="faint" style={{ font: 'var(--type-12r)', marginTop: 10 }}>음성 기록·AI 분석·메모가 확정 리스트에 저장되어 관리자 대시보드에서 확인·다운로드돼요.</div>
        </div>

        {/* ── 우측: 메모 기록 타임라인 ── */}
        <aside className="vlog-panel">
          <div className="vlog-head-top">
            <h4 className="vlog-title"><MI n="history" s={18} style={{ verticalAlign: '-4px', marginRight: 4 }} />메모 기록</h4>
            <span className="vlog-count">최근 기록 {logs.length}건</span>
          </div>
          <div className="vlog-timeline">
            {logs.length === 0
              ? <div className="vlog-empty"><MI n="inbox" s={26} /><span>아직 적재된 방문 기록이 없어요.<br />좌측에서 입력 후 <b>결과 저장</b>을 누르면 쌓여요.</span></div>
              : logs.map((log) => {
                const v = VISIT[log.status] || { label: log.status, dot: 'var(--text-tertiary)' };
                return (
                  <div key={log.id} className="vlog-item">
                    <div className="vlog-rail"><span className="vlog-dot" style={{ background: v.dot }} /></div>
                    <div className="vlog-box">
                      <div className="vlog-row">
                        <span className="vlog-tag" style={{ background: v.dot }}>{v.label}</span>
                        <span className="vlog-date">{log.date}</span>
                      </div>
                      <p className="vlog-text">{log.text}</p>
                    </div>
                  </div>
                );
              })}
          </div>
        </aside>

      </div>
    </VDialog>
  );
}
