import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { UsersHealthIndicator } from './users-health.indicator';
import { ConfigService } from '@nestjs/config';
import { HealthIndicatorService } from '@nestjs/terminus';

@Module({
  controllers: [UsersController],
  providers: [
    UsersRepository,
    UsersService,
    UsersHealthIndicator,
    ConfigService,
    HealthIndicatorService,
  ],
  exports: [UsersService, UsersHealthIndicator],
})
export class UsersModule {}
