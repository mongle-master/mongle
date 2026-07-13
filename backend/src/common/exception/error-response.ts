import { ApiProperty, ApiSchema } from '@nestjs/swagger';

@ApiSchema({
  description: '공통 에러 응답. code 는 ErrorCode 이름, message 는 사용자에게 그대로 노출 가능한 문구(§12.5).',
})
export class ErrorResponse {
  @ApiProperty({ example: 'REQUIRED_FIELD', description: '에러 코드(ErrorCode enum 이름).' })
  code!: string;

  @ApiProperty({ example: '이름을 입력해 주세요.', description: '사용자 노출용 에러 문구.' })
  message!: string;
}
