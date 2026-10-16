import {
  Body,
  ConflictException,
  Controller,
  Get,
  Header,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProjectsService } from './projects.service.js';
import { CreateProjectDocumentDto } from './dto/index.js';
import { parseIncludeQuery } from '../common/json-api/parse-include-query.js';
import { ParsePositiveIntPipe } from '../common/pipes/parse-positive-int.pipe.js';
import { ProjectJsonApiSerializer } from './presentation/json-api/project-json-api.serializer.js';
import { PROJECT_INCLUDES } from './presentation/query/project-includes.js';
import { CreateProjectUseCase } from './application/create-project.use-case.js';
import { JwtAuthGuard } from '../security/guards/jwt-auth.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.js';

@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly createProjectUseCase: CreateProjectUseCase,
    private readonly projectJsonApiSerializer: ProjectJsonApiSerializer,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @Header('Content-Type', 'application/vnd.api+json')
  async findAll(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Query('include') include?: string,
  ) {
    const includeQuery = parseIncludeQuery(include, PROJECT_INCLUDES);
    const projects = await this.projectsService.findAllForUser(currentUser.id, {
      loadOwner: includeQuery.includes.includes('owner'),
    });
    return this.projectJsonApiSerializer.serializeCollection(
      projects,
      includeQuery,
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @Header('Content-Type', 'application/vnd.api+json')
  async findOne(
    @Param('id', ParsePositiveIntPipe) id: number,
    @CurrentUser() currentUser: AuthenticatedUser,
    @Query('include') include?: string,
  ) {
    const includeQuery = parseIncludeQuery(include, PROJECT_INCLUDES);
    const project = await this.projectsService.findOneForUser(
      id,
      currentUser.id,
      { loadOwner: includeQuery.includes.includes('owner') },
    );
    return this.projectJsonApiSerializer.serialize(project, includeQuery);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @Header('Content-Type', 'application/vnd.api+json')
  async create(
    @Body() document: CreateProjectDocumentDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    const { type, attributes } = document.data;

    if (type !== 'projects') {
      throw new ConflictException(
        `Resource type "${type}" does not match endpoint "projects"`,
      );
    }

    const project = await this.createProjectUseCase.execute({
      name: attributes.name,
      actorUserId: currentUser.id,
    });

    return this.projectJsonApiSerializer.serialize(project, {
      requested: false,
      includes: [],
    });
  }
}
