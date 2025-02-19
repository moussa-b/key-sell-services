import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class CommonService {
  constructor(private readonly i18nService: I18nService) {}

  getSupportedCountries(acceptLanguage: string): Promise<string[]> {
    acceptLanguage = acceptLanguage === 'en' ? 'en' : 'fr';
    return Promise.resolve(
      this.i18nService.translate('common.supported_countries', {
        lang: acceptLanguage,
      }),
    );
  }

  getSupportedCurrencies(acceptLanguage: string): Promise<string[]> {
    acceptLanguage = acceptLanguage === 'en' ? 'en' : 'fr';
    return Promise.resolve(
      this.i18nService.translate('common.supported_currencies', {
        lang: acceptLanguage,
      }),
    );
  }
}
