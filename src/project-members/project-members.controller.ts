import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProjectMembersService } from './project-members.service.js';
import {
  CreateProjectMemberDocumentDto,
  UpdateProjectMemberDocumentDto,
} from './dto/index.js';
import { ParsePositiveIntPipe } from '../common/pipes/parse-positive-int.pipe.js';
import { ProjectMemberJsonApiSerializer } from './presentation/json-api/project-member-json-api.serializer.js';
import { parseIncludeQuery } from '../common/json-api/parse-include-query.js';
import { PROJECT_MEMBER_INCLUDES } from './presentation/query/project-member-includes.js';
import { UpdateProjectMemberRoleUseCase } from './application/update-project-member-role.use-case.js';
import { RemoveProjectMemberUseCase } from './application/remove-project-member.use-case.js';
import { JwtAuthGuard } from '../security/guards/jwt-auth.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.js';
import { CreateProjectMemberUseCase } from './application/create-project-member.use-case.js';

@Controller('projects/:projectId/members')
export class ProjectMembersController {
  constructor(
    private readonly projectMembersService: ProjectMembersService,
    private readonly createMemberUseCase: CreateProjectMemberUseCase,
    private readonly updateRoleUseCase: UpdateProjectMemberRoleUseCase,
    private readonly removeMemberUseCase: RemoveProjectMemberUseCase,
    private readonly projectMemberJsonApiSerializer: ProjectMemberJsonApiSerializer,
  ) {}

  @Get()
  @Header('Content-Type', 'application/vnd.api+json')
  async findAll(
    @Param('projectId', ParsePositiveIntPipe) projectId: number,
    @Query('include') include?: string,
  ) {
    const includeQuery = parseIncludeQuery(include, PROJECT_MEMBER_INCLUDES);
    const members = await this.projectMembersService.findAllByProject(
      projectId,
      {
        loadUser: includeQuery.includes.includes('user'),
      },
    );
    return this.projectMemberJsonApiSerializer.serializeCollection(
      members,
      projectId,
      includeQuery,
    );
  }

  @Get(':userId')
  @Header('Content-Type', 'application/vnd.api+json')
  async findOne(
    @Param('projectId', ParsePositiveIntPipe) projectId: number,
    @Param('userId', ParsePositiveIntPipe) userId: number,
    @Query('include') include?: string,
  ) {
    const includeQuery = parseIncludeQuery(include, PROJECT_MEMBER_INCLUDES);
    const member = await this.projectMembersService.findOne(projectId, userId, {
      loadUser: includeQuery.includes.includes('user'),
    });
    return this.projectMemberJsonApiSerializer.serialize(member, includeQuery);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @Header('Content-Type', 'application/vnd.api+json')
  async create(
    @Param('projectId', ParsePositiveIntPipe) projectId: number,
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() document: CreateProjectMemberDocumentDto,
  ) {
    const { type, attributes, relationships } = document.data;
    const userIdentifier = relationships.user.data;

    if (type !== 'project-members') {
      throw new ConflictException(
        `Resource type "${type}" does not match endpoint "project-members"`,
      );
    }
    if (userIdentifier.type !== 'users') {
      throw new ConflictException(
        `Related resource type "${userIdentifier.type}" does not match "users"`,
      );
    }

    const member = await this.createMemberUseCase.execute({
      actorUserId: currentUser.id,
      projectId,
      userId: Number(userIdentifier.id),
      role: attributes.role,
    });

    return this.projectMemberJsonApiSerializer.serialize(member, {
      requested: false,
      includes: [],
    });
  }

  @Patch(':userId')
  @UseGuards(JwtAuthGuard)
  @Header('Content-Type', 'application/vnd.api+json')
  async update(
    @Param('projectId', ParsePositiveIntPipe) projectId: number,
    @Param('userId', ParsePositiveIntPipe) userId: number,
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() document: UpdateProjectMemberDocumentDto,
  ) {
    const { type, id: bodyId, attributes } = document.data;

    if (type !== 'project-members') {
      throw new ConflictException(
        `Resource type "${type}" does not match endpoint "project-members"`,
      );
    }
    const expectedId = `${projectId}:${userId}`;
    if (bodyId !== expectedId) {
      throw new ConflictException(
        `Resource id "${bodyId}" does not match URL "${expectedId}"`,
      );
    }

    const member = await this.updateRoleUseCase.execute({
      actorUserId: currentUser.id,
      projectId,
      userId,
      role: attributes.role,
    });
    return this.projectMemberJsonApiSerializer.serialize(member, {
      requested: false,
      includes: [],
    });
  }

  @Delete(':userId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  async remove(
    @Param('projectId', ParsePositiveIntPipe) projectId: number,
    @Param('userId', ParsePositiveIntPipe) userId: number,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<void> {
    await this.removeMemberUseCase.execute({
      actorUserId: currentUser.id,
      projectId,
      userId,
    });
  }
}
