import { BusinessException } from '../common/exception/business-exception';
import { ErrorCode } from '../common/exception/error-code';
import { compareDates, parseDate, parseTime, todayInKst } from './date';

export const LIMITS = {
  name: 20,
  relationType: 20,
  chipName: 10,
  eventTitle: 40,
  preferenceItem: 30,
  memo: 200,
  chipPerKind: 30,
  emotions: 5,
  relationTags: 10,
  preferences: 20,
  eventPhotos: 5,
} as const;

export const MESSAGES = {
  requiredName: '이름을 입력해 주세요.',
  requiredChipName: '칩 이름을 입력해 주세요.',
  requiredPerson: '함께한 사람을 한 명 이상 선택해 주세요.',
  categoryRequired: '카테고리는 최소 1개가 필요해요.',
  emotionLimit: `감정은 최대 ${LIMITS.emotions}개까지 고를 수 있어요.`,
  photoLimit: `사진은 최대 ${LIMITS.eventPhotos}장까지 넣을 수 있어요.`,
  relationTagLimit: `관계 태그는 최대 ${LIMITS.relationTags}개까지 담을 수 있어요.`,
  preferenceLimit: `최대 ${LIMITS.preferences}개까지 담을 수 있어요.`,
} as const;

export function invalidInput(): never {
  throw new BusinessException(ErrorCode.INVALID_INPUT);
}

export function requireString(value: unknown): string {
  if (typeof value !== 'string') return invalidInput();
  return value;
}

export function requiredText(value: unknown, message: string): string {
  if (typeof value !== 'string') throw new BusinessException(ErrorCode.REQUIRED_FIELD, message);
  const normalized = value.trim();
  if (!normalized) throw new BusinessException(ErrorCode.REQUIRED_FIELD, message);
  return normalized;
}

export function optionalText(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'string') return invalidInput();
  return value.trim() || null;
}

export function maxLength(value: string, max: number): void {
  if (value.length > max) {
    throw new BusinessException(ErrorCode.LENGTH_EXCEEDED, `최대 ${max}자까지 쓸 수 있어요.`);
  }
}

export function optionalDate(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'string') return invalidInput();
  try {
    parseDate(value);
    return value;
  } catch {
    return invalidInput();
  }
}

export function optionalTime(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'string') return invalidInput();
  try {
    parseTime(value);
    return value;
  } catch {
    return invalidInput();
  }
}

export function notFuture(value: string, today = todayInKst()): void {
  if (compareDates(value, today) > 0) throw new BusinessException(ErrorCode.FUTURE_DATE);
}

export function validDateOrder(first: string | null, last: string | null): void {
  if (first !== null && last !== null && compareDates(last, first) < 0) {
    throw new BusinessException(ErrorCode.DATE_ORDER);
  }
}

export function booleanOrDefault(value: unknown, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  if (typeof value !== 'boolean') return invalidInput();
  return value;
}

export function arrayOrEmpty(value: unknown): unknown[] {
  if (value === undefined) return [];
  if (!Array.isArray(value)) return invalidInput();
  return value;
}

export function stringList(value: unknown): string[] {
  return arrayOrEmpty(value).map((item) => requireString(item));
}

export function integerId(value: unknown): bigint {
  if (typeof value !== 'number' || !Number.isSafeInteger(value)) return invalidInput();
  return BigInt(value);
}

export function integerIds(value: unknown): bigint[] {
  const result: bigint[] = [];
  const seen = new Set<string>();
  for (const item of arrayOrEmpty(value)) {
    const id = integerId(item);
    const key = id.toString();
    if (!seen.has(key)) {
      result.push(id);
      seen.add(key);
    }
  }
  return result;
}

export function pathId(value: string): bigint {
  if (!/^-?\d+$/.test(value)) return invalidInput();
  try {
    return BigInt(value);
  } catch {
    return invalidInput();
  }
}

export function queryIds(value: string | string[] | undefined): bigint[] {
  if (value === undefined) return [];
  const raw = Array.isArray(value) ? value : [value];
  const flattened = raw.flatMap((item) => item.split(','));
  return flattened.map((item) => pathId(item.trim()));
}
