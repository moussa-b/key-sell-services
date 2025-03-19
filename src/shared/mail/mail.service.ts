import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import * as hbs from 'nodemailer-express-handlebars'; //does not use latest version 7.0.0 because of error with require when building Docker
import * as path from 'path';
import { ConfigService } from '@nestjs/config';
import { I18nService } from 'nestjs-i18n';
import { MailRepository } from './mail.repository';
import { MailAudit } from './entities/mail-audit.entity';
import { readFile } from 'fs-extra';
import * as handlebars from 'handlebars';
import { AppLoggerService } from '../logger/app-logger.service';

@Injectable()
export class MailService {
  private transporter: Transporter;
  private readonly className = MailService.name;

  constructor(
    private config: ConfigService,
    private readonly i18nService: I18nService,
    private readonly mailRepository: MailRepository,
    private readonly logger: AppLoggerService,
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
          from: this.config.get<string>('EMAIL_USER'),
        },
      );

      handlebars.registerHelper('i18n', (key: string, options: any) => {
        return this.i18nService.translate(key, {
          lang: options.hash.lang || 'fr',
          args: options.hash,
        });
      });

      // Configure Handlebars plugin
      this.transporter.use(
        'compile',
        hbs({
          viewEngine: {
            extname: '.hbs',
            layoutsDir: path.join(__dirname, './templates/'),
            defaultLayout: false,
            partialsDir: path.join(__dirname, './templates/'),
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
    mailAudit?: MailAudit,
  ) {
    if (!this.transporter) {
      return false;
    }
    return this.transporter.sendMail(
      {
        to: to,
        subject: subject,
        ...configuration,
      },
      async (
        err: Error,
        info: { messageId: string; envelope: { from: string; to: string[] } },
      ) => {
        if (err) {
          this.logger.error(err.message, this.className);
        }
        const envelope: { from: string; to: string[] } = info.envelope;
        if (info.envelope) {
          let content: string;
          if (configuration.template) {
            content = await this.compileTemplate(
              configuration.template,
              configuration.context,
            );
          } else {
            content = configuration.text || configuration.html;
          }
          this.mailRepository.create(
            new MailAudit({
              ...(mailAudit ? mailAudit : {}),
              from: envelope.from,
              to: envelope.to,
              messageId: info.messageId,
              subject: subject,
              content: content,
            }),
          );
        }
      },
    );
  }

  async compileTemplate(
    templateName: string,
    context: any,
  ): Promise<string | undefined> {
    const filePath = path.join(__dirname, 'templates', `${templateName}.hbs`);
    try {
      const source = await readFile(filePath, 'utf8');
      const template = handlebars.compile(source);
      return template(context);
    } catch (e) {
      this.logger.error(e.message, this.className);
    }
    return undefined;
  }

  async verifyTransporter(): Promise<boolean> {
    if (!this.transporter) {
      return false;
    }
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      this.logger.log(
        `Mailer check failed with error : ${error}`,
        this.className,
      );
      return false;
    }
  }
}
