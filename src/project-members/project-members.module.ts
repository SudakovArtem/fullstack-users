import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectMemberEntity } from './entities/project-member.entity.js';
import { ProjectsModule } from '../projects/projects.module.js';
import { UsersModule } from '../users/users.module.js';
import { ProjectMembersController } from './project-members.controller.js';
import { ProjectMembersService } from './project-members.service.js';
import { ProjectMemberJsonApiSerializer } from './presentation/json-api/project-member-json-api.serializer.js';
import { UpdateProjectMemberRoleUseCase } from './application/update-project-member-role.use-case.js';
import { RemoveProjectMemberUseCase } from './application/remove-project-member.use-case.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProjectMemberEntity]),
    ProjectsModule,
    UsersModule,
  ],
  controllers: [ProjectMembersController],
  providers: [
    ProjectMembersService,
    UpdateProjectMemberRoleUseCase,
    RemoveProjectMemberUseCase,
    ProjectMemberJsonApiSerializer,
  ],
})
export class ProjectMembersModule {}
