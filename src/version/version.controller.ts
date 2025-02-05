import { Controller, Get } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { ApiVersion } from './dto/api-version.dto';

@Controller('version')
export class VersionController {
  @ApiOperation({ summary: 'Retrieve the current application version' })
  @Get()
  getVersion(): ApiVersion {
    const version = require('../../package.json').version;
    return { version };
  }
}
