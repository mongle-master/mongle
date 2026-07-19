import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ChipRef {
  @ApiProperty({ description: '칩 id.', example: 7, type: 'integer', format: 'int64' })
  id!: number;

  @ApiProperty({ description: '칩 라벨.', example: '만남' })
  label!: string;

  @ApiPropertyOptional({
    description: '칩 표시 색상(hex).',
    example: '#E85D75',
    nullable: true,
    type: String,
  })
  color?: string | null;
}

export class PersonRef {
  @ApiProperty({ description: '인물 id.', example: 7, type: 'integer', format: 'int64' })
  id!: number;

  @ApiProperty({ description: '인물 이름.', example: '김하늘' })
  name!: string;
}
