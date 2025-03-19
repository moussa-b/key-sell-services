import { Controller, Get, Headers, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CommonService } from './common.service';

@Controller('common')
@UseGuards(JwtAuthGuard)
export class CommonController {
  constructor(private readonly commonService: CommonService) {}

  @Get('/countries')
  getSupportedCountries(
    @Headers('accept-language') acceptLanguage: string,
  ): Promise<string[]> {
    return this.commonService.getSupportedCountries(acceptLanguage);
  }

  @Get('/currencies')
  getSupportedCurrencies(
    @Headers('accept-language') acceptLanguage: string,
  ): Promise<string[]> {
    return this.commonService.getSupportedCurrencies(acceptLanguage);
  }
}
