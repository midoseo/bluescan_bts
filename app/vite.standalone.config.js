import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// 단일 HTML 빌드 — 모든 JS/CSS/데이터/이미지를 한 파일에 인라인.
// 폰트(Pretendard)·지도타일(CARTO)·Material Symbols는 CDN(온라인) 사용.
export default defineConfig({
  base: './',
  plugins: [react(), viteSingleFile()],
  build: {
    outDir: 'standalone-dist',
    rollupOptions: { input: 'standalone.html' },
    assetsInlineLimit: 100000000,
    cssCodeSplit: false,
    chunkSizeWarningLimit: 100000,
  },
})
