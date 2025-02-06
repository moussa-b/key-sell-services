import { Injectable } from '@nestjs/common';
import {
  HealthIndicatorResult,
  HealthIndicatorService,
} from '@nestjs/terminus';
import { DatabaseService } from '../shared/db/database-service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SellersHealthIndicator {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly configService: ConfigService,
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  async isHealthy(): Promise<HealthIndicatorResult> {
    let sellerTableCount = { count: 0 };
    if (this.configService.get<string>('DATABASE_URL')?.length > 0) {
      if (this.configService.get<string>('DATABASE_URL').includes('mysql')) {
        sellerTableCount = await this.databaseService.get(
          'SELECT COUNT(*) AS count FROM information_schema.tables WHERE table_schema = (SELECT DATABASE() AS databaseName) AND table_name = "sellers";',
        );
      }
    }
    const indicator = this.healthIndicatorService.check('sellers');
    if (sellerTableCount?.count !== 1) {
      return indicator.down({
        isSellerTablePresent: false,
      });
    }
    return indicator.up({
      isSellerTablePresent: true,
    });
  }
}
