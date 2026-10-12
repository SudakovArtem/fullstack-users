import { BadRequestException } from '@nestjs/common';

export const KNOWN_PROJECT_INCLUDES = ['owner'] as const;
export type ProjectInclude = (typeof KNOWN_PROJECT_INCLUDES)[number];

export function parseIncludeQuery(raw: string | undefined): ProjectInclude[] {
  if (!raw) return [];

  const parts = raw
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const result = new Set<ProjectInclude>();

  for (const part of parts) {
    if (!KNOWN_PROJECT_INCLUDES.includes(part as ProjectInclude)) {
      throw new BadRequestException(
        `Unknown include "${part}". Supported: ${KNOWN_PROJECT_INCLUDES.join(', ')}`,
      );
    }
    result.add(part as ProjectInclude);
  }

  return [...result];
}
