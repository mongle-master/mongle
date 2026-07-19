import { Controller, Get, HttpStatus, Query, Res, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { CurrentUser } from '../common/auth/current-user.decorator';
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard';
import { UserPrincipal } from '../common/auth/user-principal.interface';
import { ErrorResponse } from '../common/exception/error-response';
import { uuidToBytes } from '../common/prisma';
import { queryIds } from '../shared/validation';
import { RelationMapResponse, ThrowbackResponse } from './home.dto';
import { HomeService } from './home.service';

@ApiTags('홈')
@ApiBearerAuth('bearerAuth')
@ApiUnauthorizedResponse({ description: '토큰 없음·무효(UNAUTHORIZED).', type: ErrorResponse })
@UseGuards(JwtAuthGuard)
@Controller('api/v1/home')
export class HomeController {
  constructor(private readonly home: HomeService) {}

  @Get('relation-map')
  @ApiOperation({
    operationId: 'getRelationMap',
    summary: '관계 지도 조회',
    description: "중심 '나' 노드와 인물 노드·연결선으로 관계 지도를 그린다. 관계태그 칩 필터는 여러 개면 합집합이다.",
  })
  @ApiQuery({
    name: 'relationTagChipIds',
    required: false,
    type: 'integer',
    format: 'int64',
    isArray: true,
    description: '관계태그 칩 id 필터. 여러 개면 합집합(OR). 없으면 전체.',
  })
  @ApiOkResponse({ description: '관계 지도.', type: RelationMapResponse })
  relationMap(
    @CurrentUser() user: UserPrincipal,
    @Query('relationTagChipIds') relationTagChipIds?: string | string[],
  ): Promise<RelationMapResponse> {
    return this.home.relationMap(uuidToBytes(user.id), queryIds(relationTagChipIds));
  }

  @Get('throwback')
  @ApiOperation({
    operationId: 'getThrowback',
    summary: '1년 전 오늘 회고',
    description: '정확히 1년 전 오늘의 기록이 있으면 우선순위에 따라 1건을 반환하고, 없으면 본문 없이 204를 반환한다.',
  })
  @ApiOkResponse({ description: '회고 카드 1건.', type: ThrowbackResponse })
  @ApiNoContentResponse({ description: '1년 전 오늘 기록 없음.' })
  async throwback(
    @CurrentUser() user: UserPrincipal,
    @Res({ passthrough: true }) response: Response,
  ): Promise<ThrowbackResponse | undefined> {
    const result = await this.home.throwback(uuidToBytes(user.id));
    if (result === null) {
      response.status(HttpStatus.NO_CONTENT);
      return undefined;
    }
    return result;
  }
}
