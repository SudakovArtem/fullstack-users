import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtSignOptions } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../users/entities/user.entity.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { SelfUserGuard } from './guards/self-user.guard.js';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([UserEntity]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: config.get<JwtSignOptions['expiresIn']>(
            'JWT_EXPIRES_IN',
            '15m',
          ),
        },
      }),
    }),
  ],
  providers: [JwtAuthGuard, SelfUserGuard],
  exports: [JwtAuthGuard, SelfUserGuard, JwtModule, TypeOrmModule],
})
export class SecurityModule {}
