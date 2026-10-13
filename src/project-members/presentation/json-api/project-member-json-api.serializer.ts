import { Injectable } from '@nestjs/common';
import { ProjectMemberEntity } from '../../entities/project-member.entity.js';
import { UserJsonApiSerializer } from '../../../users/presentation/json-api/user-json-api.serializer.js';
import type { IncludeQuery } from '../../../common/json-api/parse-include-query.js';
import {
  ProjectMemberInclude,
  PROJECT_MEMBER_INCLUDES,
} from '../query/project-member-includes.js';

@Injectable()
export class ProjectMemberJsonApiSerializer {
  constructor(private readonly userJsonApiSerializer: UserJsonApiSerializer) {}

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

  private buildIncluded(
    members: ProjectMemberEntity[],
    includes: ProjectMemberInclude[],
  ) {
    const seen = new Set<string>();
    const included: ReturnType<UserJsonApiSerializer['serializeResource']>[] =
      [];

    const pushUnique = (
      resource: ReturnType<UserJsonApiSerializer['serializeResource']>,
    ) => {
      const key = `${resource.type}:${resource.id}`;
      if (seen.has(key)) return;
      seen.add(key);
      included.push(resource);
    };

    for (const project of members) {
      if (includes.includes('user') && project.user) {
        pushUnique(this.userJsonApiSerializer.serializeResource(project.user));
      }
    }

    return included;
  }

  private buildDocument(
    data: unknown,
    projectMembersForIncluded: ProjectMemberEntity[],
    include: IncludeQuery<typeof PROJECT_MEMBER_INCLUDES>,
    selfLink: string,
  ) {
    const document: Record<string, unknown> = { data };

    if (include.requested) {
      document.included = this.buildIncluded(
        projectMembersForIncluded,
        include.includes,
      );
    }

    document.links = { self: selfLink };

    return document;
  }

  serialize(
    member: ProjectMemberEntity,
    include: IncludeQuery<typeof PROJECT_MEMBER_INCLUDES>,
  ) {
    return this.buildDocument(
      this.serializeResource(member),
      [member],
      include,
      `/projects/${member.projectId}/members/${member.userId}`,
    );
  }

  serializeCollection(
    members: ProjectMemberEntity[],
    projectId: number,
    include: IncludeQuery<typeof PROJECT_MEMBER_INCLUDES>,
  ) {
    return this.buildDocument(
      members.map((member) => this.serializeResource(member)),
      members,
      include,
      `/projects/${projectId}/members`,
    );
  }
}
