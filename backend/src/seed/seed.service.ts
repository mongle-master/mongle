import { ChipType, Gender, Prisma } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  addDays,
  addMonths,
  formatDate,
  nowAsKstLocalDateTime,
  parseDate,
  parseTime,
  todayInKst,
} from '../shared/date';

type SeedPerson = {
  name: string;
  relationType: string;
  gender: Gender;
  birthYear?: number;
  birthMonth?: number;
  birthDay?: number;
  firstMetDate?: string;
  lastMetDate?: string;
  favorite?: boolean;
  likes?: string[];
  cautions?: string[];
  relationTags: string[];
};

type SeedEvent = {
  occurredDate: string;
  occurredTime?: string;
  category: string;
  weather?: string;
  people: string[];
  emotions: string[];
  title?: string;
  memo?: string;
};

@Injectable()
export class SeedService {
  constructor(private readonly prisma: PrismaService) {}

  async seed(ownerId: Buffer<ArrayBuffer>): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM users WHERE id = ${ownerId} FOR UPDATE`;
      const user = await tx.user.findUnique({ where: { id: ownerId } });
      if (!user) throw new Error('authenticated user does not exist');
      if (user.demoSeeded) return;

      const activePersonCount = await tx.person.count({
        where: { ownerId, deletedAt: null },
      });
      if (activePersonCount > 0) {
        await tx.user.update({
          where: { id: ownerId },
          data: { demoSeeded: true, updatedAt: nowAsKstLocalDateTime() },
        });
        return;
      }

      const now = nowAsKstLocalDateTime();
      const today = todayInKst();
      const relationTags = await this.ensureRelationTags(tx, ownerId, now);
      const [categories, weather, emotions] = await Promise.all([
        this.commonChipIds(tx, ChipType.CATEGORY),
        this.commonChipIds(tx, ChipType.WEATHER),
        this.commonChipIds(tx, ChipType.EMOTION),
      ]);

      const personSpecs: SeedPerson[] = [
        {
          name: '김서연',
          relationType: '대학 친구',
          gender: Gender.FEMALE,
          birthYear: 1995,
          birthMonth: 4,
          birthDay: 12,
          firstMetDate: minusYears(today, 3),
          lastMetDate: addDays(today, -3),
          favorite: true,
          likes: ['카페 투어', '산책'],
          cautions: ['매운 음식'],
          relationTags: ['친구', '대학동기'],
        },
        {
          name: '이준호',
          relationType: '회사 동료',
          gender: Gender.MALE,
          birthMonth: 9,
          birthDay: 23,
          firstMetDate: addMonths(today, -14),
          lastMetDate: addMonths(today, -1),
          likes: ['커피', '러닝'],
          relationTags: ['직장'],
        },
        {
          name: '박민지',
          relationType: '동생',
          gender: Gender.FEMALE,
          birthYear: 2000,
          birthMonth: 11,
          birthDay: 5,
          lastMetDate: addMonths(today, -2),
          favorite: true,
          relationTags: ['가족'],
        },
        {
          name: '최윤서',
          relationType: '동네 친구',
          gender: Gender.FEMALE,
          firstMetDate: addMonths(minusYears(today, 1), -2),
          lastMetDate: addDays(today, -10),
          likes: ['떡볶이'],
          cautions: ['늦은 약속'],
          relationTags: ['동네', '친구'],
        },
        {
          name: '정하준',
          relationType: '동아리 후배',
          gender: Gender.MALE,
          birthYear: 1998,
          birthMonth: 7,
          birthDay: 30,
          firstMetDate: minusYears(today, 2),
          lastMetDate: addMonths(today, -10),
          relationTags: ['대학동기', '친구'],
        },
      ];
      const personIds = new Map<string, bigint>();
      for (const spec of personSpecs) {
        const person = await tx.person.create({
          data: {
            ownerId,
            name: spec.name,
            relationType: spec.relationType,
            gender: spec.gender,
            birthYear: spec.birthYear ?? null,
            birthMonth: spec.birthMonth ?? null,
            birthDay: spec.birthDay ?? null,
            firstMetDate: spec.firstMetDate ? parseDate(spec.firstMetDate) : null,
            lastMetDate: spec.lastMetDate ? parseDate(spec.lastMetDate) : null,
            profileImageUrl: null,
            favorite: spec.favorite ?? false,
            createdAt: now,
            updatedAt: now,
          },
        });
        personIds.set(spec.name, person.id);
        const tagIds = spec.relationTags.map((label) => required(relationTags, label));
        if (tagIds.length > 0) {
          await tx.personRelationTag.createMany({
            data: tagIds.map((chipId, displayOrder) => ({
              personId: person.id,
              chipId,
              displayOrder,
              createdAt: now,
              updatedAt: now,
            })),
          });
        }
        if (spec.likes?.length) {
          await tx.personLike.createMany({
            data: spec.likes.map((item, itemOrder) => ({
              personId: person.id,
              itemOrder,
              item,
            })),
          });
        }
        if (spec.cautions?.length) {
          await tx.personCaution.createMany({
            data: spec.cautions.map((item, itemOrder) => ({
              personId: person.id,
              itemOrder,
              item,
            })),
          });
        }
      }

      const eventSpecs: SeedEvent[] = [
        {
          occurredDate: minusYears(today, 1),
          category: '만남',
          weather: '맑음',
          people: ['정하준'],
          emotions: ['반가움', '즐거움'],
          memo: '오랜만에 얼굴 보고 싶어서\n한강 피크닉',
        },
        {
          occurredDate: addDays(today, -3),
          occurredTime: '15:00:00',
          category: '만남',
          weather: '흐림',
          people: ['김서연'],
          emotions: ['편안', '고마움'],
          title: '서연이랑 카페',
          memo: '시험 끝나고 기분전환\n홍대 카페에서 수다',
        },
        {
          occurredDate: addDays(today, -10),
          category: '만남',
          weather: '더움',
          people: ['최윤서'],
          emotions: ['즐거움'],
          memo: '동네 저녁 산책',
        },
        {
          occurredDate: addMonths(today, -1),
          category: '연락',
          people: ['이준호'],
          emotions: ['그냥'],
          memo: '문득 생각나서\n오랜만에 안부 전화',
        },
        {
          occurredDate: addMonths(today, -2),
          category: '만남',
          weather: '맑음',
          people: ['박민지', '김서연'],
          emotions: ['반가움', '편안', '즐거움'],
          memo: '엄마 생신\n가족 모임 겸 저녁',
        },
        {
          occurredDate: addMonths(today, -4),
          category: '기념일',
          weather: '쌀쌀',
          people: ['김서연'],
          emotions: ['뭉클', '고마움'],
          title: '서연 생일',
          memo: '10년지기 생일\n생일 축하 저녁',
        },
        {
          occurredDate: addMonths(today, -10),
          category: '만남',
          weather: '비',
          people: ['정하준', '최윤서'],
          emotions: ['즐거움', '그냥'],
          memo: '동아리 번개 모임',
        },
        {
          occurredDate: addMonths(today, -9),
          category: '연락',
          people: ['이준호'],
          emotions: ['그냥'],
          memo: '협업 논의\n프로젝트 관련 메시지',
        },
      ];
      for (const spec of eventSpecs) {
        await this.createEvent(tx, ownerId, spec, personIds, categories, weather, emotions, now);
      }
      await tx.user.update({
        where: { id: ownerId },
        data: { demoSeeded: true, updatedAt: now },
      });
    });
  }

  private async ensureRelationTags(
    tx: Prisma.TransactionClient,
    ownerId: Buffer<ArrayBuffer>,
    now: Date,
  ): Promise<Map<string, bigint>> {
    const specs = [
      ['가족', '#E85D75'],
      ['친구', '#0EA5E9'],
      ['직장', '#22A06B'],
      ['대학동기', '#8B5CF6'],
      ['동네', '#F97316'],
    ] as const;
    const existing = await tx.chip.findMany({
      where: { type: ChipType.RELATION_TAG, ownerId, deletedAt: null },
      orderBy: { displayOrder: 'asc' },
    });
    const byLabel = new Map(existing.map((chip) => [chip.label, chip]));
    let displayOrder = existing.reduce((max, chip) => Math.max(max, chip.displayOrder), -1) + 1;
    const result = new Map<string, bigint>();
    for (const [label, color] of specs) {
      const chip = byLabel.get(label);
      if (chip) {
        await tx.chip.update({
          where: { id: chip.id },
          data: { color, updatedAt: now },
        });
        result.set(label, chip.id);
      } else {
        const created = await tx.chip.create({
          data: {
            type: ChipType.RELATION_TAG,
            ownerId,
            label,
            color,
            displayOrder: displayOrder++,
            createdAt: now,
            updatedAt: now,
          },
        });
        result.set(label, created.id);
      }
    }
    return result;
  }

  private async commonChipIds(tx: Prisma.TransactionClient, type: ChipType): Promise<Map<string, bigint>> {
    const chips = await tx.chip.findMany({
      where: { type, ownerId: null, deletedAt: null },
      orderBy: { displayOrder: 'asc' },
    });
    return new Map(chips.map((chip) => [chip.label, chip.id]));
  }

  private async createEvent(
    tx: Prisma.TransactionClient,
    ownerId: Buffer<ArrayBuffer>,
    spec: SeedEvent,
    personIds: Map<string, bigint>,
    categories: Map<string, bigint>,
    weather: Map<string, bigint>,
    emotions: Map<string, bigint>,
    now: Date,
  ): Promise<void> {
    const event = await tx.event.create({
      data: {
        ownerId,
        occurredDate: parseDate(spec.occurredDate),
        occurredTime: spec.occurredTime ? parseTime(spec.occurredTime) : null,
        categoryChipId: required(categories, spec.category),
        weatherChipId: spec.weather ? required(weather, spec.weather) : null,
        title: spec.title ?? null,
        memo: spec.memo ?? null,
        createdAt: now,
        updatedAt: now,
      },
    });
    await tx.eventPerson.createMany({
      data: spec.people.map((name, displayOrder) => ({
        eventId: event.id,
        personId: required(personIds, name),
        displayOrder,
        createdAt: now,
        updatedAt: now,
      })),
    });
    await tx.eventEmotion.createMany({
      data: spec.emotions.map((label, displayOrder) => ({
        eventId: event.id,
        chipId: required(emotions, label),
        displayOrder,
        createdAt: now,
        updatedAt: now,
      })),
    });
  }
}

function required(map: Map<string, bigint>, key: string): bigint {
  const value = map.get(key);
  if (value === undefined) throw new Error(`required seed value is missing: ${key}`);
  return value;
}

function minusYears(value: string, amount: number): string {
  const source = parseDate(value);
  const year = source.getUTCFullYear() - amount;
  const month = source.getUTCMonth();
  const day = Math.min(source.getUTCDate(), new Date(Date.UTC(year, month + 1, 0)).getUTCDate());
  return formatDate(new Date(Date.UTC(year, month, day)));
}
