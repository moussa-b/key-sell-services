import { Global, Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { SellersModule } from './sellers/sellers.module';
import { SharedModule } from './shared/shared.module';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { VersionModule } from './version/version.module';
import { CalendarEventsModule } from './calendar-events/calendar-events.module';
import { BuyersModule } from './buyers/buyers.module';
import { RealEstatesModule } from './real-estates/real-estates.module';
import { MediasModule } from './medias/medias.module';
import { TasksModule } from './tasks/tasks.module';

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
    TasksModule,
    RealEstatesModule,
    MediasModule,
  ],
})
export class AppModule {}
