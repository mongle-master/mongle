import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { configureRuntimeEnvironment } from './common/config/runtime-env';
import { ApiExceptionFilter } from './common/exception/api-exception.filter';

async function bootstrap(): Promise<void> {
  const runtime = configureRuntimeEnvironment();
  const app = await NestFactory.create(AppModule);

  app.enableShutdownHooks();
  app.enableCors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: false,
    maxAge: 3600,
  });
  app.useGlobalFilters(new ApiExceptionFilter());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('관계도감 API')
    .setDescription(
      '관계도감 — 사람 중심 관계 기록 서비스의 백엔드 API.\n\n' +
        '사람(인물)·기록·칩(카테고리·감정·날씨·관계태그)을 중심으로 관계 지도, 활동 흐름, 나의 통합 연대기(전체 타임라인), 1년 전 오늘 회고를 제공한다.\n\n' +
        '**인증**: `POST /api/v1/auth/token` 으로 발급받은 JWT 를 우측 상단 Authorize 에 넣으면 이후 모든 API 에 `Authorization: Bearer {token}` 이 붙는다.',
    )
    .setVersion('v1')
    .addTag('홈', "홈 대시보드 — 관계 지도와 '1년 전 오늘' 회고.")
    .addTag('시드', '현재 사용자의 데모 데이터를 준비한다.')
    .addTag('사용자', '인증된 사용자를 관리한다.')
    .addTag(
      '칩',
      '칩(카테고리·감정·날씨·관계태그) 개인화 — 공통 칩 위에 개인 칩을 만들고, 개인 칩만 이름변경·삭제한다.',
    )
    .addTag('기록', '기록(이벤트) 등록·조회·수정 — 함께한 사람·카테고리·감정·날씨·사진으로 하나의 기록을 남긴다.')
    .addTag('이미지', 'Vercel Blob 직접 업로드 권한을 확인한다.')
    .addTag('타임라인', '사람별 피드·활동 흐름과 나의 통합 연대기(전체 타임라인). 필터는 미지정 시 전체.')
    .addTag('인증', '브라우저 UUID로 JWT를 발급한다.')
    .addTag('사람', '인물(관계도감) 등록·조회·수정 — 관계태그·취향·만남 이력을 담고, 즐겨찾기·파생 스탯을 제공한다.')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: '`POST /api/v1/auth/token` 응답의 token 값. `Bearer` 접두어 없이 토큰만 입력한다.',
      },
      'bearerAuth',
    )
    .addSecurityRequirements('bearerAuth')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig, {
    operationIdFactory: (_controllerKey, methodKey) => methodKey,
  });
  const issueTokenOperation = document.paths?.['/api/v1/auth/token']?.post;
  if (issueTokenOperation) issueTokenOperation.security = [];
  const birthdaySchema = document.components?.schemas?.Birthday;
  if (birthdaySchema && !('$ref' in birthdaySchema)) birthdaySchema.nullable = true;

  SwaggerModule.setup('swagger-ui', app, document, {
    jsonDocumentUrl: '/v3/api-docs',
    swaggerOptions: { persistAuthorization: true },
  });

  await app.listen(runtime.port, '0.0.0.0');
}

void bootstrap();
