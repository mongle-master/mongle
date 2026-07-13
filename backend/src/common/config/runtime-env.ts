const DEFAULT_JWT_SECRET = 'mongle-demo-hs256-secret-key-please-change-in-prod';
const DEFAULT_JWT_EXPIRATION = '30d';
const DEFAULT_PORT = 8080;

const PRISMA_MYSQL_QUERY_KEYS = new Set([
  'connection_limit',
  'connect_timeout',
  'pool_timeout',
  'socket',
  'sslaccept',
  'sslcert',
  'sslidentity',
  'sslpassword',
]);

export interface RuntimeEnvironment {
  databaseUrl: string;
  jwtSecret: string;
  jwtExpiration: string;
  port: number;
}

export function jdbcMysqlToPrismaUrl(jdbcUrl: string, username: string, password: string): string {
  if (!jdbcUrl.startsWith('jdbc:mysql://')) {
    throw new Error('SPRING_DATASOURCE_URL은 jdbc:mysql:// 형식이어야 합니다.');
  }

  const url = new URL(jdbcUrl.slice('jdbc:'.length));
  url.username = username;
  url.password = password;

  for (const key of [...url.searchParams.keys()]) {
    if (!PRISMA_MYSQL_QUERY_KEYS.has(key)) url.searchParams.delete(key);
  }

  return url.toString();
}

export function configureRuntimeEnvironment(env: NodeJS.ProcessEnv = process.env): RuntimeEnvironment {
  env.TZ ??= 'Asia/Seoul';

  if (!env.DATABASE_URL) {
    const jdbcUrl = env.SPRING_DATASOURCE_URL;
    const username = env.SPRING_DATASOURCE_USERNAME;
    const password = env.SPRING_DATASOURCE_PASSWORD;
    if (!jdbcUrl || username === undefined || password === undefined) {
      throw new Error('DATABASE_URL 또는 SPRING_DATASOURCE_URL/USERNAME/PASSWORD를 모두 설정해야 합니다.');
    }
    env.DATABASE_URL = jdbcMysqlToPrismaUrl(jdbcUrl, username, password);
  }

  if (!env.DATABASE_URL.startsWith('mysql://')) {
    throw new Error('Prisma DATABASE_URL은 mysql:// 형식이어야 합니다.');
  }

  const isProduction = env.NODE_ENV === 'production' || env.SPRING_PROFILES_ACTIVE === 'prod';
  if (!env.MONGLE_JWT_SECRET) {
    if (isProduction) throw new Error('프로덕션에서는 MONGLE_JWT_SECRET이 필수입니다.');
    env.MONGLE_JWT_SECRET = DEFAULT_JWT_SECRET;
  }
  if (Buffer.byteLength(env.MONGLE_JWT_SECRET, 'utf8') < 32) {
    throw new Error('MONGLE_JWT_SECRET은 32바이트 이상이어야 합니다.');
  }

  env.MONGLE_JWT_EXPIRATION ||= DEFAULT_JWT_EXPIRATION;
  const port = Number(env.SERVER_PORT ?? env.PORT ?? DEFAULT_PORT);
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error('SERVER_PORT 또는 PORT는 유효한 포트 번호여야 합니다.');
  }

  return {
    databaseUrl: env.DATABASE_URL,
    jwtSecret: env.MONGLE_JWT_SECRET,
    jwtExpiration: env.MONGLE_JWT_EXPIRATION,
    port,
  };
}
