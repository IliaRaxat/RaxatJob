import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      // Пытаемся активировать аутентификацию
      const result = await super.canActivate(context);
      return result as boolean;
    } catch (error) {
      // Если аутентификация не удалась, все равно разрешаем доступ
      return true;
    }
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    // Если токен недействителен или отсутствует, просто возвращаем null
    // Это позволит эндпоинту работать без аутентификации
    if (err || !user) {
      return null;
    }
    return user;
  }
}
