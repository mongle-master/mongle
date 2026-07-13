import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../common/auth/current-user.decorator';
import { ErrorResponse } from '../common/exception/error-response';
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard';
import { UserPrincipal } from '../common/auth/user-principal.interface';
import { uuidToBytes } from '../common/prisma';
import { pathId } from '../shared/validation';
import { CHIP_TYPE_VALUES, ChipCreateRequest, ChipRenameRequest, ChipResponse } from './chip.dto';
import { ChipService } from './chip.service';

@ApiTags('칩')
@ApiBearerAuth('bearerAuth')
@UseGuards(JwtAuthGuard)
@Controller('api/v1/chips')
export class ChipController {
  constructor(private readonly chipService: ChipService) {}

  @Get()
  @ApiOperation({
    operationId: 'getChips',
    summary: '칩 목록 조회',
    description:
      '종류별로 사용자에게 보이는 칩(공통 + 개인, 숨김 제외)을 순서대로 반환한다. 카테고리는 기본 선택 칩에 default=true 를 표시한다.',
  })
  @ApiQuery({ name: 'type', enum: CHIP_TYPE_VALUES, required: true, description: '칩 종류.' })
  @ApiOkResponse({ description: '칩 목록.', type: [ChipResponse] })
  @ApiUnauthorizedResponse({
    description: '토큰 없음·무효(UNAUTHORIZED).',
    type: ErrorResponse,
  })
  list(@CurrentUser() user: UserPrincipal, @Query('type') type: string | undefined): Promise<ChipResponse[]> {
    return this.chipService.list(uuidToBytes(user.id), type);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    operationId: 'createChip',
    summary: '개인 칩 생성',
    description: '종류·라벨로 개인 칩을 만든다. 같은 종류 안에서 라벨은 중복될 수 없고, 종류별 개수 상한이 있다.',
  })
  @ApiCreatedResponse({ description: '등록한 개인 칩.', type: ChipResponse })
  @ApiBadRequestResponse({
    description: '라벨 누락(REQUIRED_FIELD)·글자수 초과(LENGTH_EXCEEDED)·종류별 개수 초과(CHIP_LIMIT).',
    type: ErrorResponse,
  })
  @ApiUnauthorizedResponse({
    description: '토큰 없음·무효(UNAUTHORIZED).',
    type: ErrorResponse,
  })
  @ApiConflictResponse({
    description: '같은 종류에 같은 라벨이 이미 있음(DUPLICATE).',
    type: ErrorResponse,
  })
  create(@CurrentUser() user: UserPrincipal, @Body() request: ChipCreateRequest): Promise<ChipResponse> {
    return this.chipService.create(uuidToBytes(user.id), request);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    operationId: 'updateChip',
    summary: '칩 이름 변경',
    description: '개인 칩의 라벨을 바꾼다. 공통 칩은 바꿀 수 없다. 같은 종류 안에서 라벨은 중복될 수 없다.',
  })
  @ApiOkResponse({ description: '수정한 개인 칩.', type: ChipResponse })
  @ApiParam({ name: 'id', type: 'integer', format: 'int64', description: '칩 id.' })
  @ApiBadRequestResponse({
    description: '라벨 누락(REQUIRED_FIELD)·글자수 초과(LENGTH_EXCEEDED).',
    type: ErrorResponse,
  })
  @ApiUnauthorizedResponse({
    description: '토큰 없음·무효(UNAUTHORIZED).',
    type: ErrorResponse,
  })
  @ApiNotFoundResponse({
    description: '내 개인 칩이 아님·존재하지 않음(NOT_FOUND).',
    type: ErrorResponse,
  })
  @ApiConflictResponse({
    description: '같은 종류에 같은 라벨이 이미 있음(DUPLICATE).',
    type: ErrorResponse,
  })
  rename(
    @CurrentUser() user: UserPrincipal,
    @Param('id') id: string,
    @Body() request: ChipRenameRequest,
  ): Promise<ChipResponse> {
    return this.chipService.rename(uuidToBytes(user.id), pathId(id), request);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    operationId: 'deleteChip',
    summary: '칩 삭제(숨김)',
    description:
      '칩을 삭제한다. 개인 칩은 소프트삭제, 공통 칩은 사용자별 숨김 처리한다(과거 기록의 라벨은 유지). 보이는 카테고리가 마지막 1개면 지울 수 없다.',
  })
  @ApiNoContentResponse()
  @ApiParam({ name: 'id', type: 'integer', format: 'int64', description: '칩 id.' })
  @ApiBadRequestResponse({
    description: '마지막 카테고리 삭제 시도(CATEGORY_REQUIRED).',
    type: ErrorResponse,
  })
  @ApiUnauthorizedResponse({
    description: '토큰 없음·무효(UNAUTHORIZED).',
    type: ErrorResponse,
  })
  @ApiNotFoundResponse({
    description: '존재하지 않는 칩(NOT_FOUND).',
    type: ErrorResponse,
  })
  async delete(@CurrentUser() user: UserPrincipal, @Param('id') id: string): Promise<void> {
    await this.chipService.delete(uuidToBytes(user.id), pathId(id));
  }
}
