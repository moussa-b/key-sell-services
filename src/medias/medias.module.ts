import { Module } from '@nestjs/common';
import { MediasService } from './medias.service';
import { ConfigService } from '@nestjs/config';
import { MediasRepository } from './medias.repository';
import { MediasHealthIndicator } from './medias-health.indicator';
import { HealthIndicatorService } from '@nestjs/terminus';
import { MediasController } from './medias.controller';

@Module({
  controllers: [MediasController],
  providers: [
    ConfigService,
    MediasRepository,
    MediasService,
    MediasHealthIndicator,
    HealthIndicatorService,
  ],
  exports: [MediasService, MediasHealthIndicator],
})
export class MediasModule {}
