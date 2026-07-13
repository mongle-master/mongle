import { Injectable } from '@nestjs/common';
import { ChipService } from '../chips/chip.service';
import { BusinessException } from '../common/exception/business-exception';
import { ErrorCode } from '../common/exception/error-code';
import { bytesToUuid, toNumberId } from '../common/prisma';
import { EventRow, EventService } from '../events/event.service';
import { PersonGender } from '../persons/person.dto';
import { PersonService } from '../persons/person.service';
import { PrismaService } from '../prisma/prisma.service';
import { compareDates, daysBetween, formatDate, formatTime, todayInKst } from '../shared/date';
import { Intimacy, IntimacyStatus, PersonNode, RelationMapResponse, ThrowbackResponse } from './home.dto';

@Injectable()
export class HomeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly persons: PersonService,
    private readonly events: EventService,
    private readonly chips: ChipService,
  ) {}

  async relationMap(ownerId: Buffer<ArrayBuffer>, filterTagChipIds: bigint[]): Promise<RelationMapResponse> {
    const user = await this.prisma.user.findUnique({ where: { id: ownerId } });
    if (!user) throw new BusinessException(ErrorCode.NOT_FOUND);

    const all = await this.prisma.person.findMany({
      where: { ownerId, deletedAt: null },
    });
    const tagChipIdsByPerson = await this.persons.relationTagChipIdsByPerson(all);
    const filter = new Set(filterTagChipIds.map(String));
    const selected = all
      .filter(
        (person) =>
          filter.size === 0 || (tagChipIdsByPerson.get(person.id) ?? []).some((id) => filter.has(id.toString())),
      )
      .sort((left, right) => {
        if (left.favorite !== right.favorite) return left.favorite ? -1 : 1;
        const byName = compareText(left.name.toLowerCase(), right.name.toLowerCase());
        if (byName !== 0) return byName;
        return left.id < right.id ? -1 : left.id > right.id ? 1 : 0;
      });

    const tagIds = [...new Set([...tagChipIdsByPerson.values()].flat().map((id) => id.toString()))].map(BigInt);
    const tagChips = tagIds.length ? await this.prisma.chip.findMany({ where: { id: { in: tagIds } } }) : [];
    const tagById = new Map(tagChips.map((chip) => [chip.id.toString(), chip]));
    const today = todayInKst();
    const nodes: PersonNode[] = await Promise.all(
      selected.map(async (person) => {
        const stats = await this.persons.statsOf(person);
        return {
          id: toNumberId(person.id),
          name: person.name,
          profileImageUrl: person.profileImageUrl,
          avatarGender: person.gender as PersonGender | null,
          favorite: person.favorite,
          recordCount: stats.recordCount,
          relationTags: (tagChipIdsByPerson.get(person.id) ?? []).flatMap((id) => {
            const chip = tagById.get(id.toString());
            return chip
              ? [
                  {
                    id: toNumberId(id),
                    label: chip.label,
                    color: chip.color,
                  },
                ]
              : [];
          }),
          intimacy: intimacyOf(stats.meetingDatesDesc, today),
          firstMetDate: person.firstMetDate ? formatDate(person.firstMetDate) : null,
        };
      }),
    );
    return {
      me: {
        label: '나',
        id: bytesToUuid(user.id),
        name: user.username,
        profileImageUrl: user.profileImageUrl,
        avatarGender: user.gender as PersonGender | null,
      },
      nodes,
      edges: nodes.map((node) => ({
        personId: node.id,
        distant: node.intimacy.status === IntimacyStatus.DISTANT,
      })),
    };
  }

  async throwback(ownerId: Buffer<ArrayBuffer>): Promise<ThrowbackResponse | null> {
    const today = todayInKst();
    const targetYear = Number(today.slice(0, 4)) - 1;
    const targetMonthDay = today.slice(5);
    const candidates = (
      await this.prisma.event.findMany({
        where: { ownerId, deletedAt: null },
      })
    ).filter((event) => {
      const date = formatDate(event.occurredDate);
      return Number(date.slice(0, 4)) === targetYear && date.slice(5) === targetMonthDay;
    }) as EventRow[];
    if (candidates.length === 0) return null;

    const personIdsByEvent = await this.events.personIdsByEvent(candidates);
    const personIds = [...new Set([...personIdsByEvent.values()].flat().map((id) => id.toString()))].map(BigInt);
    const eventIds = candidates.map((event) => event.id);
    const [people, photos, anniversaryCategoryId] = await Promise.all([
      personIds.length ? this.prisma.person.findMany({ where: { id: { in: personIds } } }) : [],
      this.prisma.eventPhoto.findMany({
        where: { eventId: { in: eventIds } },
        orderBy: [{ eventId: 'asc' }, { photoOrder: 'asc' }],
      }),
      this.chips.anniversaryCategoryId(),
    ]);
    const personById = new Map(people.map((person) => [person.id.toString(), person]));
    const favoriteIds = new Set(people.filter((person) => person.favorite).map((person) => person.id.toString()));
    const photosByEvent = new Map<bigint, string[]>();
    for (const photo of photos) {
      if (photo.url === null) continue;
      const values = photosByEvent.get(photo.eventId) ?? [];
      values.push(photo.url);
      photosByEvent.set(photo.eventId, values);
    }
    const selected = [...candidates].sort((left, right) => {
      const leftFavorite = (personIdsByEvent.get(left.id) ?? []).some((id) => favoriteIds.has(id.toString()));
      const rightFavorite = (personIdsByEvent.get(right.id) ?? []).some((id) => favoriteIds.has(id.toString()));
      if (leftFavorite !== rightFavorite) return leftFavorite ? -1 : 1;
      const leftPhoto = (photosByEvent.get(left.id) ?? []).length > 0;
      const rightPhoto = (photosByEvent.get(right.id) ?? []).length > 0;
      if (leftPhoto !== rightPhoto) return leftPhoto ? -1 : 1;
      const leftAnniversary = anniversaryCategoryId !== null && left.categoryChipId === anniversaryCategoryId;
      const rightAnniversary = anniversaryCategoryId !== null && right.categoryChipId === anniversaryCategoryId;
      if (leftAnniversary !== rightAnniversary) return leftAnniversary ? -1 : 1;
      if (left.occurredTime === null && right.occurredTime !== null) return 1;
      if (left.occurredTime !== null && right.occurredTime === null) return -1;
      if (left.occurredTime !== null && right.occurredTime !== null) {
        const byTime = formatTime(left.occurredTime).localeCompare(formatTime(right.occurredTime));
        if (byTime !== 0) return byTime;
      }
      return left.id < right.id ? -1 : left.id > right.id ? 1 : 0;
    })[0];
    const representativeId = personIdsByEvent.get(selected.id)?.[0];
    if (representativeId === undefined) return null;
    return {
      eventId: toNumberId(selected.id),
      personId: toNumberId(representativeId),
      personName: personById.get(representativeId.toString())?.name ?? '',
      title: selected.title,
      occurredDate: formatDate(selected.occurredDate),
      photoUrl: photosByEvent.get(selected.id)?.[0] ?? null,
    };
  }
}

function intimacyOf(meetingDatesDesc: string[], today: string): Intimacy {
  const lastMet = meetingDatesDesc[0] ?? null;
  const daysSinceLastMeet = lastMet === null ? null : daysBetween(lastMet, today);
  if (meetingDatesDesc.length < 2) {
    return {
      status: IntimacyStatus.UNKNOWN,
      averageIntervalDays: null,
      daysSinceLastMeet,
    };
  }
  const ascending = [...meetingDatesDesc].sort(compareDates);
  const intervals = ascending.slice(1).map((date, index) => daysBetween(ascending[index], date));
  const average = intervals.reduce((sum, days) => sum + days, 0) / intervals.length;
  return {
    status: daysSinceLastMeet! > average * 2 ? IntimacyStatus.DISTANT : IntimacyStatus.NORMAL,
    averageIntervalDays: Math.round(average),
    daysSinceLastMeet,
  };
}

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}
