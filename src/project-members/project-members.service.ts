import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import {
  ProjectMemberEntity,
  ProjectMemberRole,
} from './entities/project-member.entity.js';
import { ProjectsService } from '../projects/projects.service.js';
import { UsersService } from '../users/users.service.js';
import { UpdateProjectMemberAttributesDto } from './dto/index.js';

const PG_UNIQUE_VIOLATION = '23505';

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

  async update(
    projectId: number,
    userId: number,
    attributes: UpdateProjectMemberAttributesDto,
  ): Promise<ProjectMemberEntity> {
    const member = await this.findOne(projectId, userId);
    if (attributes.role !== undefined) {
      member.role = attributes.role;
    }

    return this.membersRepository.save(member);
  }

  async remove(projectId: number, userId: number): Promise<void> {
    await this.projectsService.findOne(projectId);
    const result = await this.membersRepository.delete({ projectId, userId });

    if (result.affected === 0) {
      throw new NotFoundException(
        `Пользователь с ID ${userId} не является участником проекта с ID ${projectId}.`,
      );
    }
  }
}
