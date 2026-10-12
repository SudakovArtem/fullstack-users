import {
  Body,
  ConflictException,
  Controller,
  Header,
  Post,
} from '@nestjs/common';
import { ProjectsService } from './projects.service.js';
import { CreateProjectDocumentDto } from './dto/index.js';
import { ProjectJsonApiSerializer } from './presentation/json-api/project-json-api.serializer.js';

@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly projectJsonApiSerializer: ProjectJsonApiSerializer,
  ) {}

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

    const ownerId = Number(ownerIdentifier.id);

    const project = await this.projectsService.create({
      name: attributes.name,
      ownerId,
    });

    return this.projectJsonApiSerializer.serialize(project);
  }
}
