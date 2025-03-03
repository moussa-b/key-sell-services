import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../shared/db/database-service';
import { ConfigService } from '@nestjs/config';
import {
  HealthIndicatorResult,
  HealthIndicatorService,
} from '@nestjs/terminus';

@Injectable()
export class MediasHealthIndicator {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly configService: ConfigService,
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  async isHealthy(): Promise<HealthIndicatorResult> {
    let mediasTableCount = { count: 0 };
    if (this.configService.get<string>('DATABASE_URL')?.length > 0) {
      if (this.configService.get<string>('DATABASE_URL').includes('mysql')) {
        mediasTableCount = await this.databaseService.get(
          'SELECT COUNT(*) AS count FROM information_schema.tables WHERE table_schema = (SELECT DATABASE() AS databaseName) AND table_name = "medias";',
        );
      }
    }
    const isHealthy = mediasTableCount?.count === 1;

    const indicator = this.healthIndicatorService.check('medias');
    if (!isHealthy) {
      return indicator.down({
        isMediaTablePresent: mediasTableCount?.count === 1,
      });
    }
    return indicator.up({
      isMediaTablePresent: true,
    });
  }
}
