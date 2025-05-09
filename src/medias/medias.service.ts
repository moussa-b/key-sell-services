import { Injectable, NotFoundException } from '@nestjs/common';
import { MediasRepository } from './medias.repository';
import { Media } from './entities/media.entity';
import { MediaType } from '../shared/models/media-type.enum';
import * as path from 'path';
import { readdirSync, existsSync, rmdirSync, unlink } from 'fs-extra';
import { AppLoggerService } from '../shared/logger/app-logger.service';

@Injectable()
export class MediasService {
  private readonly className = MediasService.name;

  constructor(
    private readonly mediasRepository: MediasRepository,
    private readonly logger: AppLoggerService,
  ) {}

  async checkAndFindMediaByUuid(mediaUuid: string) {
    const media = await this.findOneByUuid(mediaUuid, true);
    if (!media) {
      throw new NotFoundException(`Media with UUID ${mediaUuid} not found`);
    }
    if (!existsSync(media.absolutePath)) {
      throw new NotFoundException(`Media with UUID ${mediaUuid} not found`);
    }
    return media;
  }

  async create(media: Media): Promise<Media> {
    return this.mediasRepository.create(media);
  }

  async findOne(id: number): Promise<Media> {
    return this.mediasRepository.findOne(id);
  }

  async findOneByUuid(uuid: string, includePath = false): Promise<Media> {
    return this.mediasRepository.findOneByUuid(uuid, includePath);
  }

  async findAllMediaByRealEstateIdAndMediaType(
    realEstateId: number,
    mediaType: MediaType,
  ): Promise<Media[]> {
    return this.mediasRepository.findAllMediaByRealEstateIdAndMediaType(
      realEstateId,
      mediaType,
    );
  }

  async remove(media: Media): Promise<boolean> {
    const result = this.mediasRepository.remove(media.id);
    await unlink(media.absolutePath, (err) => {
      if (err) {
        this.logger.error(
          `Failed to delete file: ${media.absolutePath} ${err.message}`,
          this.className,
        );
      }
    });
    this.removeFolderIfEmpty(path.dirname(media.absolutePath));
    return result;
  }

  removeFolderIfEmpty(folderPath: string) {
    try {
      const files = readdirSync(folderPath);
      if (files.length === 0) {
        rmdirSync(folderPath); // Remove the empty folder
      }
    } catch (err) {
      this.logger.error(
        `Failed to delete folder: ${folderPath} ${err.message}`,
        this.className,
      );
    }
  }
}
