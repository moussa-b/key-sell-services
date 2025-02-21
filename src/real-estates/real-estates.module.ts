import { Module } from '@nestjs/common';
import { RealEstatesService } from './real-estates.service';
import { RealEstatesController } from './real-estates.controller';
import { RealEstatesHealthIndicator } from './real-estates-health.indicator';
import { RealEstatesRepository } from './real-estates.repository';
import { ConfigService } from '@nestjs/config';
import { HealthIndicatorService } from '@nestjs/terminus';

@Module({
  controllers: [RealEstatesController],
  providers: [
    ConfigService,
    RealEstatesRepository,
    RealEstatesService,
    RealEstatesHealthIndicator,
    HealthIndicatorService,
  ],
  exports: [RealEstatesHealthIndicator],
})
export class RealEstatesModule {}
