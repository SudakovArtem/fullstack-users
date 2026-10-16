import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateUserAttributesDto } from './dto/index.js';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity.js';

const PG_UNIQUE_VIOLATION = '23505';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  async findOne(id: number): Promise<UserEntity> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`Пользователь с ID ${id} не найден`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.usersRepository.findOneBy({ email });
  }

  async createWithPassword(input: {
    name: string;
    email: string;
    passwordHash: string;
  }): Promise<UserEntity> {
    const user = this.usersRepository.create({
      name: input.name,
      email: input.email,
      passwordHash: input.passwordHash,
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

    try {
      return await this.usersRepository.save(user);
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException('Email is already taken');
      }
      throw error;
    }
  }

  private isUniqueViolation(error: unknown): boolean {
    if (!(error instanceof QueryFailedError)) return false;
    const driverError = (
      error as QueryFailedError & {
        driverError?: { code?: string };
      }
    ).driverError;
    return driverError?.code === PG_UNIQUE_VIOLATION;
  }
}
