import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { pathExists, readFile, writeFileSync } from 'fs-extra';
import * as Handlebars from 'handlebars';
import handlebars from 'handlebars';
import * as path from 'path';
import { I18nService } from 'nestjs-i18n';
import { RealEstateType } from '../../real-estates/entities/real-estate-type.enum';
import { Address } from '../models/address.entity';
import { LabelValue } from '../dto/label-value.dto';
import { PDFDocument } from 'pdf-lib';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { AppLoggerService } from '../logger/app-logger.service';
import { exec } from 'child_process';
import { promisify } from 'util';

@Injectable()
export class PdfService {
  private readonly className = PdfService.name;

  constructor(
    private readonly i18nService: I18nService,
    private readonly httpService: HttpService,
    private readonly config: ConfigService,
    private readonly logger: AppLoggerService,
  ) {
    handlebars.registerHelper(
      'formatRealEstateType',
      (type: RealEstateType, options: any) => {
        let key: string;
        switch (type) {
          case RealEstateType.HOUSE:
            key = 'real_estate.house';
            break;
          case RealEstateType.APARTMENT:
            key = 'real_estate.apartment';
            break;
          case RealEstateType.VILLA:
            key = 'real_estate.villa';
            break;
          default:
            key = 'real_estate.other';
            break;
        }
        return this.i18nService.translate(key, {
          lang: options.hash.lang || 'fr',
          args: options.hash,
        });
      },
    );

    handlebars.registerHelper(
      'formatBoolean',
      (value: boolean, options: any) => {
        return this.i18nService.translate(value ? 'common.yes' : 'common.no', {
          lang: options.hash.lang || 'fr',
          args: options.hash,
        });
      },
    );

    handlebars.registerHelper(
      'formatOwners',
      (ownersDetail: LabelValue<number>[], options: any) => {
        if (ownersDetail?.length > 0) {
          return ownersDetail
            .map((ownerDetail: LabelValue<number>) => ownerDetail.label)
            .join(', ');
        } else {
          return this.i18nService.translate('common.not_specified', {
            lang: options.hash.lang || 'fr',
            args: options.hash,
          });
        }
      },
    );

    handlebars.registerHelper('formatAddress', (address: Address) => {
      return this.formatAddress(address);
    });
  }

  private formatAddress(address: Address, unknownLabel = '-'): string {
    if (!address) {
      return unknownLabel;
    }
    let formatedAddress = '';
    if (address.street && address.street.trim().length > 0) {
      formatedAddress += address.street;
    }
    if (address.zipCode && address.zipCode.trim().length > 0) {
      formatedAddress +=
        (formatedAddress.length > 0 ? ' ' : '') + address.zipCode;
    }
    if (address.city && address.city.trim().length > 0) {
      formatedAddress += (formatedAddress.length > 0 ? ' ' : '') + address.city;
    }
    return formatedAddress.length > 0 ? formatedAddress : unknownLabel;
  }

  async generatePdf(
    templateName: string,
    context: any,
    acceptLanguage: string,
    pdfFilesToMerge?: string[],
  ): Promise<Buffer> {
    const templatePath = path.join(
      __dirname,
      'templates',
      `${templateName}.hbs`,
    );
    const templateHtml = await readFile(templatePath, 'utf8');
    const template = Handlebars.compile(templateHtml);
    const fontPath = path.join(__dirname, '..', 'fonts', 'Roboto-Regular.ttf');
    const html = template({ ...context, fontPath, lang: acceptLanguage });
    const pdfBuffer = await this.generatePdfWithWkHtmlToPdf(html);
    const buffer = Buffer.from(pdfBuffer);
    if (pdfFilesToMerge?.length > 0) {
      const pdfBuffers: Buffer[] = [buffer];
      for (const file of pdfFilesToMerge) {
        const pdfBuffer = await readFile(file);
        pdfBuffers.push(pdfBuffer);
      }
      const mergedPdf = await PDFDocument.create();
      for (const pdfBuffer of pdfBuffers) {
        const pdfDoc = await PDFDocument.load(pdfBuffer);
        const pages = await mergedPdf.copyPages(
          pdfDoc,
          pdfDoc.getPageIndices(),
        );
        pages.forEach((page) => mergedPdf.addPage(page));
      }
      const mergedPdfBuffer = await mergedPdf.save();
      return Buffer.from(mergedPdfBuffer);
    } else {
      return buffer;
    }
  }

  async generatePdfWithWkHtmlToPdf(html: string): Promise<Buffer> {
    if (!html) {
      throw new HttpException(
        'PDF generation failed. HTML is required',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    const wkhtmlToPdfServiceUrl = this.config.get<string>(
      'WKHTMLTOPDF_SERVICE_URL',
      '',
    );
    if (wkhtmlToPdfServiceUrl.length > 0) {
      const response = await firstValueFrom(
        this.httpService.post(
          `${wkhtmlToPdfServiceUrl}/generate-pdf`,
          { html },
          { responseType: 'arraybuffer' },
        ),
      );
      return Buffer.from(response.data);
    } else {
      const execAsync = promisify(exec);
      try {
        const { stdout } = await execAsync('wkhtmltopdf --version');
        this.logger.log(
          `wkhtmltopdf is installed. Version: ${stdout.trim()}`,
          this.className,
        );
      } catch (e) {
        this.logger.error(`wkhtmltopdf is not installed`, this.className);
        this.logger.error(e.message, this.className);
        throw new HttpException(
          'PDF generation is not supported',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      const tempPath = this.config.get<string>('TEMP_PATH', '/var/tmp');
      const htmlFilePath = path.join(tempPath, 'temp.html');
      const pdfFilePath = path.join(tempPath, 'output.pdf');
      writeFileSync(htmlFilePath, html);
      await execAsync(`wkhtmltopdf ${htmlFilePath} ${pdfFilePath}`);
      if (pathExists(pdfFilePath)) {
        return await readFile(pdfFilePath);
      } else {
        throw new HttpException(
          'PDF generation failed',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
}
