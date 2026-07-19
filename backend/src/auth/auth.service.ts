import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { BusinessException } from '../common/exception/business-exception';
import { ErrorCode } from '../common/exception/error-code';
import { bytesToUuid, uuidToBytes } from '../common/prisma';
import { PrismaService } from '../prisma/prisma.service';
import { nowAsKstLocalDateTime } from '../shared/date';
import { TokenRequest, TokenResponse } from './auth.dto';

const USERNAME_MAX = 20;
const REQUIRED_NAME = '이름을 입력해 주세요.';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async issueToken(request: TokenRequest | null | undefined): Promise<TokenResponse> {
    if (request === null || request === undefined || typeof request !== 'object' || Array.isArray(request)) {
      throw new BusinessException(ErrorCode.INVALID_INPUT);
    }

    const requestedId = this.parseUserId(request.userId);
    const username = this.normalizeUsername(request.username);
    const now = nowAsKstLocalDateTime();

    const user =
      (await this.prisma.user.findUnique({ where: { id: requestedId } })) ??
      (await this.prisma.user.create({
        data: {
          id: requestedId,
          username,
          demoSeeded: false,
          profileSetupCompleted: false,
          createdAt: now,
          updatedAt: now,
        },
      }));

    const userId = bytesToUuid(user.id);
    const token = await this.jwtService.signAsync({ username: user.username }, { subject: userId });

    return {
      token,
      userId,
      username: user.username,
      profileSetupCompleted: user.profileSetupCompleted !== false,
    };
  }

  private parseUserId(value: unknown): Buffer<ArrayBuffer> {
    if (typeof value !== 'string') throw new BusinessException(ErrorCode.INVALID_INPUT);
    try {
      return uuidToBytes(value);
    } catch {
      throw new BusinessException(ErrorCode.INVALID_INPUT);
    }
  }

  private normalizeUsername(value: unknown): string {
    if (typeof value !== 'string') {
      throw new BusinessException(ErrorCode.REQUIRED_FIELD, REQUIRED_NAME);
    }
    const username = value.trim();
    if (!username) throw new BusinessException(ErrorCode.REQUIRED_FIELD, REQUIRED_NAME);
    if (username.length > USERNAME_MAX) {
      throw new BusinessException(ErrorCode.LENGTH_EXCEEDED, `최대 ${USERNAME_MAX}자까지 쓸 수 있어요.`);
    }
    return username;
  }
}
