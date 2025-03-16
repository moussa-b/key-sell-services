import { Global, Module } from '@nestjs/common';
import { MailService } from './mail/mail.service';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { DbHealthIndicator } from './db/db-health.indicator';
import { APP_GUARD } from '@nestjs/core';
import { MailHealthIndicator } from './mail/mail-health.indicator';
import { MysqlService } from './db/mysql.service';
import { DatabaseService } from './db/database-service';
import { HealthIndicatorService } from '@nestjs/terminus';
import { KnexService } from './db/knex.service';
import { AcceptLanguageResolver, I18nModule } from 'nestjs-i18n';
import { join } from 'path';
import { MailRepository } from './mail/mail.repository';
import { AddressesRepository } from './addresses.repository';
import { AddressesService } from './addresses.service';
import { CommonController } from './common.controller';
import { CommonService } from './common.service';
import { PdfService } from './pdf/pdf.service';
import { AppLoggerService } from './logger/app-logger.service';
import { HttpModule } from '@nestjs/axios';

@Global()
@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    ConfigModule.forRoot(),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: join(__dirname, '../i18n/'),
        watch: true,
      },
      resolvers: [AcceptLanguageResolver],
    }),
    HttpModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    MailService,
    DbHealthIndicator,
    MailHealthIndicator,
    {
      provide: DatabaseService,
      useClass: MysqlService,
    },
    HealthIndicatorService,
    KnexService,
    MailRepository,
    AddressesRepository,
    AddressesService,
    CommonService,
    PdfService,
    AppLoggerService,
  ],
  exports: [
    DatabaseService,
    MailService,
    DbHealthIndicator,
    MailHealthIndicator,
    AddressesRepository,
    AddressesService,
    PdfService,
    AppLoggerService,
  ],
  controllers: [CommonController],
})
export class SharedModule {}
