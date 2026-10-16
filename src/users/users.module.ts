import { Module } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { UsersController } from './users.controller.js';
import { UserEntity } from './entities/user.entity.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserJsonApiSerializer } from './presentation/json-api/user-json-api.serializer.js';
import { SecurityModule } from '../security/security.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), SecurityModule],
  providers: [UsersService, UserJsonApiSerializer],
  controllers: [UsersController],
  exports: [UsersService, UserJsonApiSerializer],
})
export class UsersModule {}
