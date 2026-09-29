import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { CreateUserDto } from './dto/index.js';
import { ParsePositiveIntPipe } from '../common/pipes/parse-positive-int.pipe.js';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParsePositiveIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
}
