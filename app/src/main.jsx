import React from 'react'
import ReactDOM from 'react-dom/client'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.heat'

// The S-1 design-system bundle (loaded as a classic script in index.html) is
// compiled to classic React.createElement calls and reads `React` from the
// global scope. Expose React/ReactDOM/Leaflet on window before first render.
window.React = React
window.ReactDOM = ReactDOM
window.L = L

import './app.css'
import './vendor/tokens/handoff-overrides.css'   // Claude Design 핸드오프 토큰(app.css 이후 로드)
import App from './App.jsx'
import { injectBranchManagers } from './branchManagers.js'
import { injectDemoConsultants } from './demoConsultants.js'
import { applyDemoLoginOverride } from './demoLoginOverride.js'
import { initTapRipple } from './tapRipple.js'

// 지사장(관리자)·데모 컨설턴트 계정을 명단에 주입 — 첫 렌더 전에 실행 (appdata.js 로드 이후)
injectBranchManagers()
injectDemoConsultants()
applyDemoLoginOverride()   // 로그인 데모 계정 사번 8자리로 정리
initTapRipple()            // 시니어 친화 클릭 피드백(탭 리플) 전역 활성화

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
