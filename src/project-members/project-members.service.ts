import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectMemberEntity } from './entities/project-member.entity.js';
import { ProjectsService } from '../projects/projects.service.js';
import { UsersService } from '../users/users.service.js';


export type FindProjectsMembersOptions = {
  loadUser?: boolean;
};

@Injectable()
export class ProjectMembersService {
  constructor(
    @InjectRepository(ProjectMemberEntity)
    private readonly membersRepository: Repository<ProjectMemberEntity>,
    private readonly projectsService: ProjectsService,
    private readonly usersService: UsersService,
  ) {}

  async findAllByProject(
    projectId: number,
    options?: FindProjectsMembersOptions,
  ): Promise<ProjectMemberEntity[]> {
    await this.projectsService.findOne(projectId);
    return this.membersRepository.find({
      where: { projectId },
      relations: options?.loadUser ? { user: true } : undefined,
    });
  }

  async findOne(
    projectId: number,
    userId: number,
    options?: FindProjectsMembersOptions,
  ): Promise<ProjectMemberEntity> {
    await this.projectsService.findOne(projectId);
    const member = await this.membersRepository.findOne({
      where: { projectId, userId },
      relations: options?.loadUser ? { user: true } : undefined,
    });
    if (!member) {
      throw new NotFoundException(
        `Пользователь с ID ${userId} не является участником проекта с ID ${projectId}.`,
      );
    }

    return member;
  }
}
