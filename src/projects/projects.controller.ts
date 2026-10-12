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
import { parseIncludeQuery } from './presentation/query/parse-include-query.js';
import { ParsePositiveIntPipe } from '../common/pipes/parse-positive-int.pipe.js';
import { ProjectJsonApiSerializer } from './presentation/json-api/project-json-api.serializer.js';

@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly projectJsonApiSerializer: ProjectJsonApiSerializer,
  ) {}

  @Get()
  @Header('Content-Type', 'application/vnd.api+json')
  async findAll(@Query('include') include?: string) {
    const includeQuery = parseIncludeQuery(include);
    const projects = await this.projectsService.findAll();
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
    const includeQuery = parseIncludeQuery(include);
    const project = await this.projectsService.findOne(id);
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

    const project = await this.projectsService.create({
      name: attributes.name,
      ownerId: Number(ownerIdentifier.id),
    });

    return this.projectJsonApiSerializer.serialize(project, {
      requested: false,
      includes: [],
    });
  }
}
