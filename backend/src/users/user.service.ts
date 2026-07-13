import { Gender } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { BusinessException } from '../common/exception/business-exception';
import { ErrorCode } from '../common/exception/error-code';
import { uuidToBytes } from '../common/prisma';
import { PrismaService } from '../prisma/prisma.service';
import { nowAsKstLocalDateTime } from '../shared/date';
import { UserGender, UserProfileRequest, UserProfileResponse } from './user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async completeProfileSetup(
    userId: string,
    request: UserProfileRequest | null | undefined,
  ): Promise<UserProfileResponse> {
    if (request === null || request === undefined || typeof request !== 'object' || Array.isArray(request)) {
      throw new BusinessException(ErrorCode.INVALID_INPUT);
    }

    const id = uuidToBytes(userId);
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (existing === null) throw new BusinessException(ErrorCode.NOT_FOUND);

    const profileImageUrl = this.normalizeProfileImageUrl(request.profileImageUrl);
    const gender = this.normalizeGender(request.gender);
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        profileImageUrl,
        gender,
        profileSetupCompleted: true,
        updatedAt: nowAsKstLocalDateTime(),
      },
    });

    return this.toResponse(user);
  }

  async deleteCurrentUser(userId: string): Promise<void> {
    const id = uuidToBytes(userId);
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (existing === null) throw new BusinessException(ErrorCode.NOT_FOUND);
    await this.prisma.user.delete({ where: { id } });
  }

  private normalizeProfileImageUrl(value: unknown): string | null {
    if (value === undefined || value === null) return null;
    if (typeof value !== 'string') throw new BusinessException(ErrorCode.INVALID_INPUT);
    return value.trim() || null;
  }

  private normalizeGender(value: unknown): Gender | null {
    if (value === undefined || value === null) return null;
    if (value !== UserGender.FEMALE && value !== UserGender.MALE) {
      throw new BusinessException(ErrorCode.INVALID_INPUT);
    }
    return value as Gender;
  }

  private toResponse(user: {
    username: string;
    profileImageUrl: string | null;
    gender: Gender | null;
    profileSetupCompleted: boolean | null;
  }): UserProfileResponse {
    return {
      username: user.username,
      profileImageUrl: user.profileImageUrl,
      gender: user.gender as UserGender | null,
      profileSetupCompleted: user.profileSetupCompleted !== false,
    };
  }
}
