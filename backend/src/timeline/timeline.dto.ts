import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ChipRef } from '../shared/api.dto';

export enum ActivityLane {
  MEETING = 'MEETING',
  CONTACT = 'CONTACT',
  MEMORY = 'MEMORY',
}

export class ActivityFlowLane {
  @ApiProperty({ description: '활동 흐름 레인 종류. MEETING=만남, CONTACT=연락, MEMORY=추억.', enum: ActivityLane })
  lane!: ActivityLane;

  @ApiProperty({ description: '레인에 대응하는 카테고리 라벨.', example: '만남' })
  categoryLabel!: string;

  @ApiProperty({
    description: 'months 와 같은 인덱스의 월별 기록 유무.',
    type: [Boolean],
    example: [false, true, true],
  })
  present!: boolean[];
}

export class ActivityFlowResponse {
  @ApiProperty({
    description: '월 라벨 목록(과거→현재 순). 각 레인 present 와 인덱스가 대응한다.',
    type: [String],
    example: ['2026-02', '2026-03', '2026-04'],
  })
  months!: string[];

  @ApiProperty({ description: '레인별 월간 유무 목록.', type: () => [ActivityFlowLane] })
  lanes!: ActivityFlowLane[];

  @ApiProperty({
    description: "윈도 밖 포함 전 기간에 세 레인 기록이 하나라도 있는지 여부. 차트 감춤과 '조용했어요' 판정에 쓴다.",
    example: true,
  })
  hasAnyActivity!: boolean;
}

export class TimelinePerson {
  @ApiProperty({ description: '인물 id.', example: 7, type: 'integer', format: 'int64' })
  id!: number;

  @ApiProperty({ description: '인물 이름.', example: '김하늘' })
  name!: string;

  @ApiPropertyOptional({
    description: '프로필 이미지 URL(없을 수 있음).',
    example: '/images/p7.jpg',
    nullable: true,
    type: String,
  })
  profileImageUrl?: string | null;

  @ApiProperty({ description: '즐겨찾기 여부.', example: true })
  favorite!: boolean;
}

export class TimelineCard {
  @ApiProperty({ description: '기록 id.', example: 21, type: 'integer', format: 'int64' })
  id!: number;

  @ApiProperty({ description: '표시용 최종 제목(자동 제목 포함).', example: '김하늘 · 만남' })
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

  @ApiProperty({ description: '첨부 사진 URL 목록.', type: [String], example: ['/images/a1b2.jpg'] })
  photoUrls!: string[];

  @ApiProperty({ description: '연결된 사람들(대표 우선 정렬).', type: () => [TimelinePerson] })
  persons!: TimelinePerson[];
}

export class TimelineMonthGroup {
  @ApiProperty({ description: '연도.', example: 2026, type: 'integer', format: 'int32' })
  year!: number;

  @ApiProperty({ description: '월(1~12).', example: 7, type: 'integer', format: 'int32' })
  month!: number;

  @ApiProperty({ description: '월 라벨.', example: '2026년 7월' })
  label!: string;

  @ApiProperty({ description: '이 달의 카드 목록(최신→과거).', type: () => [TimelineCard] })
  cards!: TimelineCard[];
}

export class TimelineResponse {
  @ApiProperty({ description: '월 단위 그룹 목록(최신→과거).', type: () => [TimelineMonthGroup] })
  groups!: TimelineMonthGroup[];
}
