import { MediaType } from '../../shared/models/media-type.enum';

export class Media {
  id: number;
  uuid: string;
  absolutePath: string;
  fileName: string;
  fileSize?: number;
  mediaType?: MediaType;
  mimeType?: string;
  createdBy?: number;
  createdAt: Date;

  constructor(obj?: { [key: string]: any }) {
    if (!obj) {
      return;
    }
    this.id = obj['id'];
    this.uuid = obj['uuid'];
    this.absolutePath = obj['absolute_path'];
    this.fileName = obj['file_name'];
    this.fileSize = obj['file_size'];
    this.mediaType = obj['media_type'];
    this.mimeType = obj['mime_type'];
    this.createdBy = obj['created_by'];
    this.createdAt =
      obj['created_at'] instanceof Date ? obj['created_at'] : undefined;
  }
}
