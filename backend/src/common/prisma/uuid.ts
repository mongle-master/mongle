const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID_PATTERN.test(value);
}

export function uuidToBytes(uuid: string): Buffer<ArrayBuffer> {
  if (!isUuid(uuid)) throw new TypeError('유효하지 않은 UUID입니다.');
  return Buffer.from(uuid.replaceAll('-', ''), 'hex');
}

export function bytesToUuid(bytes: Uint8Array): string {
  const buffer = Buffer.from(bytes);
  if (buffer.length !== 16) throw new TypeError('UUID binary 값은 16바이트여야 합니다.');
  const hex = buffer.toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
