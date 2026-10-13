import {
  Body,
  ConflictException,
  Controller,
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
