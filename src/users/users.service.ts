import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/index.js';
import {
  normalizeUserId,
  validateUserDTO,
} from '../common/utils/users.utils.js';

const users = [
  { id: 1, name: 'Artem' },
  { id: 2, name: 'Andrey' },
];

@Injectable()
export class UsersService {
  private newUserId: number;

  constructor() {
    this.newUserId = 3;
  }

  findAll() {
    return users;
  }

  findOne(id: string) {
    const normalizedId = normalizeUserId(id);
    if (!normalizedId) {
      throw new BadRequestException(`Некорректный ID пользователя: ${id}`);
    }

    const user = users.find((user) => user.id === normalizedId);
    if (!user) {
      throw new NotFoundException(`Пользователь с ID ${id} не найден`);
    }

    return user;
  }

  create(data: CreateUserDto) {
    const isValidData = validateUserDTO(data);
    if (!isValidData) {
      throw new BadRequestException(`Некорректные данные пользователя`);
    }

    const newUser = { id: this.newUserId, name: data.name };
    this.newUserId++;
    users.push(newUser);
    return newUser;
  }
}
