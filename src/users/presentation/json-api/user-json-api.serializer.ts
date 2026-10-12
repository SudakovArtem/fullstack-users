import { Injectable } from '@nestjs/common';
import { UserEntity } from '../../entities/user.entity.js';

@Injectable()
export class UserJsonApiSerializer {
  serializeResource(user: UserEntity) {
    return {
      type: 'users',
      id: String(user.id),
      attributes: {
        email: user.email,
        name: user.name,
      },
      links: {
        self: `/users/${user.id}`,
      },
    };
  }

  serialize(user: UserEntity) {
    const data = this.serializeResource(user);
    return {
      data,
      links: {
        self: `/users/${user.id}`,
      },
    };
  }

  serializeCollection(users: UserEntity[]) {
    const data = users.map((user) => this.serializeResource(user));
    return {
      data,
      links: {
        self: `/users`,
      },
    };
  }
}
