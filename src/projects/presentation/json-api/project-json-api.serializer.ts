import { ProjectEntity } from '../../entities/project.entity.js';

export class ProjectJsonApiSerializer {
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

  serialize(project: ProjectEntity) {
    const data = this.getProjectResourceObject(project);
    return {
      data,
      links: {
        self: `/projects/${project.id}`,
      },
    };
  }

  serializeCollection(projects: ProjectEntity[]) {
    const data = projects.map((project) => this.getProjectResourceObject(project));
    return {
      data,
      links: {
        self: `/projects`,
      },
    };
  }
}
