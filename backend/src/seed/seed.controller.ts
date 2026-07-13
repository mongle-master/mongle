import { Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiNoContentResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/auth/current-user.decorator';
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard';
import { UserPrincipal } from '../common/auth/user-principal.interface';
import { uuidToBytes } from '../common/prisma';
import { SeedService } from './seed.service';

@ApiTags('시드')
@ApiBearerAuth('bearerAuth')
@UseGuards(JwtAuthGuard)
@Controller('api/v1/seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Post()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    operationId: 'seed',
    summary: '현재 사용자 데모 데이터 시드',
  })
  @ApiNoContentResponse({ description: '시드 완료 또는 이미 완료됨.' })
  seed(@CurrentUser() user: UserPrincipal): Promise<void> {
    return this.seedService.seed(uuidToBytes(user.id));
  }
}
