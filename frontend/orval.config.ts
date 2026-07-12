import { defineConfig } from 'orval'

const openApiUrl = process.env.GITHUB_ACTIONS
  ? 'http://localhost:8080/v3/api-docs'
  : 'https://macmini.tailc4f400.ts.net/v3/api-docs'

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
