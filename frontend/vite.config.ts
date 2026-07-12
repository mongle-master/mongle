import { defineConfig } from 'vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import svgr from 'vite-plugin-svgr'
import { codeInspectorPlugin } from 'code-inspector-plugin'

// dev 프록시가 붙을 백엔드. 기본은 로컬 Docker 백엔드이고,
// 다른 서버로 붙을 때만 BACKEND_URL을 지정한다.
// 프록시(서버 간 호출)를 쓰는 이유: 브라우저 직접 호출과 달리 백엔드 CORS 배포 상태와 무관하게 동작한다.
const backendTarget = process.env.BACKEND_URL ?? 'http://localhost:18080'
const devPort = Number(process.env.PORT ?? 3000)

const config = defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    port: devPort,
    proxy: {
      '/api': {
        target: backendTarget,
        changeOrigin: true,
      },
    },
  },
  plugins: [
    codeInspectorPlugin({
      bundler: 'vite',
    }),
    tailwindcss(),
    svgr(),
    viteReact(),
  ],
})
export default config
