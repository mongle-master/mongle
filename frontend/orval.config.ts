import { defineConfig } from 'orval'

const openApiUrl =
  process.env.OPENAPI_URL ?? 'http://localhost:8080/v3/api-docs'

export default defineConfig({
  mongleApi: {
    input: openApiUrl,
    output: {
      target: './src/apis/generated/mongle-api.ts',
      schemas: './src/apis/generated/models',
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
