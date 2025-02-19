import { Controller, Get, Headers, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CommonService } from './common.service';

@Controller('common')
@UseGuards(JwtAuthGuard)
export class CommonController {
  constructor(private readonly commonService: CommonService) {}

  @ApiOperation({ summary: 'Retrieve the list of supported countries' })
  @ApiResponse({
    status: 200,
    description: 'List of supported countries.',
  })
  @Get('/countries')
  getSupportedCountries(
    @Headers('accept-language') acceptLanguage: string,
  ): Promise<string[]> {
    return this.commonService.getSupportedCountries(acceptLanguage);
  }

  @ApiOperation({ summary: 'Retrieve the list of supported currencies' })
  @ApiResponse({
    status: 200,
    description: 'List of supported currencies.',
  })
  @Get('/currencies')
  getSupportedCurrencies(
    @Headers('accept-language') acceptLanguage: string,
  ): Promise<string[]> {
    return this.commonService.getSupportedCurrencies(acceptLanguage);
  }
}
