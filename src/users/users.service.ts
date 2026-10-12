import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateUserAttributesDto,
  UpdateUserAttributesDto,
} from './dto/index.js';
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

  async create(attributes: CreateUserAttributesDto): Promise<UserEntity> {
    const user = this.usersRepository.create({
      name: attributes.name,
      email: attributes.email ?? null,
    });
    return this.usersRepository.save(user);
  }

  async update(
    id: number,
    attributes: UpdateUserAttributesDto,
  ): Promise<UserEntity> {
    const user = await this.findOne(id);
    if (attributes.name !== undefined) {
      user.name = attributes.name;
    }

    if (attributes.email !== undefined) {
      user.email = attributes.email;
    }

    return this.usersRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    const result = await this.usersRepository.delete({ id });

    if (result.affected === 0) {
      throw new NotFoundException(`Пользователь с ID ${id} не найден`);
    }
  }
}
