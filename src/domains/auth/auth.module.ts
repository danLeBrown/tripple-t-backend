import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppConfigService } from '@/app-configs/app-config.service';

import { AuthController } from './authentication/auth.controller';
import { AuthService } from './authentication/auth.service';
import { JwtStrategy } from './authentication/jwt.strategy';
import { Permission } from './authorization/entities/permission.entity';
import { Role } from './authorization/entities/role.entity';
import { RolePermission } from './authorization/entities/role-permission.entity';
import { UserRole } from './authorization/entities/user-role.entity';
import { PermissionsController } from './authorization/permissions.controller';
import { PermissionsService } from './authorization/permissions.service';
import { RolesController } from './authorization/roles.controller';
import { RolesService } from './authorization/roles.service';
import { User } from './users/entities/user.entity';
import { UserSession } from './users/entities/user-session.entity';
import { UsersCreatedListener } from './users/listeners/users-created.listener';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserSession]),
    TypeOrmModule.forFeature([Role, Permission, RolePermission, UserRole]),
    PassportModule,
    JwtModule.registerAsync({
      useFactory: (configService: AppConfigService) => ({
        privateKey: configService.jwtConfig.privateKey,
        publicKey: configService.jwtConfig.publicKey,
        signOptions: {
          algorithm: 'RS256',
          expiresIn: configService.jwtConfig.expiresIn,
        },
        verifyOptions: { algorithms: ['RS256'] },
      }),
      inject: [AppConfigService],
    }),
  ],
  controllers: [
    UsersController,
    RolesController,
    PermissionsController,
    AuthController,
  ],
  providers: [
    AuthService,
    JwtStrategy,
    UsersService,
    UsersCreatedListener,
    RolesService,
    PermissionsService,
  ],
  exports: [UsersService],
})
export class AuthModule {}
