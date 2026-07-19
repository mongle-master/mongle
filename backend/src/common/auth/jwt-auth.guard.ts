import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { BusinessException } from '../exception/business-exception';
import { ErrorCode } from '../exception/error-code';
import { isUuid } from '../prisma';
import type { UserPrincipal } from './user-principal.interface';

interface JwtPayload {
  sub?: unknown;
  username?: unknown;
}

export interface AuthenticatedRequest extends Request {
  user?: UserPrincipal;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.bearerToken(request.headers.authorization);

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      if (!isUuid(payload.sub) || typeof payload.username !== 'string') {
        throw new Error('invalid claims');
      }
      request.user = { id: payload.sub, username: payload.username };
      return true;
    } catch {
      throw new BusinessException(ErrorCode.UNAUTHORIZED);
    }
  }

  private bearerToken(authorization: string | undefined): string {
    if (!authorization?.startsWith('Bearer ')) throw new BusinessException(ErrorCode.UNAUTHORIZED);
    const token = authorization.slice('Bearer '.length).trim();
    if (!token) throw new BusinessException(ErrorCode.UNAUTHORIZED);
    return token;
  }
}
