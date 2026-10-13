export const PROJECT_INCLUDES = ['owner'] as const;

export type ProjectInclude = (typeof PROJECT_INCLUDES)[number];
