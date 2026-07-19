import { Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { CurrentUser } from '../common/auth/current-user.decorator';
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard';
import { UserPrincipal } from '../common/auth/user-principal.interface';
import { ErrorResponse } from '../common/exception/error-response';

@ApiTags('이미지')
@ApiBearerAuth('bearerAuth')
@UseGuards(JwtAuthGuard)
@Controller('api/v1/images')
export class ImageController {
  @Post('upload-permission')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    operationId: 'authorizeUpload',
    summary: '이미지 업로드 권한 확인',
    description: 'Vercel 함수가 Blob 업로드 토큰을 발급하기 전에 JWT 유효성을 확인한다.',
  })
  @ApiOkResponse({ description: '업로드 권한 확인 완료.' })
  @ApiUnauthorizedResponse({
    description: '토큰 없음·무효(UNAUTHORIZED).',
    type: ErrorResponse,
  })
  authorizeUpload(@CurrentUser() user: UserPrincipal): void {
    void user;
  }
}
