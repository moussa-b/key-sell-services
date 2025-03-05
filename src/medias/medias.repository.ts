import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../shared/db/database-service';
import { Media } from './entities/media.entity';
import { DateUtils } from '../utils/date-utils';
import { v4 as uuidv4 } from 'uuid';
import { MediaType } from './entities/media-type.enum';

@Injectable()
export class MediasRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  rowMapper(row: any, includePath = false): Media {
    const media = new Media(row);
    if (!media.createdAt) {
      media.createdAt =
        row['created_at'] instanceof Date
          ? row['created_at']
          : DateUtils.createDateFromDatabaseDate(row['created_at']);
    }
    if (!includePath) {
      media.absolutePath = undefined;
    }
    return media;
  }

  async create(media: Media): Promise<Media> {
    const insertQuery = `INSERT INTO medias (uuid, absolute_path, file_name, file_size, media_type, mime_type, created_by)
                         VALUES (?, ?, ?, ?, ?, ?, ?)`;
    return this.databaseService
      .run(insertQuery, [
        uuidv4(),
        media.absolutePath,
        media.fileName,
        media.fileSize,
        media.mediaType,
        media.mimeType,
        media.createdBy,
      ])
      .then((mediaId: number) => {
        return this.findOne(mediaId);
      });
  }

  async findOne(id: number): Promise<Media> {
    return this.databaseService.get<Media>(
      'SELECT * FROM medias WHERE id = ?',
      [id],
      this.rowMapper,
    );
  }

  async findOneByUuid(uuid: string, includePath = false): Promise<Media> {
    return this.databaseService.get<Media>(
      'SELECT * FROM medias WHERE uuid = ?',
      [uuid],
      (row: any) => this.rowMapper(row, includePath),
    );
  }

  async remove(id: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      return this.databaseService
        .run('DELETE FROM medias WHERE id = ?', [id])
        .then(() => {
          this.databaseService
            .get<{ count: number }>(
              'SELECT COUNT(*) as count FROM medias WHERE id = ?',
              [id],
            )
            .then((result: { count: number }) => resolve(result.count === 0))
            .catch((err) => reject(err));
        })
        .catch((err) => reject(err));
    });
  }

  findAllMediaByRealEstateIdAndMediaType(
    realEstateId: number,
    mediaType: MediaType,
  ): Promise<Media[]> {
    return this.databaseService.all<Media>(
      'SELECT m.* FROM real_estates_media rem LEFT JOIN medias m ON m.id = rem.media_id WHERE real_estate_id = ? AND m.media_type = ?',
      [realEstateId, mediaType],
      this.rowMapper,
    );
  }
}
