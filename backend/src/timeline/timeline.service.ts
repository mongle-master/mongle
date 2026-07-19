import { Injectable } from '@nestjs/common';
import { ChipService } from '../chips/chip.service';
import { EventResponse } from '../events/event.dto';
import { EventRow, EventService } from '../events/event.service';
import { PersonService } from '../persons/person.service';
import { PrismaService } from '../prisma/prisma.service';
import { formatDate, monthKey, todayInKst } from '../shared/date';
import { toNumberId } from '../common/prisma';
import {
  ActivityFlowLane,
  ActivityFlowResponse,
  ActivityLane,
  TimelineCard,
  TimelineMonthGroup,
  TimelinePerson,
  TimelineResponse,
} from './timeline.dto';

const LANES = [
  { lane: ActivityLane.MEETING, label: '만남' },
  { lane: ActivityLane.CONTACT, label: '연락' },
  { lane: ActivityLane.MEMORY, label: '기념일' },
] as const;

@Injectable()
export class TimelineService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventService,
    private readonly persons: PersonService,
    private readonly chips: ChipService,
  ) {}

  async personFeed(
    ownerId: Buffer<ArrayBuffer>,
    personId: bigint,
    categoryChipIds: bigint[],
  ): Promise<EventResponse[]> {
    await this.persons.loadOwned(ownerId, personId);
    const links = await this.prisma.eventPerson.findMany({ where: { personId } });
    const eventIds = links.map((link) => link.eventId);
    if (eventIds.length === 0) return [];
    const events = (await this.prisma.event.findMany({
      where: {
        id: { in: eventIds },
        deletedAt: null,
        ...(categoryChipIds.length > 0 ? { categoryChipId: { in: categoryChipIds } } : {}),
      },
      orderBy: [{ occurredDate: 'desc' }, { id: 'desc' }],
    })) as EventRow[];
    return this.events.toResponses(events);
  }

  async activityFlow(ownerId: Buffer<ArrayBuffer>, personId: bigint): Promise<ActivityFlowResponse> {
    await this.persons.loadOwned(ownerId, personId);
    const links = await this.prisma.eventPerson.findMany({ where: { personId } });
    const eventIds = links.map((link) => link.eventId);
    const events = eventIds.length
      ? await this.prisma.event.findMany({
          where: { id: { in: eventIds }, deletedAt: null },
        })
      : [];

    const months = recentMonths(todayInKst(), 6);
    const laneEntries = await Promise.all(
      LANES.map(async (spec) => ({
        ...spec,
        categoryId: await this.chips.commonCategoryId(spec.label),
      })),
    );
    const categoryIds = new Set(
      laneEntries.flatMap(({ categoryId }) => (categoryId === null ? [] : [categoryId.toString()])),
    );
    const lanes: ActivityFlowLane[] = laneEntries.map((spec) => {
      const activeMonths = new Set(
        events
          .filter((event) => spec.categoryId !== null && event.categoryChipId === spec.categoryId)
          .map((event) => monthKey(formatDate(event.occurredDate))),
      );
      return {
        lane: spec.lane,
        categoryLabel: spec.label,
        present: months.map((month) => activeMonths.has(month)),
      };
    });

    return {
      months,
      lanes,
      hasAnyActivity: events.some((event) => categoryIds.has(event.categoryChipId.toString())),
    };
  }

  async myTimeline(
    ownerId: Buffer<ArrayBuffer>,
    categoryChipIds: bigint[],
    personIds: bigint[],
  ): Promise<TimelineResponse> {
    const categoryFiltered = (await this.prisma.event.findMany({
      where: {
        ownerId,
        deletedAt: null,
        ...(categoryChipIds.length > 0 ? { categoryChipId: { in: categoryChipIds } } : {}),
      },
      orderBy: [{ occurredDate: 'desc' }, { id: 'desc' }],
    })) as EventRow[];
    const personIdsByEvent = await this.events.personIdsByEvent(categoryFiltered);
    const selectedPersonIds = new Set(personIds.map(String));
    const events = categoryFiltered.filter(
      (event) =>
        selectedPersonIds.size === 0 ||
        (personIdsByEvent.get(event.id) ?? []).some((id) => selectedPersonIds.has(id.toString())),
    );
    const bases = await this.events.toResponses(events);
    const allPersonIds = [...new Set(events.flatMap((event) => personIdsByEvent.get(event.id) ?? []))];
    const people = allPersonIds.length
      ? await this.prisma.person.findMany({
          where: { id: { in: allPersonIds } },
        })
      : [];
    const personById = new Map(people.map((person) => [person.id.toString(), person]));

    const groups = new Map<string, TimelineMonthGroup>();
    events.forEach((event, index) => {
      const date = formatDate(event.occurredDate);
      const key = monthKey(date);
      const base = bases[index];
      const personsForCard: TimelinePerson[] = (personIdsByEvent.get(event.id) ?? [])
        .flatMap((id) => {
          const person = personById.get(id.toString());
          return person
            ? [
                {
                  id: toNumberId(person.id),
                  name: person.name,
                  profileImageUrl: person.profileImageUrl,
                  favorite: person.favorite,
                },
              ]
            : [];
        })
        .sort(compareTimelinePersons);
      const card: TimelineCard = {
        id: base.id,
        title: base.title,
        memo: base.memo,
        occurredDate: base.occurredDate,
        occurredTime: base.occurredTime,
        category: base.category,
        weather: base.weather,
        emotions: base.emotions,
        photoUrls: base.photoUrls,
        persons: personsForCard,
      };
      const group = groups.get(key) ?? {
        year: Number(key.slice(0, 4)),
        month: Number(key.slice(5, 7)),
        label: `${Number(key.slice(0, 4))}년 ${Number(key.slice(5, 7))}월`,
        cards: [],
      };
      group.cards.push(card);
      groups.set(key, group);
    });
    return { groups: [...groups.values()] };
  }
}

function recentMonths(today: string, count: number): string[] {
  const year = Number(today.slice(0, 4));
  const month = Number(today.slice(5, 7)) - 1;
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(Date.UTC(year, month - (count - 1 - index), 1));
    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
  });
}

function compareTimelinePersons(left: TimelinePerson, right: TimelinePerson): number {
  if (left.favorite !== right.favorite) return left.favorite ? -1 : 1;
  return left.name < right.name ? -1 : left.name > right.name ? 1 : 0;
}
