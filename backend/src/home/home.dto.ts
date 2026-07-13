import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ChipRef } from '../shared/api.dto';
import { PersonGender } from '../persons/person.dto';

export class ThrowbackResponse {
  @ApiProperty({ description: '회고 대상 기록 id.', example: 21, type: 'integer', format: 'int64' })
  eventId!: number;

  @ApiProperty({ description: '대표 인물 id.', example: 7, type: 'integer', format: 'int64' })
  personId!: number;

  @ApiProperty({ description: '대표 인물 이름.', example: '김하늘' })
  personName!: string;

  @ApiPropertyOptional({
    description: '사용자가 입력한 제목만(자동 제목은 쓰지 않음). 없으면 null 이라 프론트가 폴백 문구를 넣는다.',
    nullable: true,
    type: String,
  })
  title?: string | null;

  @ApiProperty({ description: '1년 전 그날의 날짜.', example: '2025-07-13', type: String, format: 'date' })
  occurredDate!: string;

  @ApiPropertyOptional({ description: '대표 사진 URL(없을 수 있음).', nullable: true, type: String })
  photoUrl?: string | null;
}

export enum IntimacyStatus {
  UNKNOWN = 'UNKNOWN',
  NORMAL = 'NORMAL',
  DISTANT = 'DISTANT',
}

export class Intimacy {
  @ApiProperty({
    description: '친밀도 판정 상태. UNKNOWN=주기를 알 수 없어 판정 보류(멀어짐 아님), NORMAL=정상, DISTANT=멀어짐.',
    enum: IntimacyStatus,
  })
  status!: IntimacyStatus;

  @ApiPropertyOptional({
    description: '만남 간 평균 주기(일). 근거가 부족하면 null.',
    nullable: true,
    type: 'integer',
    format: 'int32',
  })
  averageIntervalDays?: number | null;

  @ApiPropertyOptional({
    description: '마지막 만남 이후 경과일. 근거가 부족하면 null.',
    nullable: true,
    type: 'integer',
    format: 'int32',
  })
  daysSinceLastMeet?: number | null;
}

export class MeNode {
  @ApiProperty({ description: '중심 노드 표시 라벨.', example: '나' })
  label!: string;

  @ApiProperty({
    description: '사용자 UUID.',
    example: '8e0ca8f5-a713-4a90-9df1-15f0be0d843c',
    format: 'uuid',
  })
  id!: string;

  @ApiProperty({ description: '사용자 표시 이름.' })
  name!: string;

  @ApiPropertyOptional({
    description: '사용자 프로필 이미지 URL(없을 수 있음).',
    nullable: true,
    type: String,
  })
  profileImageUrl?: string | null;

  @ApiPropertyOptional({ description: '기본 아바타 성별 힌트.', enum: PersonGender, nullable: true })
  avatarGender?: PersonGender | null;
}

export class PersonNode {
  @ApiProperty({ description: '인물 id.', type: 'integer', format: 'int64' })
  id!: number;

  @ApiProperty({ description: '인물 이름.' })
  name!: string;

  @ApiPropertyOptional({ description: '프로필 이미지 URL(없을 수 있음).', nullable: true, type: String })
  profileImageUrl?: string | null;

  @ApiPropertyOptional({ description: '기본 아바타 성별 힌트.', enum: PersonGender, nullable: true })
  avatarGender?: PersonGender | null;

  @ApiProperty({ description: '즐겨찾기 여부.' })
  favorite!: boolean;

  @ApiProperty({
    description: '이 인물과 함께 새긴 기록 수. 프론트가 관계 지도 노드 크기 표현에 사용한다.',
    type: 'integer',
    format: 'int32',
  })
  recordCount!: number;

  @ApiProperty({ description: '이 인물에 붙은 관계태그 칩 요약 참조 목록.', type: () => [ChipRef] })
  relationTags!: ChipRef[];

  @ApiProperty({ type: () => Intimacy })
  intimacy!: Intimacy;

  @ApiPropertyOptional({
    description: '처음 만난 날(없을 수 있음).',
    nullable: true,
    type: String,
    format: 'date',
  })
  firstMetDate?: string | null;
}

export class RelationEdge {
  @ApiProperty({ description: '연결 대상 인물 id.', type: 'integer', format: 'int64' })
  personId!: number;

  @ApiProperty({ description: '멀어진 관계 여부.' })
  distant!: boolean;
}

export class RelationMapResponse {
  @ApiProperty({ type: () => MeNode })
  me!: MeNode;

  @ApiProperty({ description: '인물 노드 목록.', type: () => [PersonNode] })
  nodes!: PersonNode[];

  @ApiProperty({ description: '나↔인물 연결선 목록.', type: () => [RelationEdge] })
  edges!: RelationEdge[];
}
