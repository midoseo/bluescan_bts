/* ===== Login.jsx — 사번/비밀번호 로그인 (역할 선택 + 시연용 추천 계정) ===== */
import React from 'react'
import { MI, BrandMark, BltaMark } from '../components.jsx'
const { useState } = React

const { TextField: LTextField, Button: LButton } = window.UXDesignSystem_59a60b

export function Login({ onLogin }) {
  const accounts = window.APP_ACCOUNTS || []
  const demo = window.APP_DEMO || {}
  const hintPw = (window.APP_LOGIN_HINT && window.APP_LOGIN_HINT.password) || '1234'

  const [role, setRole] = useState('consultant') // 선택: consultant | admin
  const [empno, setEmpno] = useState('')
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')

  const rec = role === 'admin' ? demo.admin : demo.consultant

  // 사번 앞자리 0이 떨어져 입력돼도 매칭되도록 정규화 (예: 951062813 ↔ 0951062813)
  const normNo = (s) => String(s).trim().replace(/^0+/, '')

  const submit = (e) => {
    e && e.preventDefault && e.preventDefault()
    const id = empno.trim()
    if (!id) { setErr('사번을 입력해 주세요.'); return }
    const acc = accounts.find(a => String(a.empno) === id)
      || accounts.find(a => normNo(a.empno) === normNo(id))
    if (!acc) { setErr('등록되지 않은 사번이에요.'); return }
    if (pw !== hintPw) { setErr('비밀번호가 일치하지 않아요.'); return }
    onLogin(acc)
  }

  const loginWith = (id) => {
    const acc = accounts.find(a => String(a.empno) === String(id))
      || accounts.find(a => normNo(a.empno) === normNo(id))
    if (acc) { setErr(''); onLogin(acc) }
  }

  return (
    <div className="login2">
      {/* 좌측 — 브랜드 + 레이더 (디자인 리뉴얼) */}
      <div className="login2__left">
        <div className="login2__brand">
          <span className="login2__ci"><BrandMark height={26} /></span>
          <div>
            <BltaMark height={48} className="login2__blta" />
          </div>
        </div>
        <div className="login2__radar" aria-hidden="true">
          <span className="r-ring r1" /><span className="r-ring r2" /><span className="r-ring r3" />
          <span className="r-sweep" />
          <span className="r-core" />
          <span className="r-dot r-dot--blue" /><span className="r-dot r-dot--green" /><span className="r-dot r-dot--orange" />
        </div>
        <div className="login2__leftfoot">오늘 방문할 곳은, 이미 정해져 있습니다.</div>
      </div>

      {/* 우측 — 로그인 폼 */}
      <div className="login2__right">
        <div className="login2__panel">
          <h1 className="login2__h">로그인</h1>
          <p className="login2__hsub">사번과 비밀번호로 접속하세요</p>

          <div className="login-roleseg" role="radiogroup" aria-label="역할 선택">
            <button type="button" className={role === 'consultant' ? 'on' : ''} aria-pressed={role === 'consultant'} onClick={() => { setRole('consultant'); setErr(''); }}>
              <MI n="person" s={18} />영업 컨설턴트
            </button>
            <button type="button" className={role === 'admin' ? 'on' : ''} aria-pressed={role === 'admin'} onClick={() => { setRole('admin'); setErr(''); }}>
              <MI n="shield_person" s={18} />관리자
            </button>
          </div>

          <form className="login-form" onSubmit={submit}>
            <label className="field-label">사번</label>
            <LTextField value={empno} onChange={e => setEmpno(e.target.value)} placeholder="사번을 입력하세요"
              iconLeft={<MI n="badge" s={18} />} autoFocus />
            <label className="field-label" style={{ marginTop: 12 }}>비밀번호</label>
            <LTextField type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="비밀번호"
              iconLeft={<MI n="lock" s={18} />} />
            {err && <div className="login-err"><MI n="error" s={16} />{err}</div>}
            <LButton type="submit" block size="lg" onClick={submit} iconLeft={<MI n="login" s={22} />}
              style={{ marginTop: 16 }}>로그인</LButton>
          </form>

          {rec && (
            <div className="login-rec">
              <div className="login-rec__head"><MI n="campaign" s={16} />발표·시연용 추천 계정</div>
              <div className="login-rec__role">
                {role === 'admin'
                  ? <>관리자 · 전체 지사 조회</>
                  : <>영업 컨설턴트 · {rec.branch}</>}
              </div>
              <div className="login-rec__grid">
                <div className="login-rec__cell"><span className="k">사번</span><b className="tnum">{rec.empno}</b></div>
                <div className="login-rec__cell"><span className="k">비밀번호</span><b className="tnum">{hintPw}</b></div>
              </div>
              <LButton block onClick={() => loginWith(rec.empno)} iconLeft={<MI n="login" s={18} />}>이 계정으로 바로 로그인</LButton>
            </div>
          )}

          <div className="login2__note">
            영업 컨설턴트는 <b>본인 지사</b>, 관리자는 <b>전체</b>를 조회합니다. 데이터·계정은 비식별 실습용입니다.
          </div>
        </div>
      </div>
    </div>
  )
}
