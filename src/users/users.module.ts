import { Module } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { UsersController } from './users.controller.js';
import { UserEntity } from './entities/user.entity.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserJsonApiSerializer } from './presentation/json-api/user-json-api.serializer.js';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  providers: [UsersService, UserJsonApiSerializer],
  controllers: [UsersController],
})
export class UsersModule {}
