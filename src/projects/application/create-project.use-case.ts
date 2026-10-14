import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ProjectEntity } from '../entities/project.entity.js';
import { ProjectMemberEntity } from '../../project-members/entities/project-member.entity.js';
import { UserEntity } from '../../users/entities/user.entity.js';

export type CreateProjectCommand = {
  name: string;
  ownerId: number;
};

@Injectable()
export class CreateProjectUseCase {
  constructor(private readonly dataSource: DataSource) {}

  async execute(command: CreateProjectCommand): Promise<ProjectEntity> {
    return this.dataSource.transaction(async (manager) => {
      const usersRepository = manager.getRepository(UserEntity);
      const projectsRepository = manager.getRepository(ProjectEntity);
      const membersRepository = manager.getRepository(ProjectMemberEntity);

      const owner = await usersRepository.findOneBy({ id: command.ownerId });
      if (!owner) {
        throw new NotFoundException(
          `Пользователь с ID ${command.ownerId} не найден`,
        );
      }

      const project = projectsRepository.create({
        name: command.name,
        ownerId: owner.id,
        owner,
      });
      const savedProject = await projectsRepository.save(project);

      const ownerMembership = membersRepository.create({
        projectId: savedProject.id,
        userId: owner.id,
        role: 'admin',
      });
      await membersRepository.save(ownerMembership);

      return savedProject;
    });
  }
}
