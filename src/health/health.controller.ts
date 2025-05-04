import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckResult,
  HealthCheckService,
} from '@nestjs/terminus';
import { DbHealthIndicator } from '../shared/db/db-health.indicator';
import { UsersHealthIndicator } from '../users/users-health.indicator';
import { SellersHealthIndicator } from '../sellers/sellers-health.indicator';
import { MailHealthIndicator } from '../shared/mail/mail-health.indicator';
import { CalendarEventsHealthIndicator } from '../calendar-events/calendar-events-health.indicator';
import { BuyersHealthIndicator } from '../buyers/buyers-health.indicator';
import { RealEstatesHealthIndicator } from '../real-estates/real-estates-health.indicator';
import { MediasHealthIndicator } from '../medias/medias-health.indicator';
import { PdfHealthIndicator } from '../shared/pdf/pdf-health.indicator';
import { TasksHealthIndicator } from '../tasks/tasks-health.indicator';

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly dbHealthIndicator: DbHealthIndicator,
    private readonly usersHealthIndicator: UsersHealthIndicator,
    private readonly sellersHealthIndicator: SellersHealthIndicator,
    private readonly buyersHealthIndicator: BuyersHealthIndicator,
    private readonly mailHealthIndicator: MailHealthIndicator,
    private readonly calendarEventsHealthIndicator: CalendarEventsHealthIndicator,
    private readonly realEstateHealthIndicator: RealEstatesHealthIndicator,
    private readonly mediasHealthIndicator: MediasHealthIndicator,
    private readonly pdfHealthIndicator: PdfHealthIndicator,
    private readonly tasksHealthIndicator: TasksHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  healthCheck(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.dbHealthIndicator.isHealthy(),
      () => this.usersHealthIndicator.isHealthy(),
      () => this.buyersHealthIndicator.isHealthy(),
      () => this.sellersHealthIndicator.isHealthy(),
      () => this.mailHealthIndicator.isHealthy(),
      () => this.calendarEventsHealthIndicator.isHealthy(),
      () => this.realEstateHealthIndicator.isHealthy(),
      () => this.mediasHealthIndicator.isHealthy(),
      () => this.pdfHealthIndicator.isHealthy(),
      () => this.tasksHealthIndicator.isHealthy(),
    ]);
  }
}
