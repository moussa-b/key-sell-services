import { Module } from '@nestjs/common';
import { RealEstatesService } from './real-estates.service';
import { RealEstatesController } from './real-estates.controller';
import { RealEstatesHealthIndicator } from './real-estates-health.indicator';
import { RealEstatesRepository } from './real-estates.repository';
import { ConfigService } from '@nestjs/config';
import { HealthIndicatorService } from '@nestjs/terminus';
import { MediasModule } from '../medias/medias.module';
import { TasksModule } from '../tasks/tasks.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [MediasModule, UsersModule, TasksModule],
  providers: [
    ConfigService,
    RealEstatesRepository,
    RealEstatesService,
    RealEstatesHealthIndicator,
    HealthIndicatorService,
  ],
  controllers: [RealEstatesController],
  exports: [RealEstatesHealthIndicator],
})
export class RealEstatesModule {}
