import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import * as hbs from 'nodemailer-express-handlebars'; //does not use latest version 7.0.0 because of error with require when building Docker
import * as path from 'path';
import { ConfigService } from '@nestjs/config';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class MailService {
  private transporter: Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor(
    private config: ConfigService,
    private readonly i18nService: I18nService,
  ) {
    if (
      this.config.get<string>('EMAIL_SMTP_HOST')?.length > 0 &&
      Number(this.config.get<string>('EMAIL_SMTP_PORT')) > 0 &&
      this.config.get<string>('EMAIL_USER')?.length > 0 &&
      this.config.get<string>('EMAIL_PASSWORD')?.length > 0
    ) {
      this.transporter = nodemailer.createTransport(
        {
          host: this.config.get<string>('EMAIL_SMTP_HOST'),
          port: Number(this.config.get<string>('EMAIL_SMTP_PORT')),
          secure: this.config.get<string>('EMAIL_SMTP_SECURE') === 'true',
          auth: {
            user: this.config.get<string>('EMAIL_USER'),
            pass: this.config.get<string>('EMAIL_PASSWORD'),
          },
        },
        {
          from: '"No Reply" <noreply@example.com>',
        },
      );

      // Configure Handlebars plugin
      this.transporter.use(
        'compile',
        hbs({
          viewEngine: {
            extname: '.hbs',
            layoutsDir: path.join(__dirname, './templates/'),
            defaultLayout: false,
            partialsDir: path.join(__dirname, './templates/'),
            helpers: {
              i18n: (key: string, options: any) => {
                // Translation helper
                return this.i18nService.translate(key, {
                  lang: options.hash.lang || 'fr',
                  args: options.hash,
                });
              },
            },
          },
          viewPath: path.join(__dirname, './templates/'),
          extName: '.hbs',
        }),
      );
    }
  }

  async sendEmail(
    to: string,
    subject: string,
    configuration: {
      template?: string;
      text?: string;
      html?: string;
      context?: any;
    },
  ) {
    if (!this.transporter) {
      return false;
    }
    return await this.transporter.sendMail({
      to: to,
      subject: subject,
      ...configuration,
    });
  }

  async verifyTransporter(): Promise<boolean> {
    if (!this.transporter) {
      return false;
    }
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      this.logger.log('Mailer check failed with error : ', error);
      return false;
    }
  }
}
