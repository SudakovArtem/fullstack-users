import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { UsersService } from '../users/users.service.js';
import { UserEntity } from '../users/entities/user.entity.js';
import { RegisterDto, LoginDto } from './dto/index.js';

export type AccessTokenPayload = {
  sub: string;
};

export type LoginResult = {
  accessToken: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<UserEntity> {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email is already registered');
    }

    const passwordHash = await argon2.hash(dto.password);

    try {
      return await this.usersService.createWithPassword({
        name: dto.name,
        email: dto.email,
        passwordHash,
      });
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException('Email is already registered');
      }
      throw error;
    }
  }

  async login(dto: LoginDto): Promise<LoginResult> {
    const user = await this.usersService.findByEmail(dto.email);

    const invalidCredentials = () =>
      new UnauthorizedException('Invalid email or password');

    if (!user) {
      throw invalidCredentials();
    }

    if (user.passwordHash === null) {
      throw invalidCredentials();
    }

    const passwordMatches = await argon2.verify(
      user.passwordHash,
      dto.password,
    );
    if (!passwordMatches) {
      throw invalidCredentials();
    }

    const payload: AccessTokenPayload = {
      sub: String(user.id),
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return { accessToken };
  }

  private isUniqueViolation(error: unknown): boolean {
    if (typeof error !== 'object' || error === null) return false;
    const driverError = (error as { driverError?: { code?: string } })
      .driverError;
    return driverError?.code === '23505';
  }
}
