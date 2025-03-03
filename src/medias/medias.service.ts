import { Injectable } from '@nestjs/common';
import { MediasRepository } from './medias.repository';
import { Media } from './entities/media.entity';

@Injectable()
export class MediasService {
  constructor(private readonly mediasRepository: MediasRepository) {}

  async create(media: Media): Promise<Media> {
    return this.mediasRepository.create(media);
  }

  async findOne(id: number): Promise<Media> {
    return this.mediasRepository.findOne(id);
  }

  async findOneByUuid(uuid: string, includePath = false): Promise<Media> {
    return this.mediasRepository.findOneByUuid(uuid, includePath);
  }

  async remove(id: number): Promise<boolean> {
    return this.mediasRepository.remove(id);
  }
}
