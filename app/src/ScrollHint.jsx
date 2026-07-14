/* ===== ScrollHint.jsx — 시니어 스크롤 어포던스 =====
 * 화면 아래에 콘텐츠가 더 있는데 경계에 딱 떨어져 보이면 시니어는 스크롤을 인지하지 못한다(가이드 2.5).
 * 하단에 "아래로 더 있어요 ▼" 힌트를 띄워 추가 콘텐츠 존재를 시각적으로 안내하고,
 * 누르면 한 화면 정도 부드럽게 내려간다. 바닥 근처면 자동으로 사라진다.
 */
import React, { useEffect, useState } from 'react'
import { MI } from './components.jsx'

export function ScrollHint() {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const check = () => {
      // 모달·드로어·사이드패널이 열려 있으면 고정 힌트를 숨긴다.
      // (window 스크롤 기준 힌트가 팝업 위에 떠서 하단 액션 버튼을 가리던 문제 방지)
      if (document.querySelector('.home2-scrim, .dmodal__scrim, .side-backdrop')) { setShow(false); return }
      const el = document.documentElement
      const more = el.scrollHeight - window.innerHeight - window.scrollY
      setShow(more > 140)
    }
    check()
    window.addEventListener('scroll', check, { passive: true })
    window.addEventListener('resize', check)
    const t = setInterval(check, 800) // 탭 전환 등 콘텐츠 높이 변화 대응
    return () => {
      window.removeEventListener('scroll', check)
      window.removeEventListener('resize', check)
      clearInterval(t)
    }
  }, [])
  if (!show) return null
  return (
    <button className="scroll-hint" onClick={() => window.scrollBy({ top: Math.round(window.innerHeight * 0.7), behavior: 'smooth' })}>
      아래로 더 있어요 <MI n="keyboard_double_arrow_down" s={18} />
    </button>
  )
}
