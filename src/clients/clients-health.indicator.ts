import { Injectable } from '@nestjs/common';
import {
  HealthIndicatorResult,
  HealthIndicatorService,
} from '@nestjs/terminus';
import { DatabaseService } from '../shared/db/database-service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ClientsHealthIndicator {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly configService: ConfigService,
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  async isHealthy(): Promise<HealthIndicatorResult> {
    let clientTableCount = { count: 0 };
    if (this.configService.get<string>('DATABASE_URL')?.length > 0) {
      if (this.configService.get<string>('DATABASE_URL').includes('mysql')) {
        clientTableCount = await this.databaseService.get(
          'SELECT COUNT(*) AS count FROM information_schema.tables WHERE table_schema = (SELECT DATABASE() AS databaseName) AND table_name = "clients";',
        );
      }
    }
    const indicator = this.healthIndicatorService.check('clients');
    if (clientTableCount?.count !== 1) {
      return indicator.down({
        isClientTablePresent: false,
      });
    }
    return indicator.up({
      isClientTablePresent: true,
    });
  }
}
