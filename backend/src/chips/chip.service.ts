import { Chip, ChipType } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { BusinessException } from '../common/exception/business-exception';
import { ErrorCode } from '../common/exception/error-code';
import { toNumberId } from '../common/prisma';
import { PrismaService } from '../prisma/prisma.service';
import { nowAsKstLocalDateTime } from '../shared/date';
import { ChipCreateRequest, ChipRenameRequest, ChipResponse } from './chip.dto';

const CHIP_NAME_MAX = 10;
const CHIP_PER_KIND_MAX = 30;
const REQUIRED_CHIP_NAME = '칩 이름을 입력해 주세요.';
const HEX_COLOR_PATTERN = /^#[0-9A-F]{6}$/;

@Injectable()
export class ChipService {
  constructor(private readonly prisma: PrismaService) {}

  async visibleChips(ownerId: Buffer<ArrayBuffer>, type: ChipType): Promise<Chip[]> {
    const [hiddenRows, common, personal] = await Promise.all([
      this.prisma.chipHide.findMany({
        where: { ownerId },
        select: { chipId: true },
      }),
      this.prisma.chip.findMany({
        where: { type, ownerId: null, deletedAt: null },
        orderBy: { displayOrder: 'asc' },
      }),
      this.prisma.chip.findMany({
        where: { type, ownerId, deletedAt: null },
        orderBy: { displayOrder: 'asc' },
      }),
    ]);

    const hiddenIds = new Set(hiddenRows.map(({ chipId }) => chipId.toString()));
    return [...common.filter((chip) => !hiddenIds.has(chip.id.toString())), ...personal];
  }

  async defaultCategoryId(ownerId: Buffer<ArrayBuffer>): Promise<bigint | null> {
    const [first] = await this.visibleChips(ownerId, ChipType.CATEGORY);
    return first?.id ?? null;
  }

  meetingCategoryId(): Promise<bigint | null> {
    return this.commonCategoryId('만남');
  }

  anniversaryCategoryId(): Promise<bigint | null> {
    return this.commonCategoryId('기념일');
  }

  async commonCategoryId(label: string): Promise<bigint | null> {
    const chip = await this.prisma.chip.findFirst({
      where: {
        type: ChipType.CATEGORY,
        ownerId: null,
        label,
        deletedAt: null,
      },
      select: { id: true },
    });
    return chip?.id ?? null;
  }

  async list(ownerId: Buffer<ArrayBuffer>, rawType: unknown): Promise<ChipResponse[]> {
    const type = this.requireChipType(rawType);
    const chips = await this.visibleChips(ownerId, type);
    const defaultId = type === ChipType.CATEGORY ? (chips[0]?.id ?? null) : null;
    return chips.map((chip) => this.toResponse(chip, defaultId));
  }

  async create(ownerId: Buffer<ArrayBuffer>, request: ChipCreateRequest | null | undefined): Promise<ChipResponse> {
    if (request === null || request === undefined || typeof request !== 'object' || Array.isArray(request)) {
      throw new BusinessException(ErrorCode.INVALID_INPUT);
    }

    const type = this.requireChipType(request.type);
    const label = this.requireLabel(request.label);
    const color = this.normalizeColor(request.color);
    await this.assertNoDuplicate(ownerId, type, label);

    const activeCount = await this.prisma.chip.count({
      where: { type, ownerId, deletedAt: null },
    });
    if (activeCount >= CHIP_PER_KIND_MAX) {
      throw new BusinessException(
        ErrorCode.CHIP_LIMIT,
        `칩은 종류별로 최대 ${CHIP_PER_KIND_MAX}개까지 만들 수 있어요.`,
      );
    }

    const last = await this.prisma.chip.findFirst({
      where: { type, ownerId },
      orderBy: { displayOrder: 'desc' },
      select: { displayOrder: true },
    });
    const chip = await this.prisma.chip.create({
      data: {
        type,
        ownerId,
        label,
        color,
        displayOrder: (last?.displayOrder ?? -1) + 1,
        createdAt: nowAsKstLocalDateTime(),
        updatedAt: nowAsKstLocalDateTime(),
      },
    });
    return this.toResponse(chip);
  }

