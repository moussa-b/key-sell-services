import { Injectable } from '@nestjs/common';
import {
  HealthIndicatorResult,
  HealthIndicatorService,
} from '@nestjs/terminus';
import { DatabaseService } from '../shared/db/database-service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TasksHealthIndicator {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly configService: ConfigService,
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  async isHealthy(): Promise<HealthIndicatorResult> {
    let taskTableCount = { count: 0 };
    if (this.configService.get<string>('DATABASE_URL')?.length > 0) {
      if (this.configService.get<string>('DATABASE_URL').includes('mysql')) {
        taskTableCount = await this.databaseService.get(
          'SELECT COUNT(*) AS count FROM information_schema.tables WHERE table_schema = (SELECT DATABASE() AS databaseName) AND table_name = "tasks";',
        );
      }
    }
    const indicator = this.healthIndicatorService.check('tasks');
    if (taskTableCount?.count !== 1) {
      return indicator.down({
        isTaskTablePresent: false,
      });
    }
    return indicator.up({
      isTaskTablePresent: true,
    });
  }
}
