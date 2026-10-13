import { IsIn } from 'class-validator';
import type { ProjectMemberRole } from '../entities/project-member.entity.js';

export const PROJECT_MEMBER_ROLES: readonly ProjectMemberRole[] = [
  'admin',
  'member',
  'viewer',
];

export class CreateProjectMemberAttributesDto {
  @IsIn(PROJECT_MEMBER_ROLES, {
    message: `Role must be one of: ${PROJECT_MEMBER_ROLES.join(', ')}`,
  })
  role: ProjectMemberRole;
}
