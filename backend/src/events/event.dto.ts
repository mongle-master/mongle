import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ChipRef, PersonRef } from '../shared/api.dto';

export class EventRequest {
  @ApiPropertyOptional({
    description: "기록 제목. 미입력하면 조회 시 '대표 인물 · 카테고리'로 자동 제목을 만든다.",
    example: '한강 산책',
    nullable: true,
    type: String,
  })
  title?: string | null;

  @ApiPropertyOptional({
    description: '메모(함께한 이야기) 자유 서술.',
    example: '오랜만에 만나 한강을 걸었다',
    nullable: true,
    type: String,
  })
  memo?: string | null;

  @ApiPropertyOptional({
    description: '기록한 일이 일어난 날짜. 미지정 시 오늘로 채운다. 미래일 수 없다.',
    example: '2026-07-05',
    nullable: true,
    type: String,
    format: 'date',
  })
  occurredDate?: string | null;

  @ApiPropertyOptional({ description: '기록한 일이 일어난 시각.', example: '19:30:00', type: String })
  occurredTime?: string | null;

  @ApiPropertyOptional({
    description: '카테고리 칩 id. 미지정 시 기본 카테고리(만남)로 채운다.',
    example: 1,
    nullable: true,
    type: 'integer',
    format: 'int64',
  })
  categoryChipId?: number | null;

  @ApiPropertyOptional({
    description: '날씨 칩 id(선택).',
    example: 12,
    nullable: true,
    type: 'integer',
    format: 'int64',
  })
  weatherChipId?: number | null;

  @ApiProperty({
    description: '감정 칩 id 목록. 선택 개수 상한이 있다.',
    type: 'array',
    items: { type: 'integer', format: 'int64' },
    example: [3, 4],
  })
  emotionChipIds!: number[];

  @ApiProperty({
    description: '함께한 사람 id 목록(최소 1명). 첫 번째가 대표 인물이 된다.',
    type: 'array',
    items: { type: 'integer', format: 'int64' },
    example: [7],
  })
  personIds!: number[];

  @ApiProperty({
    description: '첨부 사진 URL 목록(이미지 업로드 API 응답의 url).',
    type: [String],
    example: ['/images/a1b2.jpg'],
  })
  photoUrls!: string[];
}

export class EventResponse {
  @ApiProperty({ description: '기록 id.', example: 21, type: 'integer', format: 'int64' })
  id!: number;

  @ApiProperty({
    description: "표시용 최종 제목. 사용자가 입력했으면 그 값, 아니면 '대표 인물 · 카테고리' 자동 제목.",
    example: '김하늘 · 만남',
  })
  title!: string;

  @ApiPropertyOptional({
    description: '메모(함께한 이야기).',
    example: '오랜만에 얼굴 보고 한강에서 두 시간 걸었다',
    nullable: true,
    type: String,
  })
  memo?: string | null;

  @ApiProperty({ description: '일어난 날짜.', example: '2026-07-05', type: String, format: 'date' })
  occurredDate!: string;

  @ApiPropertyOptional({ description: '일어난 시각(없을 수 있음).', example: '19:30:00', type: String })
  occurredTime?: string | null;

  @ApiPropertyOptional({ description: '카테고리 칩 요약 참조.', type: () => ChipRef })
  category?: ChipRef | null;

  @ApiPropertyOptional({ description: '날씨 칩 요약 참조(없을 수 있음).', type: () => ChipRef })
  weather?: ChipRef | null;

  @ApiProperty({ description: '감정 칩 요약 참조 목록.', type: () => [ChipRef] })
  emotions!: ChipRef[];

  @ApiProperty({ description: '함께한 사람 요약 참조 목록. 첫 번째가 대표 인물.', type: () => [PersonRef] })
  persons!: PersonRef[];

  @ApiProperty({ description: '첨부 사진 URL 목록.', type: [String], example: ['/images/a1b2.jpg'] })
  photoUrls!: string[];

  @ApiPropertyOptional({
    description: '기록 생성 시각.',
    nullable: true,
    type: String,
    format: 'date-time',
  })
  createdAt?: string | null;
}
