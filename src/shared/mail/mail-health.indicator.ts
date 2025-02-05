import { Injectable } from '@nestjs/common';
import {
  HealthIndicatorResult,
  HealthIndicatorService,
} from '@nestjs/terminus';
import { MailService } from './mail.service';

@Injectable()
export class MailHealthIndicator {
  constructor(
    private readonly mailService: MailService,
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  async isHealthy(): Promise<HealthIndicatorResult> {
    const emailStatus: boolean = await this.mailService.verifyTransporter();
    const indicator = this.healthIndicatorService.check('mail');
    return emailStatus ? indicator.up() : indicator.down();
  }
}
