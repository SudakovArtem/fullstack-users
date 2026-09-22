import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/index.js';

@Injectable()
export class UsersService {
  private newUserId: number;
  private readonly users;

  constructor() {
    this.newUserId = 3;
    this.users = [
      {
        id: 1,
        name: 'Artem',
      },
      {
        id: 2,
        name: 'Andrey',
      },
    ];
  }

  findAll() {
    return this.users;
  }

  findOne(id: number) {
    const user = this.users.find((user) => user.id === id);
    if (!user) {
      throw new NotFoundException(`Пользователь с ID ${id} не найден`);
    }

    return user;
  }

  create(data: CreateUserDto) {
    const newUser = { id: this.newUserId, name: data.name };
    this.newUserId++;
    this.users.push(newUser);
    return newUser;
  }
}
