import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { AuthenticatedUser } from '../../auth/types/authenticated-user.js';

type RequestWithUser = {
  user?: AuthenticatedUser;
  params: { id?: string };
};

@Injectable()
export class SelfUserGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithUser>();

    const actorId = request.user?.id;
    const paramId = request.params.id;

    if (paramId === undefined) return true;

    const paramNum = Number(paramId);
    if (!Number.isInteger(paramNum) || paramNum <= 0) {
      return true;
    }

    if (paramNum !== actorId) {
      throw new NotFoundException(`User ${paramNum} not found`);
    }

    return true;
  }
}
