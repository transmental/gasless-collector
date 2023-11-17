import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class OriginCheckGuard implements CanActivate {
  private readonly allowedOrigins = [
    'https://collector-frontend-dev.up.railway.app',
  ];

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const origin = request.headers.origin;
    return origin && this.allowedOrigins.includes(origin);
  }
}
