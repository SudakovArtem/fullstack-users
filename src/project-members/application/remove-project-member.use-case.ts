import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ProjectEntity } from '../../projects/entities/project.entity.js';
import { ProjectMemberEntity } from '../entities/project-member.entity.js';

export type RemoveProjectMemberCommand = {
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

      const project = await projectsRepository.findOneBy({
        id: command.projectId,
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

      if (project.ownerId === command.userId) {
        throw new ConflictException(
          'Владельца проекта нельзя удалить из числа участников проекта',
        );
      }

      await membersRepository.remove(member);
    });
  }
}
