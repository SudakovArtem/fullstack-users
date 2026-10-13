import { BadRequestException } from '@nestjs/common';

export type IncludeQuery<T extends readonly string[]> = {
  requested: boolean;
  includes: T[number][];
};

export function parseIncludeQuery<T extends readonly string[]>(
  raw: string | undefined,
  allowedIncludes: T,
): IncludeQuery<T> {
  if (raw === undefined) {
    return { requested: false, includes: [] };
  }

  const parts = raw
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const result = new Set<T[number]>();

  for (const part of parts) {
    if (!allowedIncludes.includes(part)) {
      throw new BadRequestException(
        `Unknown include "${part}". Supported: ${allowedIncludes.join(', ')}`,
      );
    }
    result.add(part);
  }

  return { requested: true, includes: [...result] };
}
