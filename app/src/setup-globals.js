/* 전역 노출 (단일 HTML 빌드 — DS 번들이 전역 React 사용) */
import React from 'react'
import ReactDOM from 'react-dom/client'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.heat'

window.React = React
window.ReactDOM = ReactDOM
window.L = L
