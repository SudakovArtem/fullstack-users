import {
  Body,
  ConflictException,
  Controller,
  Get,
  Header,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ProjectsService } from './projects.service.js';
import { CreateProjectDocumentDto } from './dto/index.js';
import { parseIncludeQuery } from '../common/json-api/parse-include-query.js';
import { ParsePositiveIntPipe } from '../common/pipes/parse-positive-int.pipe.js';
import { ProjectJsonApiSerializer } from './presentation/json-api/project-json-api.serializer.js';
import { PROJECT_INCLUDES } from './presentation/query/project-includes.js';
import { CreateProjectUseCase } from './application/create-project.use-case.js';

@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly createProjectUseCase: CreateProjectUseCase,
    private readonly projectJsonApiSerializer: ProjectJsonApiSerializer,
  ) {}

  @Get()
  @Header('Content-Type', 'application/vnd.api+json')
  async findAll(@Query('include') include?: string) {
    const includeQuery = parseIncludeQuery(include, PROJECT_INCLUDES);
    const projects = await this.projectsService.findAll({
      loadOwner: includeQuery.includes.includes('owner'),
    });
    return this.projectJsonApiSerializer.serializeCollection(
      projects,
      includeQuery,
    );
  }

  @Get(':id')
  @Header('Content-Type', 'application/vnd.api+json')
  async findOne(
    @Param('id', ParsePositiveIntPipe) id: number,
    @Query('include') include?: string,
  ) {
    const includeQuery = parseIncludeQuery(include, PROJECT_INCLUDES);
    const project = await this.projectsService.findOne(id, {
      loadOwner: includeQuery.includes.includes('owner'),
    });
    return this.projectJsonApiSerializer.serialize(project, includeQuery);
  }

  @Post()
  @Header('Content-Type', 'application/vnd.api+json')
  async create(@Body() document: CreateProjectDocumentDto) {
    const { type, attributes, relationships } = document.data;
    const ownerIdentifier = relationships.owner.data;

    if (type !== 'projects') {
      throw new ConflictException(
        `Resource type "${type}" does not match endpoint "projects"`,
      );
    }

    if (ownerIdentifier.type !== 'users') {
      throw new ConflictException(
        `Related resource type "${ownerIdentifier.type}" does not match "users"`,
      );
    }

    const project = await this.createProjectUseCase.execute({
      name: attributes.name,
      ownerId: Number(ownerIdentifier.id),
    });

    return this.projectJsonApiSerializer.serialize(project, {
      requested: false,
      includes: [],
    });
  }
}
