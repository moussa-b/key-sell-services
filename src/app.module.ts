import { Global, Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { ClientsModule } from './clients/clients.module';
import { SharedModule } from './shared/shared.module';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { VersionModule } from './version/version.module';
import { CalendarEventsModule } from './calendar-events/calendar-events.module';

@Global()
@Module({
  imports: [
    UsersModule,
    ClientsModule,
    SharedModule,
    AuthModule,
    HealthModule,
    VersionModule,
    CalendarEventsModule,
  ],
})
export class AppModule {}
