import { Injectable } from '@nestjs/common';
import { readFile } from 'fs-extra';
import * as path from 'path';
import * as Handlebars from 'handlebars';
import * as puppeteer from 'puppeteer';

@Injectable()
export class PdfService {
  async generatePdf(templateName: string, context: any): Promise<Buffer> {
    const templatePath = path.join(
      __dirname,
      'templates',
      `${templateName}.hbs`,
    );
    const templateHtml = await readFile(templatePath, 'utf8');
    const template = Handlebars.compile(templateHtml);
    const html = template(context);
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
