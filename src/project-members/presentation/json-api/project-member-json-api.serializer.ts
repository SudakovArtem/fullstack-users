import { Injectable } from '@nestjs/common';
import { ProjectMemberEntity } from '../../entities/project-member.entity.js';

@Injectable()
export class ProjectMemberJsonApiSerializer {
  private getExternalId(member: ProjectMemberEntity): string {
    return `${member.projectId}:${member.userId}`;
  }

  serializeResource(member: ProjectMemberEntity) {
    return {
      type: 'project-members',
      id: this.getExternalId(member),
      attributes: {
        role: member.role,
        joinedAt: member.joinedAt.toISOString(),
      },
      relationships: {
        project: {
          data: { type: 'projects', id: String(member.projectId) },
        },
        user: {
          data: { type: 'users', id: String(member.userId) },
        },
      },
      links: {
        self: `/projects/${member.projectId}/members/${member.userId}`,
      },
    };
  }

  serialize(member: ProjectMemberEntity) {
    return {
      data: this.serializeResource(member),
      links: {
        self: `/projects/${member.projectId}/members/${member.userId}`,
      },
    };
  }
}
