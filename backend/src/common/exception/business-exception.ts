import { HttpException } from '@nestjs/common';
import { ERROR_DEFINITIONS, ErrorCode } from './error-code';

export class BusinessException extends HttpException {
  constructor(
    public readonly errorCode: ErrorCode,
    message?: string,
  ) {
    const definition = ERROR_DEFINITIONS[errorCode];
    super(message ?? definition.message, definition.status);
  }
}
