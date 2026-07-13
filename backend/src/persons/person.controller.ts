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
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
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
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard';
import { UserPrincipal } from '../common/auth/user-principal.interface';
import { ErrorResponse } from '../common/exception/error-response';
import { uuidToBytes } from '../common/prisma';
import { invalidInput, pathId } from '../shared/validation';
import { PersonDetailResponse, PersonRequest, PersonResponse, PersonSort } from './person.dto';
import { PersonService } from './person.service';

@ApiTags('사람')
@ApiBearerAuth('bearerAuth')
@ApiUnauthorizedResponse({ description: '토큰 없음·무효(UNAUTHORIZED).', type: ErrorResponse })
@UseGuards(JwtAuthGuard)
@Controller('/api/v1/persons')
export class PersonController {
  constructor(private readonly persons: PersonService) {}

  @Get()
  @ApiOperation({
    operationId: 'getPersons',
    summary: '인물 디렉토리 조회',
    description:
      '내 인물 목록을 정렬·검색해 반환한다. 어느 정렬이든 즐겨찾기는 항상 상단 그룹으로 뜬다. query 로 이름 검색을 한다.',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    enum: PersonSort,
    description: '정렬(NAME=가나다, RECENT=최근). 즐겨찾기는 항상 상단.',
  })
  @ApiQuery({ name: 'query', required: false, type: String, description: '이름 검색어(선택).' })
  @ApiOkResponse({ description: '인물 목록.', type: [PersonResponse] })
  async directory(
    @CurrentUser() user: UserPrincipal,
    @Query('sort') sortValue?: string,
    @Query('query') queryValue?: string | string[],
  ): Promise<PersonResponse[]> {
    if (sortValue !== undefined && !Object.values(PersonSort).includes(sortValue as PersonSort)) {
      return invalidInput();
    }
    const sort = (sortValue ?? PersonSort.NAME) as PersonSort;
    if (Array.isArray(queryValue)) return invalidInput();
    return this.persons.directory(uuidToBytes(user.id), sort, queryValue);
  }

  @Get(':id')
  @ApiOperation({
    operationId: 'getPerson',
    summary: '인물 상세 조회',
    description:
      '기본 정보에 파생 스탯(만남 횟수·기록 수·알고 지낸 기간·마지막 만남)을 더해 반환한다. 마지막 만난 날은 수기 입력과 기록의 max 를 재계산한 값이다.',
  })
  @ApiParam({ name: 'id', type: 'integer', format: 'int64', description: '인물 id.' })
  @ApiOkResponse({ description: '인물 상세.', type: PersonDetailResponse })
  @ApiNotFoundResponse({ description: '내 인물이 아님·존재하지 않음(NOT_FOUND).', type: ErrorResponse })
  detail(@CurrentUser() user: UserPrincipal, @Param('id') id: string): Promise<PersonDetailResponse> {
    return this.persons.detail(uuidToBytes(user.id), pathId(id));
  }

  @Post()
  @ApiOperation({
    operationId: 'createPerson',
    summary: '인물 등록',
    description:
      '이름만 필수로 인물을 등록한다. 관계태그 칩은 내 것이면서 보이는 것만 붙일 수 있고, 만난 날짜는 미래일 수 없으며 마지막 만난 날은 처음 만난 날 이후여야 한다.',
  })
  @ApiCreatedResponse({ description: '등록한 인물.', type: PersonResponse })
  @ApiBadRequestResponse({
    description:
      '이름 누락(REQUIRED_FIELD)·글자수 초과(LENGTH_EXCEEDED)·태그/취향 개수 초과(SELECTION_LIMIT)·미래 날짜(FUTURE_DATE)·날짜 역순(DATE_ORDER)·잘못된 생일(INVALID_INPUT).',
    type: ErrorResponse,
  })
  @ApiNotFoundResponse({
    description: '내 것이 아니거나 보이지 않는 관계태그 칩 연결(NOT_FOUND).',
    type: ErrorResponse,
  })
  register(@CurrentUser() user: UserPrincipal, @Body() request: PersonRequest): Promise<PersonResponse> {
    return this.persons.register(uuidToBytes(user.id), request);
  }

  @Put(':id')
  @ApiOperation({
    operationId: 'updatePerson',
    summary: '인물 수정',
    description: '인물 정보를 통째로 교체한다(등록과 같은 검증). 관계태그·취향도 요청 값으로 재구성한다.',
  })
  @ApiParam({ name: 'id', type: 'integer', format: 'int64', description: '인물 id.' })
  @ApiOkResponse({ description: '수정한 인물.', type: PersonResponse })
  @ApiBadRequestResponse({
    description:
      '이름 누락(REQUIRED_FIELD)·글자수 초과(LENGTH_EXCEEDED)·태그/취향 개수 초과(SELECTION_LIMIT)·미래 날짜(FUTURE_DATE)·날짜 역순(DATE_ORDER)·잘못된 생일(INVALID_INPUT).',
    type: ErrorResponse,
  })
  @ApiNotFoundResponse({
    description: '내 인물이 아님·존재하지 않음, 또는 내 것이 아닌 관계태그 칩 연결(NOT_FOUND).',
    type: ErrorResponse,
  })
  update(
    @CurrentUser() user: UserPrincipal,
    @Param('id') id: string,
    @Body() request: PersonRequest,
  ): Promise<PersonResponse> {
    return this.persons.update(uuidToBytes(user.id), pathId(id), request);
  }

  @Patch(':id/favorite')
  @ApiOperation({
    operationId: 'togglePersonFavorite',
    summary: '즐겨찾기 토글',
    description: '인물의 즐겨찾기 여부를 뒤집는다. 즐겨찾기는 디렉토리·관계 지도에서 항상 상단 그룹으로 뜬다.',
  })
  @ApiParam({ name: 'id', type: 'integer', format: 'int64', description: '인물 id.' })
  @ApiOkResponse({ description: '즐겨찾기 변경 결과.', type: PersonResponse })
  @ApiNotFoundResponse({ description: '내 인물이 아님·존재하지 않음(NOT_FOUND).', type: ErrorResponse })
  toggleFavorite(@CurrentUser() user: UserPrincipal, @Param('id') id: string): Promise<PersonResponse> {
    return this.persons.toggleFavorite(uuidToBytes(user.id), pathId(id));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    operationId: 'deletePerson',
    summary: '인물 삭제',
    description: '인물을 소프트삭제한다. 과거 기록의 인물 참조(이름)는 유지된다.',
  })
  @ApiParam({ name: 'id', type: 'integer', format: 'int64', description: '인물 id.' })
  @ApiNoContentResponse({ description: '삭제 완료.' })
  @ApiNotFoundResponse({ description: '내 인물이 아님·존재하지 않음(NOT_FOUND).', type: ErrorResponse })
  delete(@CurrentUser() user: UserPrincipal, @Param('id') id: string): Promise<void> {
    return this.persons.delete(uuidToBytes(user.id), pathId(id));
  }
}
