import { ArgumentsHost, BadRequestException, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { Response } from 'express';
import { BusinessException } from './business-exception';
import { ERROR_DEFINITIONS, ErrorCode } from './error-code';
import { ErrorResponse } from './error-response';

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const mapped = this.mapException(exception);

    if (mapped.status >= 500) {
      this.logger.error('Unexpected error', exception instanceof Error ? exception.stack : String(exception));
    } else if (exception instanceof Error) {
      this.logger.warn(`${mapped.body.code}: ${exception.message}`);
    }

    response.status(mapped.status).json(mapped.body);
  }

  private mapException(exception: unknown): { status: number; body: ErrorResponse } {
    if (exception instanceof BusinessException) {
      return this.error(exception.errorCode, exception.message);
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      if (exception.code === 'P2002') return this.error(ErrorCode.DUPLICATE);
      if (exception.code === 'P2025') return this.error(ErrorCode.NOT_FOUND);
    }

    if (exception instanceof BadRequestException) {
      return this.error(ErrorCode.INVALID_INPUT);
    }

    if (exception instanceof HttpException) {
      if (exception.getStatus() === 401) return this.error(ErrorCode.UNAUTHORIZED);
      if (exception.getStatus() === 404) return this.error(ErrorCode.NOT_FOUND);
    }

    return this.error(ErrorCode.INTERNAL_ERROR);
  }

  private error(code: ErrorCode, message?: string): { status: number; body: ErrorResponse } {
    const definition = ERROR_DEFINITIONS[code];
    return {
      status: definition.status,
      body: { code, message: message ?? definition.message },
    };
  }
}
