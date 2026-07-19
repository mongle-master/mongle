import { ChipType } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export { ChipType };

export const CHIP_TYPE_VALUES = [ChipType.EMOTION, ChipType.WEATHER, ChipType.CATEGORY, ChipType.RELATION_TAG] as const;

export class ChipCreateRequest {
  @ApiProperty({
    description: '칩 종류(카테고리·감정·날씨·관계태그).',
    enum: CHIP_TYPE_VALUES,
    example: ChipType.RELATION_TAG,
  })
  type!: ChipType;

  @ApiProperty({
    description: '칩에 표시할 라벨. 종류 안에서 중복될 수 없다.',
    example: '대학 친구',
  })
  label!: string;

  @ApiPropertyOptional({
    description: '칩 표시 색상(hex). 관계태그 등 색상이 필요한 칩에서 사용한다.',
    example: '#0EA5E9',
    nullable: true,
    type: String,
  })
  color?: string | null;
}

export class ChipRenameRequest {
  @ApiProperty({
    description: '새 라벨. 종류 안에서 중복될 수 없다.',
    example: '동네 친구',
  })
  label!: string;

  @ApiPropertyOptional({
    description: '칩 표시 색상(hex). null 이면 색상을 비운다.',
    example: '#22A06B',
    nullable: true,
    type: String,
  })
  color?: string | null;
}

export class ChipResponse {
  @ApiProperty({ description: '칩 id.', example: 12, type: 'integer', format: 'int64' })
  id!: number;

  @ApiProperty({
    description: '칩 종류(카테고리·감정·날씨·관계태그).',
    enum: CHIP_TYPE_VALUES,
    example: ChipType.RELATION_TAG,
  })
  type!: ChipType;

  @ApiProperty({
    description: '칩 라벨. 소프트삭제된 칩도 과거 기록 표시를 위해 라벨은 유지된다.',
    example: '대학 친구',
  })
  label!: string;

  @ApiPropertyOptional({
    description: '칩 표시 색상(hex).',
    example: '#0EA5E9',
    nullable: true,
    type: String,
  })
  color?: string | null;

  @ApiProperty({
    description: '개인 칩 여부. 공통 칩은 false 이며 이름변경·삭제가 불가하다.',
    example: true,
  })
  personal!: boolean;

  @ApiProperty({
    description: '같은 종류 안에서의 표시 순서(오름차순).',
    example: 0,
    type: 'integer',
    format: 'int32',
  })
  order!: number;

  @ApiProperty({
    description: '기록 작성 시 기본 선택될 카테고리 칩인지 여부. 카테고리 외 종류는 항상 false.',
    example: false,
  })
  default!: boolean;
}
