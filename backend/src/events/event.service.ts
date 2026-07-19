import { Prisma } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { BusinessException } from '../common/exception/business-exception';
import { ErrorCode } from '../common/exception/error-code';
import { toNumberId } from '../common/prisma';
import { ChipService } from '../chips/chip.service';
import { ChipType } from '../chips/chip.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ChipRef, PersonRef } from '../shared/api.dto';
import {
  compareDates,
  formatDate,
  formatLocalDateTime,
  formatTime,
  nowAsKstLocalDateTime,
  parseDate,
  parseTime,
  todayInKst,
} from '../shared/date';
import {
  LIMITS,
  MESSAGES,
  arrayOrEmpty,
  integerId,
  integerIds,
  invalidInput,
  maxLength,
  notFuture,
  optionalDate,
  optionalText,
  optionalTime,
} from '../shared/validation';
import { EventRequest, EventResponse } from './event.dto';

export type EventRow = {
  id: bigint;
  ownerId: Uint8Array<ArrayBuffer>;
  occurredDate: Date;
  occurredTime: Date | null;
  categoryChipId: bigint;
  weatherChipId: bigint | null;
  title: string | null;
  memo: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  deletedAt: Date | null;
};

type PersonForDerived = {
  id: bigint;
  firstMetDate: Date | null;
  lastMetDate: Date | null;
};

type NormalizedEvent = {
  title: string | null;
  memo: string | null;
  occurredDate: string;
  occurredTime: string | null;
  categoryChipId: bigint;
  weatherChipId: bigint | null;
  emotionChipIds: bigint[];
  personIds: bigint[];
  photoUrls: string[];
  persons: PersonForDerived[];
};

