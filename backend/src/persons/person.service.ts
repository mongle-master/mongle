import { Prisma } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { BusinessException } from '../common/exception/business-exception';
import { ErrorCode } from '../common/exception/error-code';
import { toNumberId } from '../common/prisma';
import { ChipService } from '../chips/chip.service';
import { ChipType } from '../chips/chip.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ChipRef } from '../shared/api.dto';
import {
  acquaintancePeriod,
  compareDates,
  daysSinceFirstMet,
  formatDate,
  formatLocalDateTime,
  nowAsKstLocalDateTime,
  parseDate,
  relativeDate,
  todayInKst,
} from '../shared/date';
import {
  LIMITS,
  MESSAGES,
  booleanOrDefault,
  integerIds,
  invalidInput,
  maxLength,
  notFuture,
  optionalDate,
  optionalText,
  requiredText,
  stringList,
  validDateOrder,
} from '../shared/validation';
import {
  Birthday,
  PersonDetailResponse,
  PersonGender,
  PersonRequest,
  PersonResponse,
  PersonSort,
  PersonStats,
} from './person.dto';

type PersonRow = {
  id: bigint;
  ownerId: Uint8Array<ArrayBuffer>;
  name: string;
  birthYear: number | null;
  birthMonth: number | null;
  birthDay: number | null;
  firstMetDate: Date | null;
  lastMetDate: Date | null;
  profileImageUrl: string | null;
  gender: string | null;
  relationType: string | null;
  favorite: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
  deletedAt: Date | null;
};

type NormalizedPerson = {
  name: string;
  birthday: { year: number | null; month: number; day: number } | null;
  firstMetDate: string | null;
  lastMetDate: string | null;
  profileImageUrl: string | null;
  gender: PersonGender | null;
  relationType: string | null;
  relationTagChipIds: bigint[];
  likes: string[];
  cautions: string[];
  favorite: boolean;
};

export type PersonStatsData = {
  meetingDatesDesc: string[];
  recordCount: number;
  lastMetDate: string | null;
};

