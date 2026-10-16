import {
  Body,
  ConflictException,
  Controller,
  Get,
  Header,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service.js';
import { UpdateUserDocumentDto } from './dto/index.js';
import { ParsePositiveIntPipe } from '../common/pipes/parse-positive-int.pipe.js';
import { UserJsonApiSerializer } from './presentation/json-api/user-json-api.serializer.js';
import { JwtAuthGuard } from '../security/guards/jwt-auth.guard.js';
import { SelfUserGuard } from '../security/guards/self-user.guard.js';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly userJsonApiSerializer: UserJsonApiSerializer,
  ) {}

  @Get(':id')
  @UseGuards(JwtAuthGuard, SelfUserGuard)
  @Header('Content-Type', 'application/vnd.api+json')
  async findOne(@Param('id', ParsePositiveIntPipe) id: number) {
    const user = await this.usersService.findOne(id);
    return this.userJsonApiSerializer.serialize(user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, SelfUserGuard)
  @Header('Content-Type', 'application/vnd.api+json')
  async update(
    @Param('id', ParsePositiveIntPipe) id: number,
    @Body() document: UpdateUserDocumentDto,
  ) {
    const { type, id: bodyId, attributes } = document.data;
    if (type !== 'users') {
      throw new ConflictException(
        `Resource type "${type}" does not match endpoint "users"`,
      );
    }

    if (bodyId !== String(id)) {
      throw new ConflictException(
        `Resource id "${bodyId}" does not match URL id "${id}"`,
      );
    }

    const user = await this.usersService.update(id, attributes);
    return this.userJsonApiSerializer.serialize(user);
  }
}
