import { Injectable } from '@nestjs/common';
import {
  HealthIndicatorResult,
  HealthIndicatorService,
} from '@nestjs/terminus';
import { DatabaseService } from '../shared/db/database-service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BuyersHealthIndicator {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly configService: ConfigService,
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  async isHealthy(): Promise<HealthIndicatorResult> {
    let buyerTableCount = { count: 0 };
    if (this.configService.get<string>('DATABASE_URL')?.length > 0) {
      if (this.configService.get<string>('DATABASE_URL').includes('mysql')) {
        buyerTableCount = await this.databaseService.get(
          'SELECT COUNT(*) AS count FROM information_schema.tables WHERE table_schema = (SELECT DATABASE() AS databaseName) AND table_name = "buyers";',
        );
      }
    }
    const indicator = this.healthIndicatorService.check('buyers');
    if (buyerTableCount?.count !== 1) {
      return indicator.down({
        isBuyerTablePresent: false,
      });
    }
    return indicator.up({
      isBuyerTablePresent: true,
    });
  }
}
