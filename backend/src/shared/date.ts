const DAY_MS = 86_400_000;
const KST = 'Asia/Seoul';

function pad(value: number, length = 2): string {
  return String(value).padStart(length, '0');
}

function partsInKst(now: Date): Record<string, string> {
  return Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone: KST,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    })
      .formatToParts(now)
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, part.value]),
  );
}

export function todayInKst(now = new Date()): string {
  const parts = partsInKst(now);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

/** MySQL의 zone 없는 datetime에 기존 Spring과 같은 KST 벽시각을 기록한다. */
export function nowAsKstLocalDateTime(now = new Date()): Date {
  const parts = partsInKst(now);
  return new Date(
    Date.UTC(
      Number(parts.year),
      Number(parts.month) - 1,
      Number(parts.day),
      Number(parts.hour),
      Number(parts.minute),
      Number(parts.second),
      now.getMilliseconds(),
    ),
  );
}

export function parseDate(value: unknown): Date {
  if (typeof value !== 'string') throw new TypeError('invalid date');
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) throw new TypeError('invalid date');
  const [, year, month, day] = match;
  const result = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  if (formatDate(result) !== value) throw new TypeError('invalid date');
  return result;
}

export function formatDate(value: Date): string {
  return `${pad(value.getUTCFullYear(), 4)}-${pad(value.getUTCMonth() + 1)}-${pad(value.getUTCDate())}`;
}

export function parseTime(value: unknown): Date {
  if (typeof value !== 'string') throw new TypeError('invalid time');
  const match = /^(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,9}))?)?$/.exec(value);
  if (!match) throw new TypeError('invalid time');
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  const second = Number(match[3] ?? 0);
  const millis = Number((match[4] ?? '').padEnd(3, '0').slice(0, 3) || 0);
  if (hour > 23 || minute > 59 || second > 59) throw new TypeError('invalid time');
  return new Date(Date.UTC(1970, 0, 1, hour, minute, second, millis));
}

export function formatTime(value: Date): string {
  const base = `${pad(value.getUTCHours())}:${pad(value.getUTCMinutes())}:${pad(value.getUTCSeconds())}`;
  const millis = value.getUTCMilliseconds();
  return millis === 0 ? base : `${base}.${pad(millis, 3).replace(/0+$/, '')}`;
}

export function formatLocalDateTime(value: Date | null): string | null {
  if (value === null) return null;
  const base = `${formatDate(value)}T${pad(value.getUTCHours())}:${pad(value.getUTCMinutes())}:${pad(value.getUTCSeconds())}`;
  const millis = value.getUTCMilliseconds();
  return millis === 0 ? base : `${base}.${pad(millis, 3).replace(/0+$/, '')}`;
}

export function daysBetween(earlier: string, later: string): number {
  return Math.round((parseDate(later).getTime() - parseDate(earlier).getTime()) / DAY_MS);
}

export function addDays(value: string, amount: number): string {
  const date = parseDate(value);
  date.setUTCDate(date.getUTCDate() + amount);
  return formatDate(date);
}

export function addMonths(value: string, amount: number): string {
  const source = parseDate(value);
  const targetMonth = source.getUTCMonth() + amount;
  const targetYear = source.getUTCFullYear() + Math.floor(targetMonth / 12);
  const normalizedMonth = ((targetMonth % 12) + 12) % 12;
  const lastDay = new Date(Date.UTC(targetYear, normalizedMonth + 1, 0)).getUTCDate();
  return formatDate(new Date(Date.UTC(targetYear, normalizedMonth, Math.min(source.getUTCDate(), lastDay))));
}

export function monthKey(value: string): string {
  return value.slice(0, 7);
}

export function compareDates(left: string, right: string): number {
  return left.localeCompare(right);
}

export function daysSinceFirstMet(firstMet: string, today: string): number {
  return daysBetween(firstMet, today) + 1;
}

export function acquaintancePeriod(firstMet: string, today: string): string {
  const start = parseDate(firstMet);
  const end = parseDate(today);
  let totalMonths = (end.getUTCFullYear() - start.getUTCFullYear()) * 12 + end.getUTCMonth() - start.getUTCMonth();
  let days = end.getUTCDate() - start.getUTCDate();
  if (totalMonths > 0 && days < 0) {
    totalMonths -= 1;
    days = daysBetween(addMonths(firstMet, totalMonths), today);
  }
  const years = Math.trunc(totalMonths / 12);
  if (years >= 1) return `${years}년`;
  const months = totalMonths % 12;
  if (months >= 1) return `${months}개월`;
  return `${days}일`;
}

export function relativeDate(value: string, today: string): string {
  const days = daysBetween(value, today);
  if (days <= 0) return '오늘';
  if (days === 1) return '어제';
  if (days <= 13) return `${days}일 전`;
  if (days <= 59) return `${Math.floor(days / 7)}주 전`;
  if (days <= 364) return `${Math.floor(days / 30)}개월 전`;
  return `${Math.floor(days / 365)}년 전`;
}
