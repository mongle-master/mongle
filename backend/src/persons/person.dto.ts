import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ChipRef } from '../shared/api.dto';

export enum PersonGender {
  FEMALE = 'FEMALE',
  MALE = 'MALE',
}

export enum PersonSort {
  NAME = 'NAME',
  RECENT = 'RECENT',
}

export class Birthday {
  @ApiPropertyOptional({
    description: '연도(생략 가능).',
    example: 1995,
    nullable: true,
    type: 'integer',
    format: 'int32',
  })
  year?: number | null;

  @ApiPropertyOptional({
    description: '월(1~12).',
    example: 4,
    nullable: true,
    type: 'integer',
    format: 'int32',
  })
  month?: number | null;

  @ApiPropertyOptional({
    description: '일(1~31).',
    example: 20,
    nullable: true,
    type: 'integer',
    format: 'int32',
  })
  day?: number | null;
}

export class PersonRequest {
  @ApiProperty({ description: '인물 이름(필수).', example: '김하늘' })
  name!: string;

  @ApiPropertyOptional({
    description: '생일(선택). 월·일은 함께, 연도는 생략 가능.',
    type: () => Birthday,
  })
  birthday?: Birthday | null;

  @ApiPropertyOptional({
    description: '처음 만난 날(선택). 미래일 수 없다.',
    example: '2020-03-15',
    nullable: true,
    type: String,
    format: 'date',
  })
  firstMetDate?: string | null;

  @ApiPropertyOptional({
    description: '마지막 만난 날(선택). 처음 만난 날 이후여야 한다.',
    example: '2026-06-30',
    nullable: true,
    type: String,
    format: 'date',
  })
  lastMetDate?: string | null;

  @ApiPropertyOptional({
    description: '프로필 이미지 URL(이미지 업로드 API 응답의 url).',
    example: '/images/p7.jpg',
    nullable: true,
    type: String,
  })
  profileImageUrl?: string | null;

  @ApiPropertyOptional({
    description: '기본 아바타 선택용 성별 힌트(선택).',
    enum: PersonGender,
    example: PersonGender.FEMALE,
    nullable: true,
  })
  gender?: PersonGender | null;

  @ApiPropertyOptional({
    description: '관계 유형 자유 서술(선택).',
    example: '대학 동기',
    nullable: true,
    type: String,
  })
  relationType?: string | null;

  @ApiProperty({
    description: '관계태그 칩 id 목록. 선택 개수 상한이 있다.',
    type: 'array',
    items: { type: 'integer', format: 'int64' },
    example: [11, 12],
  })
  relationTagChipIds!: number[];

  @ApiProperty({ description: '좋아하는 것(선택). 취향 목록.', type: [String], example: ['커피', '러닝'] })
  likes!: string[];

  @ApiProperty({ description: '주의할 것(선택). 취향 목록.', type: [String], example: ['견과류 알레르기'] })
  cautions!: string[];

  @ApiProperty({ description: '즐겨찾기 여부.', example: false })
  favorite!: boolean;
}

export class PersonResponse {
  @ApiProperty({ description: '인물 id.', example: 7, type: 'integer', format: 'int64' })
  id!: number;

  @ApiProperty({ description: '인물 이름.', example: '김하늘' })
  name!: string;

  @ApiPropertyOptional({ type: () => Birthday })
  birthday?: Birthday | null;

  @ApiPropertyOptional({
    description: '처음 만난 날(없을 수 있음).',
    example: '2020-03-15',
    nullable: true,
    type: String,
    format: 'date',
  })
  firstMetDate?: string | null;

  @ApiPropertyOptional({
    description: '마지막 만난 날(없을 수 있음).',
    example: '2026-06-30',
    nullable: true,
    type: String,
    format: 'date',
  })
  lastMetDate?: string | null;

  @ApiPropertyOptional({
    description: '프로필 이미지 URL(없을 수 있음).',
    example: '/images/p7.jpg',
    nullable: true,
    type: String,
  })
  profileImageUrl?: string | null;

  @ApiPropertyOptional({
    description: '기본 아바타 선택용 성별 힌트(없을 수 있음).',
    enum: PersonGender,
    nullable: true,
  })
  gender?: PersonGender | null;

  @ApiPropertyOptional({
    description: '관계 유형(없을 수 있음).',
    example: '대학 동기',
    nullable: true,
    type: String,
  })
  relationType?: string | null;

  @ApiProperty({ description: '관계태그 칩 요약 참조 목록.', type: () => [ChipRef] })
  relationTags!: ChipRef[];

  @ApiProperty({ description: '좋아하는 것 목록.', type: [String], example: ['커피', '러닝'] })
  likes!: string[];

  @ApiProperty({ description: '주의할 것 목록.', type: [String], example: ['견과류 알레르기'] })
  cautions!: string[];

  @ApiProperty({ description: '즐겨찾기 여부.', example: true })
  favorite!: boolean;

  @ApiPropertyOptional({
    description: '등록 시각.',
    nullable: true,
    type: String,
    format: 'date-time',
  })
  createdAt?: string | null;
}

export class PersonStats {
  @ApiProperty({
    description: '만남 횟수(만남 카테고리 기록 수).',
    example: 12,
    type: 'integer',
    format: 'int32',
  })
  meetCount!: number;

  @ApiProperty({ description: '전체 기록 수.', example: 20, type: 'integer', format: 'int32' })
  recordCount!: number;

  @ApiPropertyOptional({
    description: '처음 만난 날로부터 경과일. 처음 만난 날이 없으면 null.',
    example: 2305,
    nullable: true,
    type: 'integer',
    format: 'int32',
  })
  daysSinceFirstMet?: number | null;

  @ApiPropertyOptional({
    description: '알고 지낸 기간 표시 문자열. 처음 만난 날이 없으면 null.',
    example: '6년',
    nullable: true,
    type: String,
  })
  acquaintancePeriod?: string | null;

  @ApiPropertyOptional({
    description: '마지막 만남 상대 시간 표시 문자열. 근거가 없으면 null.',
    example: '6일 전',
    nullable: true,
    type: String,
  })
  lastMetRelative?: string | null;
}

export class PersonDetailResponse extends PersonResponse {
  @ApiProperty({ description: '파생 스탯 섹션.', type: () => PersonStats })
  stats!: PersonStats;
}
