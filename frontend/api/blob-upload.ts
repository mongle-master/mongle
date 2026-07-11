import { handleUpload } from '@vercel/blob/client'
import type { HandleUploadBody } from '@vercel/blob/client'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { env } from 'node:process'

const MAX_IMAGE_BYTES = 10 * 1024 * 1024
const ALLOWED_CONTENT_TYPES = ['image/jpeg', 'image/png', 'image/webp']

class UploadAuthorizationError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message)
  }
}

type VercelRequest = IncomingMessage & { body: unknown }
type VercelResponse = ServerResponse & {
  status: (statusCode: number) => VercelResponse
  json: (body: unknown) => VercelResponse
}

function backendApiUrl(path: string): URL {
  const apiBase = env.VITE_API_URL ?? 'http://localhost:18080/api'
  return new URL(path, `${apiBase.replace(/\/$/, '')}/`)
}

async function handler(
  request: VercelRequest,
  response: VercelResponse,
): Promise<void> {
  if (request.method !== 'POST') {
    response.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const json = await handleUpload({
      request,
      body: request.body as HandleUploadBody,
      onBeforeGenerateToken: async (pathname) => {
        const authorization = request.headers.authorization
        if (!authorization || Array.isArray(authorization)) {
          throw new UploadAuthorizationError(401, '로그인이 필요해요.')
        }
        if (!pathname.startsWith('images/')) {
          throw new UploadAuthorizationError(400, '잘못된 이미지 경로예요.')
        }

        const permissionResponse = await fetch(
          backendApiUrl('v1/images/upload-permission'),
          {
            method: 'POST',
            headers: { Authorization: authorization },
          },
        )
        if (!permissionResponse.ok) {
          throw new UploadAuthorizationError(
            permissionResponse.status === 401 ? 401 : 502,
            permissionResponse.status === 401
              ? '로그인이 필요해요.'
              : '업로드 권한을 확인하지 못했어요.',
          )
        }

        return {
          allowedContentTypes: ALLOWED_CONTENT_TYPES,
          maximumSizeInBytes: MAX_IMAGE_BYTES,
          addRandomSuffix: true,
          cacheControlMaxAge: 2678400,
        }
      },
    })
    response.status(200).json(json)
  } catch (error) {
    const status =
      error instanceof UploadAuthorizationError ? error.status : 400
    const message =
      error instanceof Error ? error.message : '이미지를 올리지 못했어요.'
    response.status(status).json({ error: message })
  }
}

export default handler
