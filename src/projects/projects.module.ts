import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectEntity } from './entities/project.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectEntity])],
})
export class ProjectsModule {}
