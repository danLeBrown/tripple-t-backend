import {
  Body,
  Controller,
  Get,
  Headers,
  Ip,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { AuditLog } from '@/decorators/audit-log.decorator';

import { UnauthenticatedRoute } from '../../../decorators/unauthenticated.decorator';
import { UpdateUserPasswordDto } from '../users/dto/update-user.dto';
import { UserDto } from '../users/dto/user.dto';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@ApiBearerAuth()
@ApiTags('Authentication')
@Controller({
  version: '1',
  path: 'auth',
})
@AuditLog({ has_sensitive_record: true })
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOkResponse({
    description: 'Login successful',
    type: LoginResponseDto,
  })
  @UnauthenticatedRoute()
  @AuditLog({
    model: 'User',
    action: 'User login',
  })
  @Post('login')
  async login(
    @Body()
    dto: LoginDto,
    @Ip()
    ip: string,
    @Headers('user-agent')
    userAgent: string,
  ) {
    return {
      data: await this.authService.login(dto, ip, userAgent),
    };
  }

  @ApiOkResponse({
    description: 'Refresh token successful',
    type: LoginResponseDto,
  })
  @UnauthenticatedRoute()
  @AuditLog({
    model: 'User',
    action: 'Refresh token',
  })
  @Post('refresh')
  async refresh(
    @Body()
    dto: RefreshTokenDto,
    @Ip()
    ip: string,
    @Headers('user-agent')
    userAgent: string,
  ) {
    return {
      data: await this.authService.refreshToken(
        dto.refresh_token,
        ip,
        userAgent,
      ),
    };
  }

  @ApiOkResponse({
    description: 'Authenticated user',
    type: UserDto,
  })
  @AuditLog({
    model: 'User',
    action: 'Get authenticated user',
  })
  @Get('user')
  async authUser(
    @Headers('Authorization')
    bearerToken: string,
  ) {
    return {
      data: await this.authService.authUser(bearerToken.replace('Bearer ', '')),
    };
  }

  @ApiOkResponse({
    description: 'Password updated successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Password updated successfully',
        },
      },
    },
  })
  @AuditLog({
    model: 'User',
    action: 'Update user password',
  })
  @Patch('users/password')
  async updatePassword(
    @Body()
    dto: UpdateUserPasswordDto,
    @Headers('Authorization')
    bearerToken: string,
  ) {
    const user = await this.authService.authUser(
      bearerToken.replace('Bearer ', ''),
    );

    await this.authService.updatePassword(user.id, dto);

    return {
      message: 'Password updated successfully',
    };
  }
}
