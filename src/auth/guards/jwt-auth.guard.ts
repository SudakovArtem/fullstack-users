import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AccessTokenPayload } from '../types/access-token-payload.js';
import { UsersService } from '../../users/users.service.js';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
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
      throw new UnauthorizedException('Invalid token payload');
    }

    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException();
    }

    request.user = {
      id: user.id,
    };

    return true;
  }
}
