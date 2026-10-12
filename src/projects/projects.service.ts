import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectEntity } from './entities/project.entity.js';
import { UsersService } from '../users/users.service.js';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(ProjectEntity)
    private readonly projectsRepository: Repository<ProjectEntity>,
    private readonly usersService: UsersService,
  ) {}

  findAll(): Promise<ProjectEntity[]> {
    return this.projectsRepository.find({
      relations: { owner: true },
    });
  }

  async findOne(id: number): Promise<ProjectEntity> {
    const project = await this.projectsRepository.findOne({
      where: { id },
      relations: { owner: true },
    });

    if (!project) {
      throw new NotFoundException(`Проект с ID ${id} не найден`);
    }

    return project;
  }

  async create(input: {
    name: string;
    ownerId: number;
  }): Promise<ProjectEntity> {
    const owner = await this.usersService.findOne(input.ownerId);
    const project = this.projectsRepository.create({
      name: input.name,
      owner,
    });

    const saved = await this.projectsRepository.save(project);
    return this.findOne(saved.id);
  }
}
