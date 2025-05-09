import { Module } from '@nestjs/common';
import { BuyersService } from './buyers.service';
import { BuyersController } from './buyers.controller';
import { ConfigService } from '@nestjs/config';
import { BuyersRepository } from './buyers.repository';
import { BuyersHealthIndicator } from './buyers-health.indicator';
import { HealthIndicatorService } from '@nestjs/terminus';
import { MediasModule } from '../medias/medias.module';

@Module({
  imports: [MediasModule],
  controllers: [BuyersController],
  providers: [
    ConfigService,
    BuyersRepository,
    BuyersService,
    BuyersHealthIndicator,
    HealthIndicatorService,
  ],
  exports: [BuyersHealthIndicator],
})
export class BuyersModule {}
