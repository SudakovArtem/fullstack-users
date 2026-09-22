import { Injectable } from '@nestjs/common';

const users = [
  { id: 1, name: 'Artem' },
  { id: 2, name: 'Andrey' },
];

@Injectable()
export class UsersService {}
