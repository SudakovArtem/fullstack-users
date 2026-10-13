export const PROJECT_MEMBER_INCLUDES = ['user'] as const;

export type ProjectMemberInclude = (typeof PROJECT_MEMBER_INCLUDES)[number];
