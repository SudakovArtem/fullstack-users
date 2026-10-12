import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Header,
  ConflictException,
  Patch,
  Delete,
  HttpCode,
} from '@nestjs/common';
import { UsersService } from './users.service.js';
import { CreateUserDocumentDto, UpdateUserDocumentDto } from './dto/index.js';
import { ParsePositiveIntPipe } from '../common/pipes/parse-positive-int.pipe.js';
import { UserJsonApiSerializer } from './presentation/json-api/user-json-api.serializer.js';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly userJsonApiSerializer: UserJsonApiSerializer,
  ) {}

  @Get()
  @Header('Content-Type', 'application/vnd.api+json')
  async findAll() {
    const data = await this.usersService.findAll();
    return this.userJsonApiSerializer.serializeCollection(data);
  }

  @Get(':id')
  @Header('Content-Type', 'application/vnd.api+json')
  async findOne(@Param('id', ParsePositiveIntPipe) id: number) {
    const data = await this.usersService.findOne(id);
    return this.userJsonApiSerializer.serialize(data);
  }

  @Post()
  @Header('Content-Type', 'application/vnd.api+json')
  async create(@Body() document: CreateUserDocumentDto) {
    const { type, attributes } = document.data;
    if (type !== 'users') {
      throw new ConflictException(
        `Resource type "${type}" does not match endpoint "users"`,
      );
    }

    const user = await this.usersService.create(attributes);
    return this.userJsonApiSerializer.serialize(user);
  }

  @Patch(':id')
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

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id', ParsePositiveIntPipe) id: number): Promise<void> {
    await this.usersService.remove(id);
  }
}
