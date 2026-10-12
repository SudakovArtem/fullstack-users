import { Injectable } from '@nestjs/common';
import { ProjectEntity } from '../../entities/project.entity.js';
import type { ProjectInclude } from '../query/parse-include-query.js';
import { UserJsonApiSerializer } from '../../../users/presentation/json-api/user-json-api.serializer.js';

@Injectable()
export class ProjectJsonApiSerializer {
  constructor(private readonly userJsonApiSerializer: UserJsonApiSerializer) {}

  private getProjectResourceObject(project: ProjectEntity) {
    return {
      type: 'projects',
      id: String(project.id),
      attributes: {
        name: project.name,
      },
      relationships: {
        owner: {
          data: {
            type: 'users',
            id: String(project.owner.id),
          },
        },
      },
      links: {
        self: `/projects/${project.id}`,
      },
    };
  }

  private buildIncluded(projects: ProjectEntity[], includes: ProjectInclude[]) {
    if (includes.length === 0) return undefined;

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

    return included.length > 0 ? included : undefined;
  }

  serialize(project: ProjectEntity, includes: ProjectInclude[] = []) {
    const data = this.getProjectResourceObject(project);
    const included = this.buildIncluded([project], includes);

    return {
      data,
      ...(included ? { included } : {}),
      links: {
        self: `/projects/${project.id}`,
      },
    };
  }

  serializeCollection(
    projects: ProjectEntity[],
    includes: ProjectInclude[] = [],
  ) {
    const data = projects.map((project) =>
      this.getProjectResourceObject(project),
    );
    const included = this.buildIncluded(projects, includes);

    return {
      data,
      ...(included ? { included } : {}),
      links: {
        self: `/projects`,
      },
    };
  }
}
