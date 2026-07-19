import { Body, Controller, Delete, HttpCode, HttpStatus, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/auth/current-user.decorator';
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard';
import { UserPrincipal } from '../common/auth/user-principal.interface';
import { UserProfileRequest, UserProfileResponse } from './user.dto';
import { UserService } from './user.service';

@ApiTags('사용자')
@ApiBearerAuth('bearerAuth')
@UseGuards(JwtAuthGuard)
@Controller('api/v1/users/me')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Patch('profile')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    operationId: 'completeProfileSetup',
    summary: '최초 프로필 설정 완료',
    description: '기본 아바타 또는 업로드 이미지를 저장한다. 값을 보내지 않으면 프로필 설정을 건너뛴다.',
  })
  @ApiOkResponse({ type: UserProfileResponse })
  completeProfileSetup(
    @CurrentUser() user: UserPrincipal,
    @Body() request: UserProfileRequest,
  ): Promise<UserProfileResponse> {
    return this.userService.completeProfileSetup(user.id, request);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    operationId: 'deleteCurrentUser',
    summary: '현재 사용자 삭제',
    description: '테스트를 위해 현재 사용자를 삭제한다.',
  })
  @ApiNoContentResponse()
  async deleteCurrentUser(@CurrentUser() user: UserPrincipal): Promise<void> {
    await this.userService.deleteCurrentUser(user.id);
  }
}
