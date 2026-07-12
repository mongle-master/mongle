import { defineConfig } from 'orval'

const apiUrl = process.env.VITE_API_URL ?? 'http://localhost:8080/api'
const openApiUrl = new URL('/v3/api-docs', apiUrl).toString()

export default defineConfig({
  mongleApi: {
    input: openApiUrl,
    output: {
      mode: 'split',
      target: './src/apis/generated/mongle-api.ts',
      client: 'axios-functions',
      prettier: true,
      clean: true,
      override: {
        mutator: {
          path: './src/apis/http.ts',
          name: 'kyAxiosAdapter',
        },
      },
    },
  },
})
