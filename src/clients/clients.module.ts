import { Module } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { ClientsController } from './clients.controller';
import { ClientsRepository } from './clients.repository';
import { ClientsHealthIndicator } from './clients-health.indicator';
import { ConfigService } from '@nestjs/config';
import { HealthIndicatorService } from '@nestjs/terminus';

@Module({
  controllers: [ClientsController],
  providers: [
    ConfigService,
    ClientsRepository,
    ClientsService,
    ClientsHealthIndicator,
    HealthIndicatorService,
  ],
  exports: [ClientsHealthIndicator],
})
export class ClientsModule {}
