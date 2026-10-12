import { Body, Controller, Get, Param, Post, Header } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { CreateUserDto } from './dto/index.js';
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
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
}
