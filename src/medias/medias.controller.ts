import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Res,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MediasService } from './medias.service';
import { createReadStream, existsSync } from 'fs';
import { Response } from 'express';

@Controller('medias')
@UseGuards(JwtAuthGuard)
export class MediasController {
  constructor(private readonly mediasService: MediasService) {}

  @Get('pictures/:uuid')
  async getPicture(@Param('uuid') mediaUuid: string, @Res() res: Response) {
    const media = await this.mediasService.findOneByUuid(mediaUuid, true);
    if (!media) {
      throw new NotFoundException(`Media with UUID ${mediaUuid} not found`);
    }
    if (!existsSync(media.absolutePath)) {
      throw new NotFoundException(`Media with UUID ${mediaUuid} not found`);
    }

    const fileStream = createReadStream(media.absolutePath);
    fileStream.pipe(res);
  }
}
