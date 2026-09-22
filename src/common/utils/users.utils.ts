import { CreateUserDto } from '../../users/dto/index.js';

export function validateUsersRequestId(id: string): boolean {
  return /^\d+$/.test(id);
}

export function normalizeUserId(id: string): number | null {
  const isValidId = validateUsersRequestId(id);
  if (!isValidId) {
    return null;
  }

  const userId = Number(id);
  if (isNaN(userId) || !Number.isInteger(userId) || userId <= 0) {
    return null;
  }

  return userId;
}

export function validateUserDTO(user: CreateUserDto): boolean {
  if (!user || typeof user !== 'object') {
    return false;
  }

  if (!user.name || typeof user.name !== 'string') {
    return false;
  }

  return !!user.name.trimEnd();
}
