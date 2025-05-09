import { Request } from 'express';
import { DateUtils } from './date-utils';
import { MediaType } from '../shared/models/media-type.enum';
import { existsSync, mkdirSync } from 'fs-extra';
import { BadRequestException } from '@nestjs/common';

export const identityDocumentMaxSize = 2 * 1024 * 1024; // 2Mo

export const getFilename = (
  req: Request,
  file: Express.Multer.File,
  callback: (error: Error | null, filename: string) => void,
) => {
  callback(
    null,
    `${DateUtils.formatToFileName(new Date())}_${file.originalname}`,
  );
};

export const getDestination = (
  req: Request,
  file: Express.Multer.File,
  callback: (error: Error | null, destination: string) => void,
  mediaType: MediaType,
  additionalFolder?: string,
) => {
  const id = req.params.id || '';
  const uploadspath = process.env.UPLOADS_PATH || './uploads';
  let subfolder: string;
  switch (mediaType) {
    case MediaType.IMAGE:
      subfolder = 'pictures';
      break;
    case MediaType.VIDEO:
      subfolder = 'videos';
      break;
    case MediaType.DOCUMENT:
      subfolder = 'documents';
      break;
    case MediaType.IDENTITY_DOCUMENT:
      subfolder = 'identity_documents';
      break;
    default:
      subfolder = 'documents';
      break;
  }
  const uploadPath = `${uploadspath}/${subfolder}/${additionalFolder?.length > 0 ? additionalFolder + '/' : ''}${id}`;
  if (!existsSync(uploadPath)) {
    mkdirSync(uploadPath, { recursive: true });
  }
  callback(null, uploadPath);
};

export const checkIdentityDocuments = (documents: Express.Multer.File[]) => {
  if (documents?.length) {
    for (const file of documents) {
      const isValidType = /^(image\/(jpe?g|png|gif)|application\/pdf)$/.test(
        file.mimetype,
      );
      const isValidSize = file.size <= identityDocumentMaxSize;
      if (!isValidType) {
        throw new BadRequestException('Invalid file type');
      }
      if (!isValidSize) {
        throw new BadRequestException('File size exceeds the limit');
      }
    }
  }
};
