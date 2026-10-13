import {
  Body,
  ConflictException,
  Controller,
  Get,
  Header,
  Param,
  Post,
} from '@nestjs/common';
import { ProjectMembersService } from './project-members.service.js';
import { CreateProjectMemberDocumentDto } from './dto/index.js';
import { ParsePositiveIntPipe } from '../common/pipes/parse-positive-int.pipe.js';
import { ProjectMemberJsonApiSerializer } from './presentation/json-api/project-member-json-api.serializer.js';

@Controller('projects/:projectId/members')
export class ProjectMembersController {
  constructor(
    private readonly projectMembersService: ProjectMembersService,
    private readonly projectMemberJsonApiSerializer: ProjectMemberJsonApiSerializer,
  ) {}

  @Get()
  @Header('Content-Type', 'application/vnd.api+json')
  async findAll(@Param('projectId', ParsePositiveIntPipe) projectId: number) {
    const members =
      await this.projectMembersService.findAllByProject(projectId);
    return this.projectMemberJsonApiSerializer.serializeCollection(
      members,
      projectId,
    );
  }

  @Get(':userId')
  @Header('Content-Type', 'application/vnd.api+json')
  async findOne(
    @Param('projectId', ParsePositiveIntPipe) projectId: number,
    @Param('userId', ParsePositiveIntPipe) userId: number,
  ) {
    const member = await this.projectMembersService.findOne(projectId, userId);
    return this.projectMemberJsonApiSerializer.serialize(member);
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

    return this.projectMemberJsonApiSerializer.serialize(member);
  }
}
