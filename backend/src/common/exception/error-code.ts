import { HttpStatus } from '@nestjs/common';

export enum ErrorCode {
  INVALID_INPUT = 'INVALID_INPUT',
  REQUIRED_FIELD = 'REQUIRED_FIELD',
  LENGTH_EXCEEDED = 'LENGTH_EXCEEDED',
  DUPLICATE = 'DUPLICATE',
  FUTURE_DATE = 'FUTURE_DATE',
  DATE_ORDER = 'DATE_ORDER',
  SELECTION_LIMIT = 'SELECTION_LIMIT',
  CHIP_LIMIT = 'CHIP_LIMIT',
  CATEGORY_REQUIRED = 'CATEGORY_REQUIRED',
  UNAUTHORIZED = 'UNAUTHORIZED',
  NOT_FOUND = 'NOT_FOUND',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

export interface ErrorDefinition {
  status: HttpStatus;
  message: string;
}

export const ERROR_DEFINITIONS: Record<ErrorCode, ErrorDefinition> = {
  [ErrorCode.INVALID_INPUT]: { status: HttpStatus.BAD_REQUEST, message: '잘못된 입력입니다.' },
  [ErrorCode.REQUIRED_FIELD]: { status: HttpStatus.BAD_REQUEST, message: '이름을 입력해 주세요.' },
  [ErrorCode.LENGTH_EXCEEDED]: { status: HttpStatus.BAD_REQUEST, message: '글자수를 초과했어요.' },
  [ErrorCode.DUPLICATE]: { status: HttpStatus.CONFLICT, message: '이미 있는 항목이에요.' },
  [ErrorCode.FUTURE_DATE]: { status: HttpStatus.BAD_REQUEST, message: '오늘보다 미래일 수는 없어요.' },
  [ErrorCode.DATE_ORDER]: {
    status: HttpStatus.BAD_REQUEST,
    message: '마지막 만난 날은 처음 만난 날 이후여야 해요.',
  },
  [ErrorCode.SELECTION_LIMIT]: {
    status: HttpStatus.BAD_REQUEST,
    message: '선택할 수 있는 최대 개수를 넘었어요.',
  },
  [ErrorCode.CHIP_LIMIT]: { status: HttpStatus.BAD_REQUEST, message: '칩 개수 상한을 넘었어요.' },
  [ErrorCode.CATEGORY_REQUIRED]: {
    status: HttpStatus.BAD_REQUEST,
    message: '카테고리는 최소 1개가 필요해요.',
  },
  [ErrorCode.UNAUTHORIZED]: { status: HttpStatus.UNAUTHORIZED, message: '로그인이 필요해요.' },
  [ErrorCode.NOT_FOUND]: { status: HttpStatus.NOT_FOUND, message: '리소스를 찾을 수 없습니다.' },
  [ErrorCode.INTERNAL_ERROR]: {
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    message: '서버 오류가 발생했습니다.',
  },
};
