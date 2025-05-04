import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { TasksHealthIndicator } from './tasks-health.indicator';
import { ConfigService } from '@nestjs/config';
import { HealthIndicatorService } from '@nestjs/terminus';
import { TasksRepository } from './tasks.repository';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [TasksController],
  providers: [
    TasksRepository,
    TasksService,
    TasksHealthIndicator,
    ConfigService,
    HealthIndicatorService,
  ],
  exports: [TasksService, TasksHealthIndicator],
})
export class TasksModule {}