@Injectable()
export class EventService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly chips: ChipService,
  ) {}

  async create(ownerId: Buffer<ArrayBuffer>, request: EventRequest): Promise<EventResponse> {
    const normalized = await this.normalize(ownerId, request);
    const now = nowAsKstLocalDateTime();
    const meetingCategoryId = await this.chips.meetingCategoryId();
    const event = await this.prisma.$transaction(async (tx) => {
      const created = await tx.event.create({
        data: {
          ownerId,
          occurredDate: parseDate(normalized.occurredDate),
          occurredTime: normalized.occurredTime ? parseTime(normalized.occurredTime) : null,
          categoryChipId: normalized.categoryChipId,
          weatherChipId: normalized.weatherChipId,
          title: normalized.title,
          memo: normalized.memo,
          createdAt: now,
          updatedAt: now,
        },
      });
      if (normalized.personIds.length) {
        await tx.eventPerson.createMany({
          data: normalized.personIds.map((personId, displayOrder) => ({
            eventId: created.id,
            personId,
            displayOrder,
            createdAt: now,
            updatedAt: now,
          })),
        });
      }
      if (normalized.emotionChipIds.length) {
        await tx.eventEmotion.createMany({
          data: normalized.emotionChipIds.map((chipId, displayOrder) => ({
            eventId: created.id,
            chipId,
            displayOrder,
            createdAt: now,
            updatedAt: now,
          })),
        });
      }
      if (normalized.photoUrls.length) {
        await tx.eventPhoto.createMany({
          data: normalized.photoUrls.map((url, photoOrder) => ({ eventId: created.id, photoOrder, url })),
        });
      }
      if (meetingCategoryId !== null && normalized.categoryChipId === meetingCategoryId) {
        await this.advanceLastMet(tx, normalized.persons, normalized.occurredDate, now);
      }
      return created;
    });
    return this.toResponse(event as EventRow);
  }

  async detail(ownerId: Buffer<ArrayBuffer>, eventId: bigint): Promise<EventResponse> {
    return this.toResponse(await this.loadOwned(ownerId, eventId));
  }

  async update(ownerId: Buffer<ArrayBuffer>, eventId: bigint, request: EventRequest): Promise<EventResponse> {
    await this.loadOwned(ownerId, eventId);
    const normalized = await this.normalize(ownerId, request);
    const now = nowAsKstLocalDateTime();
    const meetingCategoryId = await this.chips.meetingCategoryId();
    const event = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.event.update({
        where: { id: eventId },
        data: {
          occurredDate: parseDate(normalized.occurredDate),
          occurredTime: normalized.occurredTime ? parseTime(normalized.occurredTime) : null,
          categoryChipId: normalized.categoryChipId,
          weatherChipId: normalized.weatherChipId,
          title: normalized.title,
          memo: normalized.memo,
          updatedAt: now,
        },
      });
      await Promise.all([
        tx.eventPerson.deleteMany({ where: { eventId } }),
        tx.eventEmotion.deleteMany({ where: { eventId } }),
        tx.eventPhoto.deleteMany({ where: { eventId } }),
      ]);
      if (normalized.personIds.length) {
        await tx.eventPerson.createMany({
          data: normalized.personIds.map((personId, displayOrder) => ({
            eventId,
            personId,
            displayOrder,
            createdAt: now,
            updatedAt: now,
          })),
        });
      }
      if (normalized.emotionChipIds.length) {
        await tx.eventEmotion.createMany({
          data: normalized.emotionChipIds.map((chipId, displayOrder) => ({
            eventId,
            chipId,
            displayOrder,
            createdAt: now,
            updatedAt: now,
          })),
        });
      }
      if (normalized.photoUrls.length) {
        await tx.eventPhoto.createMany({
          data: normalized.photoUrls.map((url, photoOrder) => ({ eventId, photoOrder, url })),
        });
      }
      if (meetingCategoryId !== null && normalized.categoryChipId === meetingCategoryId) {
        await this.advanceLastMet(tx, normalized.persons, normalized.occurredDate, now);
      }
      return updated;
    });
    return this.toResponse(event as EventRow);
  }

  async loadOwned(ownerId: Buffer<ArrayBuffer>, eventId: bigint): Promise<EventRow> {
    const event = await this.prisma.event.findFirst({ where: { id: eventId, ownerId, deletedAt: null } });
    if (!event) throw new BusinessException(ErrorCode.NOT_FOUND);
    return event as EventRow;
  }

  async personIdsByEvent(events: EventRow[]): Promise<Map<bigint, bigint[]>> {
    const eventIds = events.map((event) => event.id);
    if (eventIds.length === 0) return new Map();
    const rows = await this.prisma.eventPerson.findMany({
      where: { eventId: { in: eventIds } },
      orderBy: [{ eventId: 'asc' }, { displayOrder: 'asc' }],
    });
    return groupByEvent(rows, (row) => row.personId);
  }

  async toResponses(events: EventRow[]): Promise<EventResponse[]> {
    if (events.length === 0) return [];
    const eventIds = events.map((event) => event.id);
    const [personRows, emotionRows, photoRows] = await Promise.all([
      this.prisma.eventPerson.findMany({
        where: { eventId: { in: eventIds } },
        orderBy: [{ eventId: 'asc' }, { displayOrder: 'asc' }],
      }),
      this.prisma.eventEmotion.findMany({
        where: { eventId: { in: eventIds } },
        orderBy: [{ eventId: 'asc' }, { displayOrder: 'asc' }],
      }),
      this.prisma.eventPhoto.findMany({
        where: { eventId: { in: eventIds } },
        orderBy: [{ eventId: 'asc' }, { photoOrder: 'asc' }],
      }),
    ]);
    const personIdsByEvent = groupByEvent(personRows, (row) => row.personId);
    const emotionIdsByEvent = groupByEvent(emotionRows, (row) => row.chipId);
    const photosByEvent = groupByEvent(photoRows, (row) => row.url);
    const personIds = [...new Set(personRows.map((row) => row.personId))];
    const chipIds = [
      ...events.map((event) => event.categoryChipId),
      ...events.flatMap((event) => (event.weatherChipId === null ? [] : [event.weatherChipId])),
      ...emotionRows.map((row) => row.chipId),
    ];
    const [persons, chips] = await Promise.all([
      personIds.length ? this.prisma.person.findMany({ where: { id: { in: personIds } } }) : [],
      chipIds.length ? this.prisma.chip.findMany({ where: { id: { in: [...new Set(chipIds)] } } }) : [],
    ]);
    const personNames = new Map(persons.map((person) => [person.id.toString(), person.name]));
    const chipDisplays = new Map(chips.map((chip) => [chip.id.toString(), chip]));
    return events.map((event) => {
      const personIdsForEvent = personIdsByEvent.get(event.id) ?? [];
      const emotionIds = emotionIdsByEvent.get(event.id) ?? [];
      const category = chipDisplays.get(event.categoryChipId.toString());
      const weather = event.weatherChipId === null ? undefined : chipDisplays.get(event.weatherChipId.toString());
      const personsForResponse: PersonRef[] = personIdsForEvent.flatMap((id) => {
        const name = personNames.get(id.toString());
        return name === undefined ? [] : [{ id: toNumberId(id), name }];
      });
      const emotions: ChipRef[] = emotionIds.flatMap((id) => {
        const chip = chipDisplays.get(id.toString());
        return chip ? [{ id: toNumberId(id), label: chip.label, color: chip.color }] : [];
      });
      return {
        id: toNumberId(event.id),
        title: event.title ?? autoTitle(personsForResponse, category?.label ?? ''),
        memo: event.memo,
        occurredDate: formatDate(event.occurredDate),
        occurredTime: event.occurredTime ? formatTime(event.occurredTime) : null,
        category: category ? { id: toNumberId(category.id), label: category.label, color: category.color } : null,
        weather: weather ? { id: toNumberId(weather.id), label: weather.label, color: weather.color } : null,
        emotions,
        persons: personsForResponse,
        photoUrls: (photosByEvent.get(event.id) ?? []) as string[],
        createdAt: formatLocalDateTime(event.createdAt),
      };
    });
  }

  async toResponse(event: EventRow): Promise<EventResponse> {
    return (await this.toResponses([event]))[0];
  }

  private async normalize(ownerId: Buffer<ArrayBuffer>, request: EventRequest): Promise<NormalizedEvent> {
    if (!request || typeof request !== 'object' || Array.isArray(request)) return invalidInput();
    const personIds = integerIds(request.personIds);
    if (personIds.length === 0) throw new BusinessException(ErrorCode.REQUIRED_FIELD, MESSAGES.requiredPerson);
    const persons = (await this.prisma.person.findMany({
      where: { id: { in: personIds }, ownerId, deletedAt: null },
    })) as PersonForDerived[];
    const allowedPersonIds = new Set(persons.map((person) => person.id.toString()));
    if (personIds.some((id) => !allowedPersonIds.has(id.toString()))) throw new BusinessException(ErrorCode.NOT_FOUND);

    const categoryChipId =
      request.categoryChipId === undefined || request.categoryChipId === null
        ? await this.chips.defaultCategoryId(ownerId)
        : integerId(request.categoryChipId);
    if (categoryChipId === null) throw new BusinessException(ErrorCode.CATEGORY_REQUIRED);
    const visibleCategories = new Set(
      (await this.chips.visibleChips(ownerId, ChipType.CATEGORY)).map((chip) => chip.id.toString()),
    );
    if (!visibleCategories.has(categoryChipId.toString())) throw new BusinessException(ErrorCode.NOT_FOUND);

    const weatherChipId =
      request.weatherChipId === undefined || request.weatherChipId === null ? null : integerId(request.weatherChipId);
    if (weatherChipId !== null) {
      const visibleWeather = new Set(
        (await this.chips.visibleChips(ownerId, ChipType.WEATHER)).map((chip) => chip.id.toString()),
      );
      if (!visibleWeather.has(weatherChipId.toString())) throw new BusinessException(ErrorCode.NOT_FOUND);
    }

    const emotionChipIds = integerIds(request.emotionChipIds);
    if (emotionChipIds.length > LIMITS.emotions) {
      throw new BusinessException(ErrorCode.SELECTION_LIMIT, MESSAGES.emotionLimit);
    }
    const visibleEmotions = new Set(
      (await this.chips.visibleChips(ownerId, ChipType.EMOTION)).map((chip) => chip.id.toString()),
    );
    if (emotionChipIds.some((id) => !visibleEmotions.has(id.toString())))
      throw new BusinessException(ErrorCode.NOT_FOUND);

    const rawPhotos = arrayOrEmpty(request.photoUrls);
    if (rawPhotos.length > LIMITS.eventPhotos) {
      throw new BusinessException(ErrorCode.SELECTION_LIMIT, MESSAGES.photoLimit);
    }
    const photoUrls = rawPhotos
      .map((value) => {
        if (typeof value !== 'string') return invalidInput();
        return value.trim();
      })
      .filter(Boolean);

    const occurredDate = optionalDate(request.occurredDate) ?? todayInKst();
    notFuture(occurredDate);
    const occurredTime = optionalTime(request.occurredTime);
    const title = optionalText(request.title);
    const memo = optionalText(request.memo);
    if (title !== null) maxLength(title, LIMITS.eventTitle);
    if (memo !== null) maxLength(memo, LIMITS.memo);
    return {
      title,
      memo,
      occurredDate,
      occurredTime,
      categoryChipId,
      weatherChipId,
      emotionChipIds,
      personIds,
      photoUrls,
      persons,
    };
  }

  private async advanceLastMet(
    tx: Prisma.TransactionClient,
    persons: PersonForDerived[],
    occurredDate: string,
    now: Date,
  ): Promise<void> {
    for (const person of persons) {
      const firstMet = person.firstMetDate ? formatDate(person.firstMetDate) : null;
      const lastMet = person.lastMetDate ? formatDate(person.lastMetDate) : null;
      if (firstMet !== null && compareDates(occurredDate, firstMet) < 0) continue;
      if (lastMet === null || compareDates(occurredDate, lastMet) > 0) {
        await tx.person.update({
          where: { id: person.id },
          data: { lastMetDate: parseDate(occurredDate), updatedAt: now },
        });
      }
    }
  }
}

function autoTitle(persons: PersonRef[], category: string): string {
  const representative = persons[0]?.name ?? '';
  const others = persons.length - 1;
  const who = others > 0 ? `${representative} 외 ${others}명` : representative;
  return `${who} · ${category}`;
}

function groupByEvent<Row extends { eventId: bigint }, Value>(
  rows: Row[],
  valueOf: (row: Row) => Value,
): Map<bigint, Value[]> {
  const result = new Map<bigint, Value[]>();
  for (const row of rows) {
    const values = result.get(row.eventId) ?? [];
    values.push(valueOf(row));
    result.set(row.eventId, values);
  }
  return result;
}
