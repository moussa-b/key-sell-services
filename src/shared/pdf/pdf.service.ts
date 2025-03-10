import { Injectable } from '@nestjs/common';
import { readFile } from 'fs-extra';
import * as Handlebars from 'handlebars';
import handlebars from 'handlebars';
import puppeteer from 'puppeteer';
import * as path from 'path';
import { I18nService } from 'nestjs-i18n';
import { RealEstateType } from '../../real-estates/entities/real-estate-type.enum';
import { Address } from '../models/address.entity';
import { LabelValue } from '../dto/label-value.dto';

@Injectable()
export class PdfService {
  constructor(private readonly i18nService: I18nService) {
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
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4' });
    await browser.close();
    return Buffer.from(pdfBuffer);
  }

  private async convertImageToBase64(imagePath: string): Promise<string> {
    const imageBuffer = await readFile(imagePath);
    return `data:image/png;base64,${imageBuffer.toString('base64')}`;
  }
}
