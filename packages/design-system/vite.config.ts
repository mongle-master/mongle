import { defineConfig } from 'vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Storybook(dev/build)이 이 설정을 자동으로 머지한다.
// tsconfigPaths로 @/ alias를, tailwindcss 플러그인으로 globals.css의
// Tailwind v4(@import 'tailwindcss', @theme inline)를 처리한다.
const config = defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [tailwindcss(), viteReact()],
})
export default config
