import { Injectable } from '@nestjs/common';
import {
  HealthIndicatorResult,
  HealthIndicatorService,
} from '@nestjs/terminus';
import { promisify } from 'util';
import { exec } from 'child_process';

@Injectable()
export class PdfHealthIndicator {
  constructor(
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  async isHealthy(): Promise<HealthIndicatorResult> {
    let pdfStatus = false;
    try {
      const execAsync = promisify(exec);
      await execAsync('wkhtmltopdf --version');
      pdfStatus = true;
    } catch (e) {
      pdfStatus = false;
    }
    const indicator = this.healthIndicatorService.check('pdf');
    return pdfStatus ? indicator.up() : indicator.down();
  }
}
