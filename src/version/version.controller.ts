import { Controller, Get } from '@nestjs/common';
import { ApiVersion } from './dto/api-version.dto';

@Controller('version')
export class VersionController {
  @Get()
  getVersion(): ApiVersion {
    const version = require('../../package.json').version;
    return { version };
  }
}
