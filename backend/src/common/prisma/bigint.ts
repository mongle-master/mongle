export function toNumberId(value: bigint): number {
  const id = Number(value);
  if (!Number.isSafeInteger(id)) throw new RangeError(`ID ${value.toString()}는 안전한 JSON number 범위를 벗어납니다.`);
  return id;
}
