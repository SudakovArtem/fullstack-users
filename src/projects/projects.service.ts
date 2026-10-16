import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectEntity } from './entities/project.entity.js';

export type FindProjectsOptions = {
  loadOwner?: boolean;
};

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(ProjectEntity)
    private readonly projectsRepository: Repository<ProjectEntity>,
  ) {}

  findAll(options: FindProjectsOptions = {}): Promise<ProjectEntity[]> {
    return this.projectsRepository.find({
      relations: options.loadOwner ? { owner: true } : undefined,
    });
  }

  async findOne(
    id: number,
    options: FindProjectsOptions = {},
  ): Promise<ProjectEntity> {
    const project = await this.projectsRepository.findOne({
      where: { id },
      relations: options.loadOwner ? { owner: true } : undefined,
    });

    if (!project) {
      throw new NotFoundException(`Проект с ID ${id} не найден`);
    }

    return project;
  }

  findAllForUser(
    userId: number,
    options: FindProjectsOptions = {},
  ): Promise<ProjectEntity[]> {
    const qb = this.projectsRepository
      .createQueryBuilder('project')
      .innerJoin('project_members', 'pm', 'pm.project_id = project.id')
      .where('pm.user_id = :userId', { userId });

    if (options.loadOwner) {
      qb.leftJoinAndSelect('project.owner', 'owner');
    }

    return qb.orderBy('project.id', 'ASC').getMany();
  }
}
