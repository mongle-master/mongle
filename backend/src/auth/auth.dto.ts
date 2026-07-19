import { ApiProperty } from '@nestjs/swagger';

export class TokenRequest {
  @ApiProperty({
    description: '브라우저가 최초 접속 때 생성해 보관하는 사용자 UUID.',
    example: '8e0ca8f5-a713-4a90-9df1-15f0be0d843c',
    format: 'uuid',
  })
  userId!: string;

  @ApiProperty({
    description: '표시 이름. 처음 보는 UUID의 사용자를 만들 때 저장한다.',
    example: '정순원',
  })
  username!: string;
}

export class TokenResponse {
  @ApiProperty({
    description: '인증에 사용할 JWT. `Authorization: Bearer {token}` 형태로 보낸다.',
    example: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.abc',
  })
  token!: string;

  @ApiProperty({
    description: '발급 대상 사용자 id.',
    format: 'uuid',
  })
  userId!: string;

  @ApiProperty({ description: '로그인 이름.', example: '정순원' })
  username!: string;

  @ApiProperty({ description: '최초 프로필 설정 완료 여부.', example: false })
  profileSetupCompleted!: boolean;
}
