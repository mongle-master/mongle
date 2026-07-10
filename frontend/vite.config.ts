import { defineConfig } from 'vitest/config'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import svgr from 'vite-plugin-svgr'
import { codeInspectorPlugin } from 'code-inspector-plugin'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
import { playwright } from '@vitest/browser-playwright'

// dev 프록시가 붙을 백엔드. 기본은 로컬 Docker 백엔드이고,
// 다른 서버로 붙을 때만 BACKEND_URL을 지정한다.
// 프록시(서버 간 호출)를 쓰는 이유: 브라우저 직접 호출과 달리 백엔드 CORS 배포 상태와 무관하게 동작한다.
const backendTarget = process.env.BACKEND_URL ?? 'http://localhost:18080'

const dirname =
  typeof __dirname !== 'undefined'
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url))

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
const config = defineConfig({
  // FE_DUMMY_DATA(더미 데이터 모드, src/lib/dummy-mode.ts)를 클라이언트에 노출하기 위한 프리픽스.
  envPrefix: ['VITE_', 'FE_'],
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    proxy: {
      '/api': {
        target: backendTarget,
        changeOrigin: true,
      },
      '/images': {
        target: backendTarget,
        changeOrigin: true,
      },
    },
  },
  plugins: [
    codeInspectorPlugin({
      bundler: 'vite',
    }),
    devtools(),
    tailwindcss(),
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    svgr(),
    viteReact(),
  ],
  test: {
    projects: [
      {
        extends: true,
        test: {
          globals: true,
          environment: 'jsdom',
          setupFiles: ['./src/test-setup.ts'],
        },
      },
      {
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({
            configDir: path.join(dirname, '.storybook'),
          }),
        ],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [
              {
                browser: 'chromium',
              },
            ],
          },
        },
      },
    ],
  },
})
export default config
