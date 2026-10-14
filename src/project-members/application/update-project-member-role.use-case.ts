import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ProjectEntity } from '../../projects/entities/project.entity.js';
import {
  ProjectMemberEntity,
  ProjectMemberRole,
} from '../entities/project-member.entity.js';

export type UpdateProjectMemberRoleCommand = {
  projectId: number;
  userId: number;
  role?: ProjectMemberRole;
};

@Injectable()
export class UpdateProjectMemberRoleUseCase {
  constructor(private readonly dataSource: DataSource) {}

  async execute(
    command: UpdateProjectMemberRoleCommand,
  ): Promise<ProjectMemberEntity> {
    return this.dataSource.transaction(async (manager) => {
      const projectsRepository = manager.getRepository(ProjectEntity);
      const membersRepository = manager.getRepository(ProjectMemberEntity);

      const project = await projectsRepository.findOne({
        where: { id: command.projectId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!project) {
        throw new NotFoundException(
          `Проект с ID ${command.projectId} не найден`,
        );
      }

      const member = await membersRepository.findOneBy({
        projectId: command.projectId,
        userId: command.userId,
      });
      if (!member) {
        throw new NotFoundException(
          `User ${command.userId} is not a member of project ${command.projectId}`,
        );
      }

      const isOwner = project.ownerId === command.userId;
      if (isOwner && command.role !== undefined && command.role !== 'admin') {
        throw new ConflictException(
          'Project owner must remain an admin member',
        );
      }

      if (command.role !== undefined) {
        member.role = command.role;
      }

      return membersRepository.save(member);
    });
  }
}
