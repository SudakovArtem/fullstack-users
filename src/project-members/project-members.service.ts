import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import {
  ProjectMemberEntity,
  ProjectMemberRole,
} from './entities/project-member.entity.js';
import { ProjectsService } from '../projects/projects.service.js';
import { UsersService } from '../users/users.service.js';

const PG_UNIQUE_VIOLATION = '23505';

@Injectable()
export class ProjectMembersService {
  constructor(
    @InjectRepository(ProjectMemberEntity)
    private readonly membersRepository: Repository<ProjectMemberEntity>,
    private readonly projectsService: ProjectsService,
    private readonly usersService: UsersService,
  ) {}

  async create(input: {
    projectId: number;
    userId: number;
    role: ProjectMemberRole;
  }): Promise<ProjectMemberEntity> {
    await this.projectsService.findOne(input.projectId);
    await this.usersService.findOne(input.userId);

    const member = this.membersRepository.create({
      projectId: input.projectId,
      userId: input.userId,
      role: input.role,
    });

    try {
      await this.membersRepository.insert(member);
      return member;
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException(
          `User ${input.userId} is already a member of project ${input.projectId}`,
        );
      }
      throw error;
    }
  }

  private isUniqueViolation(error: unknown): boolean {
    if (!(error instanceof QueryFailedError)) {
      return false;
    }

    const driverError = error.driverError as { code?: string } | undefined;
    return driverError?.code === PG_UNIQUE_VIOLATION;
  }
}
