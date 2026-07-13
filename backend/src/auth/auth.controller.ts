import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ErrorResponse } from '../common/exception/error-response';
import { TokenRequest, TokenResponse } from './auth.dto';
import { AuthService } from './auth.service';

@ApiTags('인증')
@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    operationId: 'issueToken',
    summary: '토큰 발급',
    description: '브라우저가 생성한 UUID로 JWT를 발급한다. 처음 보는 UUID면 요청 이름으로 사용자를 만든다.',
  })
  @ApiOkResponse({
    description: '발급한 토큰과 사용자 상태.',
    type: TokenResponse,
  })
  @ApiBadRequestResponse({
    description: '이름 누락(REQUIRED_FIELD) 또는 글자수 초과(LENGTH_EXCEEDED).',
    type: ErrorResponse,
  })
  issueToken(@Body() request: TokenRequest): Promise<TokenResponse> {
    return this.authService.issueToken(request);
  }
}
