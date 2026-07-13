import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../common/auth/current-user.decorator';
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard';
import { UserPrincipal } from '../common/auth/user-principal.interface';
import { ErrorResponse } from '../common/exception/error-response';
import { uuidToBytes } from '../common/prisma';
import { pathId } from '../shared/validation';
import { EventRequest, EventResponse } from './event.dto';
import { EventService } from './event.service';

@ApiTags('기록')
@ApiBearerAuth('bearerAuth')
@ApiUnauthorizedResponse({ description: '토큰 없음·무효(UNAUTHORIZED).', type: ErrorResponse })
@UseGuards(JwtAuthGuard)
@Controller('api/v1/events')
export class EventController {
  constructor(private readonly events: EventService) {}

  @Post()
  @ApiOperation({
    operationId: 'createEvent',
    summary: '기록 등록',
    description:
      '함께한 사람·카테고리·날짜를 기준으로 기록을 남긴다. 카테고리와 날짜는 미입력 시 기본값으로 채우고, 감정·사진은 선택 개수 상한을 검증한다.',
  })
  @ApiCreatedResponse({ description: '등록한 기록.', type: EventResponse })
  @ApiBadRequestResponse({
    description:
      '인물 미선택(REQUIRED_FIELD)·글자수 초과(LENGTH_EXCEEDED)·감정 선택 개수 초과(SELECTION_LIMIT)·미래 날짜(FUTURE_DATE)·카테고리 누락(CATEGORY_REQUIRED).',
    type: ErrorResponse,
  })
  @ApiNotFoundResponse({
    description: '내 것이 아니거나 보이지 않는 인물·칩 연결(NOT_FOUND).',
    type: ErrorResponse,
  })
  create(@CurrentUser() user: UserPrincipal, @Body() request: EventRequest): Promise<EventResponse> {
    return this.events.create(uuidToBytes(user.id), request);
  }

  @Get(':id')
  @ApiOperation({
    operationId: 'getEvent',
    summary: '기록 상세 조회',
    description: '기록과 연결된 사람·감정·사진을 저장 순서대로 반환한다.',
  })
  @ApiParam({ name: 'id', type: 'integer', format: 'int64', description: '기록 id.' })
  @ApiOkResponse({ description: '기록 상세.', type: EventResponse })
  @ApiNotFoundResponse({ description: '내 기록이 아님·존재하지 않음(NOT_FOUND).', type: ErrorResponse })
  detail(@CurrentUser() user: UserPrincipal, @Param('id') id: string): Promise<EventResponse> {
    return this.events.detail(uuidToBytes(user.id), pathId(id));
  }

  @Put(':id')
  @ApiOperation({
    operationId: 'updateEvent',
    summary: '기록 수정',
    description: '기록 정보를 통째로 교체한다. 연결된 사람·감정·사진도 요청 값으로 재구성한다.',
  })
  @ApiParam({ name: 'id', type: 'integer', format: 'int64', description: '기록 id.' })
  @ApiOkResponse({ description: '수정한 기록.', type: EventResponse })
  @ApiBadRequestResponse({
    description:
      '인물 미선택(REQUIRED_FIELD)·글자수 초과(LENGTH_EXCEEDED)·감정 선택 개수 초과(SELECTION_LIMIT)·미래 날짜(FUTURE_DATE)·카테고리 누락(CATEGORY_REQUIRED).',
    type: ErrorResponse,
  })
  @ApiNotFoundResponse({
    description: '내 기록이 아님·존재하지 않음, 또는 내 것이 아닌 인물·칩 연결(NOT_FOUND).',
    type: ErrorResponse,
  })
  update(
    @CurrentUser() user: UserPrincipal,
    @Param('id') id: string,
    @Body() request: EventRequest,
  ): Promise<EventResponse> {
    return this.events.update(uuidToBytes(user.id), pathId(id), request);
  }
}
