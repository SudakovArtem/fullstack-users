import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AccessTokenPayload } from '../../auth/types/access-token-payload.js';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../../users/entities/user.entity.js';
import { Repository } from 'typeorm';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  private extractTokenFromHeader(
    authorization: string | undefined,
  ): string | undefined {
    if (!authorization) {
      return undefined;
    }

    const parts = authorization.split(' ');
    if (parts.length !== 2) return undefined;

    const [scheme, token] = parts;
    if (scheme !== 'Bearer') {
      return undefined;
    }

    if (token.length === 0) {
      return undefined;
    }

    return token;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authorization = request.headers.authorization;
    if (!authorization) {
      throw new UnauthorizedException();
    }

    const token = this.extractTokenFromHeader(authorization);
    if (!token) {
      throw new UnauthorizedException();
    }

    let payload: AccessTokenPayload;

    try {
      payload = await this.jwtService.verifyAsync<AccessTokenPayload>(token);
    } catch {
      throw new UnauthorizedException();
    }

    const userId = Number(payload.sub);
    if (!Number.isInteger(userId) || userId <= 0) {
      throw new UnauthorizedException();
    }

    const exists = await this.usersRepository.exists({ where: { id: userId } });
    if (!exists) {
      throw new UnauthorizedException();
    }

    request.user = { id: userId };
    return true;
  }
}
