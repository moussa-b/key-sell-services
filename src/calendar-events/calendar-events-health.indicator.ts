import { Injectable } from '@nestjs/common';
import {
  HealthIndicatorResult,
  HealthIndicatorService,
} from '@nestjs/terminus';
import { DatabaseService } from '../shared/db/database-service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CalendarEventsHealthIndicator {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly configService: ConfigService,
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  async isHealthy(): Promise<HealthIndicatorResult> {
    let calendarEventTableCount = { count: 0 };
    if (this.configService.get<string>('DATABASE_URL')?.length > 0) {
      if (this.configService.get<string>('DATABASE_URL').includes('mysql')) {
        calendarEventTableCount = await this.databaseService.get(
          'SELECT COUNT(*) AS count FROM information_schema.tables WHERE table_schema = (SELECT DATABASE() AS databaseName) AND table_name = "calendar_events";',
        );
      }
    } else {
      //sqlite
      calendarEventTableCount = await this.databaseService.get(
        'SELECT count(*) as count FROM sqlite_master WHERE type="table" AND name="calendar_events"',
      );
    }
    const indicator = this.healthIndicatorService.check('calendarEvents');
    if (calendarEventTableCount?.count !== 1) {
      return indicator.down({
        isCalendarEventTablePresent: false,
      });
    }
    return indicator.up({
      isCalendarEventTablePresent: true,
    });
  }
}
