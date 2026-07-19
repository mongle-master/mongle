import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum UserGender {
  FEMALE = 'FEMALE',
  MALE = 'MALE',
}

export class UserProfileRequest {
  @ApiPropertyOptional({
    description: '기본 아바타 경로 또는 업로드 이미지 URL.',
    nullable: true,
    type: String,
  })
  profileImageUrl?: string | null;

  @ApiPropertyOptional({
    description: '기본 아바타 분류에 사용한 성별.',
    enum: UserGender,
    nullable: true,
  })
  gender?: UserGender | null;
}

export class UserProfileResponse {
  @ApiProperty()
  username!: string;

  @ApiPropertyOptional({ nullable: true, type: String })
  profileImageUrl?: string | null;

  @ApiPropertyOptional({ enum: UserGender, nullable: true })
  gender?: UserGender | null;

  @ApiProperty()
  profileSetupCompleted!: boolean;
}
