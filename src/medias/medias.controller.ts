import { Controller, Delete, Get, Param, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MediasService } from './medias.service';
import { createReadStream } from 'fs-extra';
import { Response } from 'express';
import { ResponseStatus } from '../shared/dto/response-status.dto';

@Controller('medias')
@UseGuards(JwtAuthGuard)
export class MediasController {
  constructor(private readonly mediasService: MediasService) {}

  @Get(':uuid')
  async getPicture(@Param('uuid') mediaUuid: string, @Res() res: Response) {
    const media = await this.mediasService.checkAndFindMediaByUuid(mediaUuid);
    res.setHeader('Content-Type', `${media.mimeType}`);
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${media.fileName}"`,
    );
    const fileStream = createReadStream(media.absolutePath);
    fileStream.pipe(res);
  }

  @Delete(':uuid')
  async remove(@Param('uuid') mediaUuid: string): Promise<ResponseStatus> {
    const media = await this.mediasService.checkAndFindMediaByUuid(mediaUuid);
    return {
      status: await this.mediasService.remove(media),
    };
  }
}
