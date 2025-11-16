// guards/jwt-or-api-key.guard.ts
import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import * as Sentry from '@sentry/nestjs';
import { Request } from 'express';

import { IS_PUBLIC_KEY } from '@/decorators/unauthenticated.decorator';

@Injectable()
export class JwtOrApiKeyGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // const request = context.switchToHttp().getRequest<Request>();

    // Check if route is public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Try API key authentication first
    // const apiKey = this.extractApiKey(request);

    // if (apiKey) {
    //   const isValidApiKey = await this.apiKeysService.validateApiKey(apiKey);

    //   if (!isValidApiKey) {
    //     throw new UnauthorizedException('Invalid API key');
    //   }

    //   if (!isValidApiKey.user) {
    //     throw new UnauthorizedException('Invalid API key User');
    //   }

    //   const user = isValidApiKey.user;

    //   Sentry.setUser({
    //     id: user.id,
    //     full_name: `${user.first_name} ${user.last_name}`,
    //     email: user.email,
    //     role: user.is_admin ? 'admin' : 'user',
    //   });
    //   Sentry.setTag('auth_method', 'api-key');

    //   const authUser = AuthUserDto.create(user);

    //   // Set the auth user in the request context
    //   RequestContextProvider.setAuthUser(authUser);
    //   // request.user = user;
    //   // request.authMethod = 'api-key';
    //   return true;
    // }

    // If no API key, try JWT authentication
    try {
      const jwtResult = await super.canActivate(context);
      if (jwtResult) {
        Sentry.setTag('auth_method', 'jwt');
        // request.authMethod = 'jwt';
        return true;
      }
    } catch (jwtError) {
      // If route is public and JWT fails, allow access
      if (isPublic) {
        return true;
      }
      throw jwtError;
    }

    // If neither auth method works and route isn't public, deny
    if (!isPublic) {
      throw new UnauthorizedException('Authentication required');
    }

    return true;
  }

  private extractApiKey(request: Request): string | null {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return null;
    }

    // Check for API key format (starts with sk_)
    if (authHeader.startsWith('Bearer sk_')) {
      return authHeader.substring(7);
    }

    // // Also check custom header
    // const apiKeyHeader = request.headers['x-api-key'] as string;

    // console.log('Extracted API Key from x-api-key header:', apiKeyHeader);

    // if ((apiKeyHeader || '').startsWith('sk_')) {
    //   return apiKeyHeader;
    // }

    return null;
  }
}
