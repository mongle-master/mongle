import { existsSync } from 'node:fs'
import { loadEnvFile } from 'node:process'
import { defineConfig } from 'orval'

for (const envFile of ['.env.local', '.env']) {
  if (existsSync(envFile)) loadEnvFile(envFile)
}

const apiUrl = process.env.VITE_API_URL

if (!apiUrl) {
  throw new Error('VITE_API_URL is required to generate API')
}

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
