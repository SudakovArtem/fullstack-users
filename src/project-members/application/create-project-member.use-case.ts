import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, QueryFailedError } from 'typeorm';
import { ProjectEntity } from '../../projects/entities/project.entity.js';
import { UserEntity } from '../../users/entities/user.entity.js';
import {
  ProjectMemberEntity,
  ProjectMemberRole,
} from '../entities/project-member.entity.js';

const PG_UNIQUE_VIOLATION = '23505';

export type CreateProjectMemberCommand = {
  actorUserId: number;
  projectId: number;
  userId: number;
  role: ProjectMemberRole;
};

@Injectable()
export class CreateProjectMemberUseCase {
  constructor(private readonly dataSource: DataSource) {}

  async execute(command: CreateProjectMemberCommand): Promise<ProjectMemberEntity> {
    return this.dataSource.transaction(async (manager) => {
      const projectsRepository = manager.getRepository(ProjectEntity);
      const membersRepository = manager.getRepository(ProjectMemberEntity);
      const usersRepository = manager.getRepository(UserEntity);

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
          'Only project admins can add members',
        );
      }

      const targetUser = await usersRepository.findOneBy({ id: command.userId });
      if (!targetUser) {
        throw new NotFoundException(
          `Пользователь с ID ${command.userId} не найден`,
        );
      }

      const member = membersRepository.create({
        projectId: command.projectId,
        userId: command.userId,
        role: command.role,
      });

      try {
        await membersRepository.insert(member);
        return member;
      } catch (error) {
        if (this.isUniqueViolation(error)) {
          throw new ConflictException(
            `User ${command.userId} is already a member of project ${command.projectId}`,
          );
        }
        throw error;
      }
    });
  }

  private isUniqueViolation(error: unknown): boolean {
    if (!(error instanceof QueryFailedError)) return false;
    const driverError = (error as QueryFailedError & {
      driverError?: { code?: string };
    }).driverError;
    return driverError?.code === PG_UNIQUE_VIOLATION;
  }
}
