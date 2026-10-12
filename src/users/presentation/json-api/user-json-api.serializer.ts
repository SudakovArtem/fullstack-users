import { UserEntity } from '../../entities/user.entity.js';

export class UserJsonApiSerializer {
  private getUserResourceObject(data: UserEntity) {
    return {
      type: 'users',
      id: String(data.id),
      attributes: {
        email: data.email,
        name: data.name,
      },
      links: {
        self: `/users/${data.id}`,
      },
    };
  }

  serialize(user: UserEntity) {
    const data = this.getUserResourceObject(user);
    return {
      data,
      links: {
        self: `/users/${data.id}`,
      },
    };
  }

  serializeCollection(users: UserEntity[]) {
    const data = users.map((user) => this.getUserResourceObject(user));
    return {
      data,
      links: {
        self: `/users`,
      },
    };
  }
}