@Injectable()
export class PersonService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly chips: ChipService,
  ) {}

  async register(ownerId: Buffer<ArrayBuffer>, request: PersonRequest): Promise<PersonResponse> {
    const normalized = await this.normalize(ownerId, request);
    const now = nowAsKstLocalDateTime();
    const person = await this.prisma.$transaction(async (tx) => {
      const created = await tx.person.create({
        data: {
          ownerId,
          name: normalized.name,
          birthYear: normalized.birthday?.year ?? null,
          birthMonth: normalized.birthday?.month ?? null,
          birthDay: normalized.birthday?.day ?? null,
          firstMetDate: normalized.firstMetDate ? parseDate(normalized.firstMetDate) : null,
          lastMetDate: normalized.lastMetDate ? parseDate(normalized.lastMetDate) : null,
          profileImageUrl: normalized.profileImageUrl,
          gender: normalized.gender,
          relationType: normalized.relationType,
          favorite: normalized.favorite,
          createdAt: now,
          updatedAt: now,
        },
      });
      await this.replacePersonCollections(tx, created.id, normalized, now);
      return created;
    });
    return this.toResponse(person);
  }

  async update(ownerId: Buffer<ArrayBuffer>, personId: bigint, request: PersonRequest): Promise<PersonResponse> {
    await this.loadOwned(ownerId, personId);
    const normalized = await this.normalize(ownerId, request);
    const now = nowAsKstLocalDateTime();
    const person = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.person.update({
        where: { id: personId },
        data: {
          name: normalized.name,
          birthYear: normalized.birthday?.year ?? null,
          birthMonth: normalized.birthday?.month ?? null,
          birthDay: normalized.birthday?.day ?? null,
          firstMetDate: normalized.firstMetDate ? parseDate(normalized.firstMetDate) : null,
          lastMetDate: normalized.lastMetDate ? parseDate(normalized.lastMetDate) : null,
          profileImageUrl: normalized.profileImageUrl,
          gender: normalized.gender,
          relationType: normalized.relationType,
          favorite: normalized.favorite,
          updatedAt: now,
        },
      });
      await this.replacePersonCollections(tx, personId, normalized, now);
      return updated;
    });
    return this.toResponse(person);
  }

  async directory(ownerId: Buffer<ArrayBuffer>, sort: PersonSort, query?: string): Promise<PersonResponse[]> {
    const keyword = query?.trim().toLowerCase() || null;
    const persons = (await this.prisma.person.findMany({ where: { ownerId, deletedAt: null } })) as PersonRow[];
    const filtered = persons.filter(
      (person) =>
        keyword === null ||
        person.name.toLowerCase().includes(keyword) ||
        person.relationType?.toLowerCase().includes(keyword) === true,
    );
    filtered.sort((left, right) => {
      if (left.favorite !== right.favorite) return left.favorite ? -1 : 1;
      if (sort === PersonSort.RECENT) {
        if (left.lastMetDate === null && right.lastMetDate !== null) return 1;
        if (left.lastMetDate !== null && right.lastMetDate === null) return -1;
        if (left.lastMetDate !== null && right.lastMetDate !== null) {
          const recent = compareDates(formatDate(right.lastMetDate), formatDate(left.lastMetDate));
          if (recent !== 0) return recent;
        }
        return 0;
      }
      return compareText(left.name.toLowerCase(), right.name.toLowerCase());
    });
    // 목록 크기와 무관하게 태그·취향 컬렉션을 한 번씩만 읽는다.
    return this.toResponses(filtered);
  }

  async detail(ownerId: Buffer<ArrayBuffer>, personId: bigint): Promise<PersonDetailResponse> {
    const person = await this.loadOwned(ownerId, personId);
    const [base, stats] = await Promise.all([this.toResponse(person), this.statsOf(person)]);
    const today = todayInKst();
    const responseStats: PersonStats = {
      meetCount: stats.meetingDatesDesc.length,
      recordCount: stats.recordCount,
      daysSinceFirstMet: base.firstMetDate ? daysSinceFirstMet(base.firstMetDate, today) : null,
      acquaintancePeriod: base.firstMetDate ? acquaintancePeriod(base.firstMetDate, today) : null,
      lastMetRelative: stats.lastMetDate ? relativeDate(stats.lastMetDate, today) : null,
    };
    return { ...base, lastMetDate: stats.lastMetDate, stats: responseStats };
  }

  async toggleFavorite(ownerId: Buffer<ArrayBuffer>, personId: bigint): Promise<PersonResponse> {
    const person = await this.loadOwned(ownerId, personId);
    const updated = await this.prisma.person.update({
      where: { id: personId },
      data: { favorite: !person.favorite, updatedAt: nowAsKstLocalDateTime() },
    });
    return this.toResponse(updated as PersonRow);
  }

  async delete(ownerId: Buffer<ArrayBuffer>, personId: bigint): Promise<void> {
    await this.loadOwned(ownerId, personId);
    const now = nowAsKstLocalDateTime();
    await this.prisma.$transaction(async (tx) => {
      const links = await tx.eventPerson.findMany({ where: { personId } });
      const eventIds = links.map((link) => link.eventId);
      const activeEvents = eventIds.length
        ? await tx.event.findMany({ where: { id: { in: eventIds }, deletedAt: null } })
        : [];
      for (const event of activeEvents) {
        await tx.eventPerson.deleteMany({ where: { eventId: event.id, personId } });
        const remaining = await tx.eventPerson.count({ where: { eventId: event.id } });
        if (remaining === 0) {
          await tx.event.update({ where: { id: event.id }, data: { deletedAt: now, updatedAt: now } });
        }
      }
      await tx.person.update({ where: { id: personId }, data: { deletedAt: now, updatedAt: now } });
    });
  }

  async loadOwned(ownerId: Buffer<ArrayBuffer>, personId: bigint): Promise<PersonRow> {
    const person = await this.prisma.person.findFirst({ where: { id: personId, ownerId, deletedAt: null } });
    if (!person) throw new BusinessException(ErrorCode.NOT_FOUND);
    return person as PersonRow;
  }

  async relationTagChipIdsByPerson(persons: PersonRow[]): Promise<Map<bigint, bigint[]>> {
    const ids = persons.map((person) => person.id);
    if (ids.length === 0) return new Map();
    const rows = await this.prisma.personRelationTag.findMany({
      where: { personId: { in: ids } },
      orderBy: [{ personId: 'asc' }, { displayOrder: 'asc' }],
    });
    const result = new Map<bigint, bigint[]>();
    for (const row of rows) {
      const values = result.get(row.personId) ?? [];
      values.push(row.chipId);
      result.set(row.personId, values);
    }
    return result;
  }

  async statsOf(person: PersonRow): Promise<PersonStatsData> {
    const meetingCategoryId = await this.chips.meetingCategoryId();
    const links = await this.prisma.eventPerson.findMany({ where: { personId: person.id } });
    const eventIds = links.map((link) => link.eventId);
    const events = eventIds.length
      ? await this.prisma.event.findMany({ where: { id: { in: eventIds }, deletedAt: null } })
      : [];
    const meetingDatesDesc = meetingCategoryId
      ? [
          ...new Set(
            events
              .filter((event) => event.categoryChipId === meetingCategoryId)
              .map((event) => formatDate(event.occurredDate)),
          ),
        ].sort((left, right) => compareDates(right, left))
      : [];
    const candidates = [person.lastMetDate ? formatDate(person.lastMetDate) : null, meetingDatesDesc[0] ?? null]
      .filter((value): value is string => value !== null)
      .filter((value) => person.firstMetDate === null || compareDates(value, formatDate(person.firstMetDate)) >= 0)
      .sort((left, right) => compareDates(right, left));
    return { meetingDatesDesc, recordCount: events.length, lastMetDate: candidates[0] ?? null };
  }

  private async normalize(ownerId: Buffer<ArrayBuffer>, request: PersonRequest): Promise<NormalizedPerson> {
    if (!request || typeof request !== 'object' || Array.isArray(request)) return invalidInput();
    const name = requiredText(request.name, MESSAGES.requiredName);
    maxLength(name, LIMITS.name);
    const relationType = optionalText(request.relationType);
    if (relationType !== null) maxLength(relationType, LIMITS.relationType);

    const birthday = normalizeBirthday(request.birthday);
    const firstMetDate = optionalDate(request.firstMetDate);
    const lastMetDate = optionalDate(request.lastMetDate);
    if (birthday?.year !== null && birthday !== null) notFuture(dateFromBirthday(birthday));
    if (firstMetDate !== null) notFuture(firstMetDate);
    if (lastMetDate !== null) notFuture(lastMetDate);
    validDateOrder(firstMetDate, lastMetDate);

    const relationTagChipIds = integerIds(request.relationTagChipIds);
    if (relationTagChipIds.length > LIMITS.relationTags) {
      throw new BusinessException(ErrorCode.SELECTION_LIMIT, MESSAGES.relationTagLimit);
    }
    const visibleTagIds = new Set(
      (await this.chips.visibleChips(ownerId, ChipType.RELATION_TAG)).map((chip) => chip.id.toString()),
    );
    if (relationTagChipIds.some((id) => !visibleTagIds.has(id.toString())))
      throw new BusinessException(ErrorCode.NOT_FOUND);

    const likes = normalizePreferences(request.likes);
    const cautions = normalizePreferences(request.cautions);
    const profileImageUrl = optionalText(request.profileImageUrl);
    const gender = normalizeGender(request.gender);
    const favorite = booleanOrDefault(request.favorite, false);
    return {
      name,
      birthday,
      firstMetDate,
      lastMetDate,
      profileImageUrl,
      gender,
      relationType,
      relationTagChipIds,
      likes,
      cautions,
      favorite,
    };
  }

  private async replacePersonCollections(
    tx: Prisma.TransactionClient,
    personId: bigint,
    normalized: NormalizedPerson,
    now: Date,
  ): Promise<void> {
    await Promise.all([
      tx.personRelationTag.deleteMany({ where: { personId } }),
      tx.personLike.deleteMany({ where: { personId } }),
      tx.personCaution.deleteMany({ where: { personId } }),
    ]);
    if (normalized.relationTagChipIds.length) {
      await tx.personRelationTag.createMany({
        data: normalized.relationTagChipIds.map((chipId, displayOrder) => ({
          personId,
          chipId,
          displayOrder,
          createdAt: now,
          updatedAt: now,
        })),
      });
    }
    if (normalized.likes.length) {
      await tx.personLike.createMany({
        data: normalized.likes.map((item, itemOrder) => ({ personId, itemOrder, item })),
      });
    }
    if (normalized.cautions.length) {
      await tx.personCaution.createMany({
        data: normalized.cautions.map((item, itemOrder) => ({ personId, itemOrder, item })),
      });
    }
  }

  private async toResponse(person: PersonRow): Promise<PersonResponse> {
    return (await this.toResponses([person]))[0];
  }

  private async toResponses(persons: PersonRow[]): Promise<PersonResponse[]> {
    if (persons.length === 0) return [];
    const personIds = persons.map((person) => person.id);
    const [tagRows, likeRows, cautionRows] = await Promise.all([
      this.prisma.personRelationTag.findMany({
        where: { personId: { in: personIds } },
        orderBy: [{ personId: 'asc' }, { displayOrder: 'asc' }],
      }),
      this.prisma.personLike.findMany({
        where: { personId: { in: personIds } },
        orderBy: [{ personId: 'asc' }, { itemOrder: 'asc' }],
      }),
      this.prisma.personCaution.findMany({
        where: { personId: { in: personIds } },
        orderBy: [{ personId: 'asc' }, { itemOrder: 'asc' }],
      }),
    ]);
    const tagIdsByPerson = groupByPerson(tagRows, (row) => row.chipId);
    const likesByPerson = groupByPerson(likeRows, (row) => row.item ?? '');
    const cautionsByPerson = groupByPerson(cautionRows, (row) => row.item ?? '');
    const tagIds = [...new Set(tagRows.map((row) => row.chipId))];
    const chips = tagIds.length ? await this.prisma.chip.findMany({ where: { id: { in: tagIds } } }) : [];
    const chipsById = new Map(chips.map((chip) => [chip.id.toString(), chip]));
    return persons.map((person) => {
      const relationTags: ChipRef[] = (tagIdsByPerson.get(person.id) ?? []).flatMap((id) => {
        const chip = chipsById.get(id.toString());
        return chip ? [{ id: toNumberId(id), label: chip.label, color: chip.color }] : [];
      });
      return {
        id: toNumberId(person.id),
        name: person.name,
        birthday: birthdayFrom(person),
        firstMetDate: person.firstMetDate ? formatDate(person.firstMetDate) : null,
        lastMetDate: person.lastMetDate ? formatDate(person.lastMetDate) : null,
        profileImageUrl: person.profileImageUrl,
        gender: person.gender as PersonGender | null,
        relationType: person.relationType,
        relationTags,
        likes: likesByPerson.get(person.id) ?? [],
        cautions: cautionsByPerson.get(person.id) ?? [],
        favorite: person.favorite,
        createdAt: formatLocalDateTime(person.createdAt),
      };
    });
  }
}

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function normalizeGender(value: unknown): PersonGender | null {
  if (value === undefined || value === null) return null;
  if (value !== PersonGender.FEMALE && value !== PersonGender.MALE) return invalidInput();
  return value;
}

