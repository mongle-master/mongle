import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { BusinessException } from '../exception/business-exception';
import { ErrorCode } from '../exception/error-code';
import type { AuthenticatedRequest } from './jwt-auth.guard';
import type { UserPrincipal } from './user-principal.interface';

export const CurrentUser = createParamDecorator((_data: unknown, context: ExecutionContext): UserPrincipal => {
  const user = context.switchToHttp().getRequest<AuthenticatedRequest>().user;
  if (!user) throw new BusinessException(ErrorCode.UNAUTHORIZED);
  return user;
});
