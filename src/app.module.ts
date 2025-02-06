import { Global, Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { SellersModule } from './sellers/sellers.module';
import { SharedModule } from './shared/shared.module';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { VersionModule } from './version/version.module';
import { CalendarEventsModule } from './calendar-events/calendar-events.module';
import { BuyersModule } from './buyers/buyers.module';

@Global()
@Module({
  imports: [
    UsersModule,
    SellersModule,
    SharedModule,
    AuthModule,
    HealthModule,
    VersionModule,
    CalendarEventsModule,
    BuyersModule,
  ],
})
export class AppModule {}