function normalizeBirthday(value: unknown): NormalizedPerson['birthday'] {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'object' || Array.isArray(value)) return invalidInput();
  const input = value as Record<string, unknown>;
  const year = nullableInteger(input.year);
  const month = nullableInteger(input.month);
  const day = nullableInteger(input.day);
  if (month === null && day === null) return null;
  if (month === null || day === null) return invalidInput();
  const probe = `${String(year ?? 2000).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  try {
    parseDate(probe);
  } catch {
    return invalidInput();
  }
  return { year, month, day };
}

function nullableInteger(value: unknown): number | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'number' || !Number.isInteger(value)) return invalidInput();
  return value;
}

function dateFromBirthday(birthday: NonNullable<NormalizedPerson['birthday']>): string {
  return `${String(birthday.year).padStart(4, '0')}-${String(birthday.month).padStart(2, '0')}-${String(birthday.day).padStart(2, '0')}`;
}

function normalizePreferences(value: unknown): string[] {
  const items = stringList(value)
    .map((item) => item.trim())
    .filter(Boolean);
  if (items.length > LIMITS.preferences) {
    throw new BusinessException(ErrorCode.SELECTION_LIMIT, MESSAGES.preferenceLimit);
  }
  for (const item of items) maxLength(item, LIMITS.preferenceItem);
  if (new Set(items).size !== items.length) throw new BusinessException(ErrorCode.DUPLICATE);
  return items;
}

function birthdayFrom(person: PersonRow): Birthday | null {
  if (person.birthMonth === null || person.birthDay === null) return null;
  return { year: person.birthYear, month: person.birthMonth, day: person.birthDay };
}

function groupByPerson<Row extends { personId: bigint }, Value>(
  rows: Row[],
  valueOf: (row: Row) => Value,
): Map<bigint, Value[]> {
  const result = new Map<bigint, Value[]>();
  for (const row of rows) {
    const values = result.get(row.personId) ?? [];
    values.push(valueOf(row));
    result.set(row.personId, values);
  }
  return result;
}
