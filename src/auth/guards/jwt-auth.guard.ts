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

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authorization = request.headers.authorization;
    if (!authorization) {
      throw new UnauthorizedException();
    }

    const [scheme, token] = authorization.split(' ');
    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException();
    }

    let payload: AccessTokenPayload;

    try {
      payload = await this.jwtService.verifyAsync<AccessTokenPayload>(token);
    } catch {
      throw new UnauthorizedException();
    }

    const userId = Number(payload.sub);
    if (Number.isNaN(userId) || userId < 0) {
      throw new UnauthorizedException();
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
