import { Injectable } from '@nestjs/common';
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

  async create(input: { name: string; ownerId: number }): Promise<ProjectEntity> {
    const owner = await this.usersService.findOne(input.ownerId);
    const project = this.projectsRepository.create({
      name: input.name,
      owner,
    });

    return this.projectsRepository.save(project);
  }
}
