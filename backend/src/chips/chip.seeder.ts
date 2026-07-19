import { Chip, ChipType, Prisma } from '@prisma/client';
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { nowAsKstLocalDateTime } from '../shared/date';

const SEEDS: ReadonlyArray<readonly [ChipType, readonly string[]]> = [
  [ChipType.EMOTION, ['반가움', '뭉클', '편안', '즐거움', '고마움', '설렘', '든든', '서운', '아쉬움', '속상', '그냥']],
  [ChipType.WEATHER, ['맑음', '흐림', '비', '쌀쌀', '더움']],
  [ChipType.CATEGORY, ['만남', '연락', '기념일', '기타']],
];

const RELATION_TAG_COLORS = [
  '#E85D75',
  '#0EA5E9',
  '#22A06B',
  '#8B5CF6',
  '#F97316',
  '#65A30D',
  '#14B8A6',
  '#DB2777',
] as const;

@Injectable()
export class ChipSeeder implements OnApplicationBootstrap {
  constructor(private readonly prisma: PrismaService) {}

  async onApplicationBootstrap(): Promise<void> {
    const now = nowAsKstLocalDateTime();
    await this.prisma.$transaction(async (tx) => {
      for (const [type, labels] of SEEDS) {
        for (const [displayOrder, label] of labels.entries()) {
          const existing = await tx.chip.findFirst({
            where: { type, ownerId: null, label, deletedAt: null },
          });
          if (existing === null) {
            await tx.chip.create({
              data: {
                type,
                ownerId: null,
                label,
                displayOrder,
                createdAt: now,
                updatedAt: now,
              },
            });
          } else if (existing.displayOrder !== displayOrder) {
            await tx.chip.update({
              where: { id: existing.id },
              data: { displayOrder, updatedAt: now },
            });
          }
        }
      }
      await this.backfillRelationTagColors(tx, now);
    });
  }

  private async backfillRelationTagColors(tx: Prisma.TransactionClient, now: Date): Promise<void> {
    const tags = await tx.chip.findMany({
      where: { type: ChipType.RELATION_TAG, deletedAt: null },
    });
    const groups = new Map<string, Chip[]>();
    for (const chip of tags) {
      const key = chip.ownerId === null ? '__common__' : Buffer.from(chip.ownerId).toString('hex');
      const group = groups.get(key) ?? [];
      group.push(chip);
      groups.set(key, group);
    }

    for (const group of groups.values()) {
      group.sort((left, right) => {
        if (left.displayOrder !== right.displayOrder) {
          return left.displayOrder - right.displayOrder;
        }
        return left.label < right.label ? -1 : left.label > right.label ? 1 : 0;
      });
      for (const [index, chip] of group.entries()) {
        if (chip.color === null) {
          await tx.chip.update({
            where: { id: chip.id },
            data: {
              color: RELATION_TAG_COLORS[index % RELATION_TAG_COLORS.length],
              updatedAt: now,
            },
          });
        }
      }
    }
  }
}
