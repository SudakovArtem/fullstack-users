import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/index.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  findAll(): Promise<UserEntity[]> {
    return this.usersRepository.find();
  }

  async findOne(id: number): Promise<UserEntity> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`Пользователь с ID ${id} не найден`);
    }

    return user;
  }

  async create(dto: CreateUserDto) {
    const user = this.usersRepository.create({ name: dto.name });
    const savedUser = await this.usersRepository.save(user);
    return savedUser;
  }
}
