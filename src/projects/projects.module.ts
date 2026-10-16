import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectEntity } from './entities/project.entity.js';
import { UsersModule } from '../users/users.module.js';
import { ProjectsService } from './projects.service.js';
import { ProjectsController } from './projects.controller.js';
import { ProjectJsonApiSerializer } from './presentation/json-api/project-json-api.serializer.js';
import { CreateProjectUseCase } from './application/create-project.use-case.js';
import { SecurityModule } from '../security/security.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProjectEntity]),
    UsersModule,
    SecurityModule,
  ],
  providers: [ProjectsService, ProjectJsonApiSerializer, CreateProjectUseCase],
  controllers: [ProjectsController],
  exports: [ProjectsService],
})
export class ProjectsModule {}
