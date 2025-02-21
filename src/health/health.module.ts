import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { TerminusModule } from '@nestjs/terminus';
import { SharedModule } from '../shared/shared.module';
import { UsersModule } from '../users/users.module';
import { SellersModule } from '../sellers/sellers.module';
import { CalendarEventsModule } from '../calendar-events/calendar-events.module';
import { BuyersModule } from '../buyers/buyers.module';
import { RealEstatesModule } from '../real-estates/real-estates.module';

@Module({
  imports: [
    TerminusModule,
    SharedModule,
    UsersModule,
    BuyersModule,
    SellersModule,
    CalendarEventsModule,
    RealEstatesModule,
  ],
  controllers: [HealthController],
})
export class HealthModule {}
