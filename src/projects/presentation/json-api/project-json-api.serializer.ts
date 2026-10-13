import { Injectable } from '@nestjs/common';
import { ProjectEntity } from '../../entities/project.entity.js';
import { UserJsonApiSerializer } from '../../../users/presentation/json-api/user-json-api.serializer.js';
import type { IncludeQuery } from '../../../common/json-api/parse-include-query.js';
import { PROJECT_INCLUDES, ProjectInclude } from '../query/project-includes.js';

@Injectable()
export class ProjectJsonApiSerializer {
  constructor(private readonly userJsonApiSerializer: UserJsonApiSerializer) {}

  private getProjectResourceObject(project: ProjectEntity) {
    return {
      type: 'projects',
      id: String(project.id),
      attributes: { name: project.name },
      relationships: {
        owner: {
          data: { type: 'users', id: String(project.ownerId) },
        },
      },
      links: { self: `/projects/${project.id}` },
    };
  }

  private buildIncluded(projects: ProjectEntity[], includes: ProjectInclude[]) {
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

    for (const project of projects) {
      if (includes.includes('owner') && project.owner) {
        pushUnique(this.userJsonApiSerializer.serializeResource(project.owner));
      }
    }

    return included;
  }

  private buildDocument(
    data: unknown,
    projectsForIncluded: ProjectEntity[],
    include: IncludeQuery<typeof PROJECT_INCLUDES>,
    selfLink: string,
  ) {
    const document: Record<string, unknown> = { data };

    if (include.requested) {
      document.included = this.buildIncluded(
        projectsForIncluded,
        include.includes,
      );
    }

    document.links = { self: selfLink };

    return document;
  }

  serialize(
    project: ProjectEntity,
    include: IncludeQuery<typeof PROJECT_INCLUDES>,
  ) {
    return this.buildDocument(
      this.getProjectResourceObject(project),
      [project],
      include,
      `/projects/${project.id}`,
    );
  }

  serializeCollection(
    projects: ProjectEntity[],
    include: IncludeQuery<typeof PROJECT_INCLUDES>,
  ) {
    return this.buildDocument(
      projects.map((project) => this.getProjectResourceObject(project)),
      projects,
      include,
      '/projects',
    );
  }
}
