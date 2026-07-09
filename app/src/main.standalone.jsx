/* main.standalone.jsx — 단일 HTML 빌드 진입점 (모든 의존성을 모듈 그래프로 인라인) */
import './setup-globals.js'        // window.React / ReactDOM / L
import './vendor/ds-bundle.js'     // window.UXDesignSystem_59a60b (렌더 시 전역 React 사용)
import './vendor/ds-tokens.css'    // DS CSS 변수 (+ Pretendard CDN)
import './appData.generated.js'    // window.APPDATA / APP_ACCOUNTS / APP_DEMO (침수 GeoJSON 인라인)
import './app.css'
import './vendor/tokens/handoff-overrides.css'   // Claude Design 핸드오프 토큰(app.css 이후 로드)

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { injectBranchManagers } from './branchManagers.js'
import { injectDemoConsultants } from './demoConsultants.js'
import { applyDemoLoginOverride } from './demoLoginOverride.js'
import { initTapRipple } from './tapRipple.js'

// 지사장(관리자)·데모 컨설턴트 계정 주입 — appData 로드 이후, 첫 렌더 전
injectBranchManagers()
injectDemoConsultants()
applyDemoLoginOverride()   // 로그인 데모 계정 사번 8자리로 정리
initTapRipple()            // 시니어 친화 클릭 피드백(탭 리플) 전역 활성화

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
