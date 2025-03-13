import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import { existsSync, mkdirSync } from 'fs-extra';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppLoggerService implements LoggerService {
  private logger: winston.Logger;

  constructor(private config: ConfigService) {
    const logDir = this.config.get<string>('LOGS_PATH', './logs');
    if (!existsSync(logDir)) {
      mkdirSync(logDir, { recursive: true });
    }
    winston.addColors({
      error: 'red',
      warn: 'yellow',
      info: 'green',
      debug: 'blue',
      verbose: 'cyan',
    });
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
          return `${timestamp} [${level.toUpperCase()}]: ${message}`;
        }),
      ),
      transports: [
        // Log in console
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize({ all: true }),
          ),
        }),
        // Log in file
        new winston.transports.DailyRotateFile({
          dirname: logDir,
          filename: 'application-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: false,
          maxSize: '20m',
          maxFiles: '14d',
        }),
      ],
    });
  }

  private formatMessage(
    message: string,
    className?: string,
  ): { message: string } {
    return className ? { message: `[${className}] ${message}` } : { message };
  }

  log(message: string, context?: string) {
    this.logger.info(this.formatMessage(message, context));
  }

  error(message: string, context?: string) {
    this.logger.error(this.formatMessage(message, context));
  }

  warn(message: string, context?: string) {
    this.logger.warn(this.formatMessage(message, context));
  }

  debug(message: string, context?: string) {
    this.logger.debug(this.formatMessage(message, context));
  }

  verbose(message: string, context?: string) {
    this.logger.verbose(this.formatMessage(message, context));
  }
}
