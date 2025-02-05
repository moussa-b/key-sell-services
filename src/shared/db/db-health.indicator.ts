import { Injectable } from '@nestjs/common';
import {
  HealthIndicatorResult,
  HealthIndicatorService,
} from '@nestjs/terminus';
import { DatabaseService } from './database-service';

@Injectable()
export class DbHealthIndicator {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  async isHealthy(): Promise<HealthIndicatorResult> {
    const result: { count: number } =
      await this.databaseService.get('SELECT 1 AS count');
    const indicator = this.healthIndicatorService.check('db');
    if (result?.count !== 1) {
      return indicator.down({
        isDbConnected: false,
      });
    }
    return indicator.up({
      isDbConnected: true,
    });
  }
}