  async rename(
    ownerId: Buffer<ArrayBuffer>,
    chipId: bigint,
    request: ChipRenameRequest | null | undefined,
  ): Promise<ChipResponse> {
    const chip = await this.prisma.chip.findFirst({
      where: { id: chipId, ownerId, deletedAt: null },
    });
    if (chip === null) throw new BusinessException(ErrorCode.NOT_FOUND);
    if (request === null || request === undefined || typeof request !== 'object' || Array.isArray(request)) {
      throw new BusinessException(ErrorCode.INVALID_INPUT);
    }

    const label = this.requireLabel(request.label);
    const color = this.normalizeColor(request.color);
    await this.assertNoDuplicate(ownerId, chip.type, label, chip.id);
    const updated = await this.prisma.chip.update({
      where: { id: chip.id },
      data: { label, color, updatedAt: nowAsKstLocalDateTime() },
    });
    const defaultId = updated.type === ChipType.CATEGORY ? await this.defaultCategoryId(ownerId) : null;
    return this.toResponse(updated, defaultId);
  }

  async delete(ownerId: Buffer<ArrayBuffer>, chipId: bigint): Promise<void> {
    const chip = await this.prisma.chip.findUnique({ where: { id: chipId } });
    if (chip === null) throw new BusinessException(ErrorCode.NOT_FOUND);

    await this.assertCategoryMinimum(ownerId, chip);
    if (chip.ownerId === null) {
      const hidden = await this.prisma.chipHide.findFirst({
        where: { ownerId, chipId: chip.id },
      });
      if (hidden === null) {
        await this.prisma.chipHide.create({
          data: {
            ownerId,
            chipId: chip.id,
            createdAt: nowAsKstLocalDateTime(),
            updatedAt: nowAsKstLocalDateTime(),
          },
        });
      }
      return;
    }

    if (!Buffer.from(chip.ownerId).equals(ownerId)) {
      throw new BusinessException(ErrorCode.NOT_FOUND);
    }
    if (chip.deletedAt === null) {
      await this.prisma.chip.update({
        where: { id: chip.id },
        data: {
          deletedAt: nowAsKstLocalDateTime(),
          updatedAt: nowAsKstLocalDateTime(),
        },
      });
    }
  }

  private requireChipType(value: unknown): ChipType {
    if (!Object.values(ChipType).includes(value as ChipType)) {
      throw new BusinessException(ErrorCode.INVALID_INPUT);
    }
    return value as ChipType;
  }

  private requireLabel(value: unknown): string {
    if (value === undefined || value === null) {
      throw new BusinessException(ErrorCode.REQUIRED_FIELD, REQUIRED_CHIP_NAME);
    }
    if (typeof value !== 'string') throw new BusinessException(ErrorCode.INVALID_INPUT);
    const label = value.trim();
    if (!label) {
      throw new BusinessException(ErrorCode.REQUIRED_FIELD, REQUIRED_CHIP_NAME);
    }
    if (label.length > CHIP_NAME_MAX) {
      throw new BusinessException(ErrorCode.LENGTH_EXCEEDED, `최대 ${CHIP_NAME_MAX}자까지 쓸 수 있어요.`);
    }
    return label;
  }

  private normalizeColor(value: unknown): string | null {
    if (value === undefined || value === null) return null;
    if (typeof value !== 'string') throw new BusinessException(ErrorCode.INVALID_INPUT);
    const color = value.trim().toUpperCase();
    if (!color) return null;
    return HEX_COLOR_PATTERN.test(color) ? color : null;
  }

  private async assertNoDuplicate(
    ownerId: Buffer<ArrayBuffer>,
    type: ChipType,
    label: string,
    excludeId?: bigint,
  ): Promise<void> {
    const duplicate = await this.prisma.chip.findFirst({
      where: {
        type,
        label,
        deletedAt: null,
        OR: [{ ownerId: null }, { ownerId }],
        ...(excludeId === undefined ? {} : { id: { not: excludeId } }),
      },
      select: { id: true },
    });
    if (duplicate !== null) throw new BusinessException(ErrorCode.DUPLICATE);
  }

  private async assertCategoryMinimum(ownerId: Buffer<ArrayBuffer>, chip: Chip): Promise<void> {
    if (chip.type !== ChipType.CATEGORY) return;
    const visible = await this.visibleChips(ownerId, ChipType.CATEGORY);
    if (visible.length <= 1 && visible.some(({ id }) => id === chip.id)) {
      throw new BusinessException(ErrorCode.CATEGORY_REQUIRED);
    }
  }

  private toResponse(chip: Chip, defaultChipId: bigint | null = null): ChipResponse {
    return {
      id: toNumberId(chip.id),
      type: chip.type,
      label: chip.label,
      color: chip.color,
      personal: chip.ownerId !== null,
      order: chip.displayOrder,
      default: chip.id === defaultChipId,
    };
  }
}
