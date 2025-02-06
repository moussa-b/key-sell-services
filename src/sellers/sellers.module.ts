import { Module } from '@nestjs/common';
import { SellersService } from './sellers.service';
import { SellersController } from './sellers.controller';
import { SellersRepository } from './sellers.repository';
import { SellersHealthIndicator } from './sellers-health.indicator';
import { ConfigService } from '@nestjs/config';
import { HealthIndicatorService } from '@nestjs/terminus';

@Module({
  controllers: [SellersController],
  providers: [
    ConfigService,
    SellersRepository,
    SellersService,
    SellersHealthIndicator,
    HealthIndicatorService,
  ],
  exports: [SellersHealthIndicator],
})
export class SellersModule {}
