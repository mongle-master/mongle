import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../common/auth/current-user.decorator';
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard';
import { UserPrincipal } from '../common/auth/user-principal.interface';
import { ErrorResponse } from '../common/exception/error-response';
import { uuidToBytes } from '../common/prisma';
import { EventResponse } from '../events/event.dto';
import { pathId, queryIds } from '../shared/validation';
import { ActivityFlowResponse, TimelineResponse } from './timeline.dto';
import { TimelineService } from './timeline.service';

@ApiTags('타임라인')
@ApiBearerAuth('bearerAuth')
@ApiUnauthorizedResponse({ description: '토큰 없음·무효(UNAUTHORIZED).', type: ErrorResponse })
@UseGuards(JwtAuthGuard)
@Controller()
export class TimelineController {
  constructor(private readonly timeline: TimelineService) {}

  @Get('api/v1/persons/:personId/timeline')
  @ApiOperation({
    operationId: 'getPersonTimeline',
    summary: '사람별 기록 피드',
    description: '특정 인물과 함께한 기록을 최신순으로 반환한다. 카테고리 칩으로 걸러낼 수 있다(여러 개면 합집합).',
  })
  @ApiParam({ name: 'personId', type: 'integer', format: 'int64', description: '인물 id.' })
  @ApiQuery({
    name: 'categoryChipIds',
    required: false,
    type: 'integer',
    format: 'int64',
    isArray: true,
    description: '카테고리 칩 id 필터. 여러 개면 합집합(OR). 없으면 전체.',
  })
  @ApiOkResponse({ description: '사람별 기록 목록.', type: [EventResponse] })
  @ApiNotFoundResponse({ description: '내 인물이 아님·존재하지 않음(NOT_FOUND).', type: ErrorResponse })
  personFeed(
    @CurrentUser() user: UserPrincipal,
    @Param('personId') personId: string,
    @Query('categoryChipIds') categoryChipIds?: string | string[],
  ): Promise<EventResponse[]> {
    return this.timeline.personFeed(uuidToBytes(user.id), pathId(personId), queryIds(categoryChipIds));
  }

  @Get('api/v1/persons/:personId/activity-flow')
  @ApiOperation({
    operationId: 'getPersonActivityFlow',
    summary: '사람별 활동 흐름',
    description:
      '특정 인물과의 활동을 레인(만남/연락/추억) × 월 매트릭스로 집계한다. 값은 유무만 담고 횟수·강도는 담지 않는다.',
  })
  @ApiParam({ name: 'personId', type: 'integer', format: 'int64', description: '인물 id.' })
  @ApiOkResponse({ description: '사람별 활동 흐름.', type: ActivityFlowResponse })
  @ApiNotFoundResponse({ description: '내 인물이 아님·존재하지 않음(NOT_FOUND).', type: ErrorResponse })
  activityFlow(@CurrentUser() user: UserPrincipal, @Param('personId') personId: string): Promise<ActivityFlowResponse> {
    return this.timeline.activityFlow(uuidToBytes(user.id), pathId(personId));
  }

  @Get('api/v1/timeline')
  @ApiOperation({
    operationId: 'getTimeline',
    summary: '나의 통합 연대기(전체 타임라인)',
    description:
      '내 모든 기록을 월 단위로 묶어 최신→과거 순으로 반환한다. 카테고리·인물 필터는 각 축 안에서 합집합, 축 간에는 교집합이다.',
  })
  @ApiQuery({
    name: 'personIds',
    required: false,
    type: 'integer',
    format: 'int64',
    isArray: true,
    description: '인물 id 필터. 여러 개면 합집합(OR). 없으면 전체.',
  })
  @ApiQuery({
    name: 'categoryChipIds',
    required: false,
    type: 'integer',
    format: 'int64',
    isArray: true,
    description: '카테고리 칩 id 필터. 여러 개면 합집합(OR). 없으면 전체.',
  })
  @ApiOkResponse({ description: '통합 연대기.', type: TimelineResponse })
  myTimeline(
    @CurrentUser() user: UserPrincipal,
    @Query('categoryChipIds') categoryChipIds?: string | string[],
    @Query('personIds') personIds?: string | string[],
  ): Promise<TimelineResponse> {
    return this.timeline.myTimeline(uuidToBytes(user.id), queryIds(categoryChipIds), queryIds(personIds));
  }
}
