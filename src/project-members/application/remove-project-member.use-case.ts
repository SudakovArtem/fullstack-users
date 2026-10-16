import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ProjectEntity } from '../../projects/entities/project.entity.js';
import { ProjectMemberEntity } from '../entities/project-member.entity.js';

export type RemoveProjectMemberCommand = {
  actorUserId: number;
  projectId: number;
  userId: number;
};

@Injectable()
export class RemoveProjectMemberUseCase {
  constructor(private readonly dataSource: DataSource) {}

  async execute(command: RemoveProjectMemberCommand): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
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

      const actorMembership = await membersRepository.findOneBy({
        projectId: command.projectId,
        userId: command.actorUserId,
      });
      if (!actorMembership || actorMembership.role !== 'admin') {
        throw new ForbiddenException(
          'Only project admins can remove members',
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

      if (project.ownerId === command.userId) {
        throw new ConflictException(
          'Project owner cannot be removed from project members',
        );
      }

      await membersRepository.remove(member);
    });
  }
}
