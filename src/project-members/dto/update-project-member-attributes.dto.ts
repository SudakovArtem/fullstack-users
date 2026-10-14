import { IsIn, ValidateIf } from 'class-validator';
import type { ProjectMemberRole } from '../entities/project-member.entity.js';
import { PROJECT_MEMBER_ROLES } from './create-project-member-attributes.dto.js';

export class UpdateProjectMemberAttributesDto {
  @ValidateIf((_, value) => value !== undefined)
  @IsIn(PROJECT_MEMBER_ROLES, {
    message: `Role must be one of: ${PROJECT_MEMBER_ROLES.join(', ')}`,
  })
  role?: ProjectMemberRole;
}
