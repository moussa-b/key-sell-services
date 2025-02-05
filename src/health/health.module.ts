import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { TerminusModule } from '@nestjs/terminus';
import { SharedModule } from '../shared/shared.module';
import { UsersModule } from '../users/users.module';
import { ClientsModule } from '../clients/clients.module';
import { CalendarEventsModule } from '../calendar-events/calendar-events.module';

@Module({
  imports: [
    TerminusModule,
    SharedModule,
    UsersModule,
    ClientsModule,
    CalendarEventsModule,
  ],
  controllers: [HealthController],
})
export class HealthModule {}
