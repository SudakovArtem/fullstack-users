import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectMemberEntity } from './entities/project-member.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectMemberEntity])],
})
export class ProjectMembersModule {}
