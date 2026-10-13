import {
  Body,
  ConflictException,
  Controller,
  Get,
  Header,
  Param,
  Patch,
  Post,
  Query,
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

@Controller('projects/:projectId/members')
export class ProjectMembersController {
  constructor(
    private readonly projectMembersService: ProjectMembersService,
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
  @Header('Content-Type', 'application/vnd.api+json')
  async create(
    @Param('projectId', ParsePositiveIntPipe) projectId: number,
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

    const member = await this.projectMembersService.create({
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
  @Header('Content-Type', 'application/vnd.api+json')
  async update(
    @Param('projectId', ParsePositiveIntPipe) projectId: number,
    @Param('userId', ParsePositiveIntPipe) userId: number,
    @Body() document: UpdateProjectMemberDocumentDto,
  ) {
    const { type, id: bodyId, attributes } = document.data;
    if (type !== 'project-members') {
      throw new ConflictException(
        `Resource type "${type}" does not match endpoint "project-members"`,
      );
    }

    const [projectBodyId, userBodyId] = bodyId.split(':');

    if (projectBodyId !== String(projectId)) {
      throw new ConflictException(
        `Resource id "${projectBodyId}" does not match URL id "${projectId}"`,
      );
    }

    if (userBodyId !== String(userId)) {
      throw new ConflictException(
        `Resource id "${userBodyId}" does not match URL id "${userId}"`,
      );
    }

    const member = await this.projectMembersService.update(
      projectId,
      userId,
      attributes,
    );
    return this.projectMemberJsonApiSerializer.serialize(member, {
      requested: false,
      includes: [],
    });
  }
}
