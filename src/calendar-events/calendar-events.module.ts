import { Module } from '@nestjs/common';
import { CalendarEventsService } from './calendar-events.service';
import { CalendarEventsController } from './calendar-events.controller';
import { ConfigService } from '@nestjs/config';
import { CalendarEventsRepository } from './calendar-events.repository';
import { CalendarEventsHealthIndicator } from './calendar-events-health.indicator';
import { HealthIndicatorService } from '@nestjs/terminus';

@Module({
  controllers: [CalendarEventsController],
  providers: [
    ConfigService,
    CalendarEventsRepository,
    CalendarEventsService,
    CalendarEventsHealthIndicator,
    HealthIndicatorService,
  ],
  exports: [CalendarEventsHealthIndicator],
})
export class CalendarEventsModule {}
