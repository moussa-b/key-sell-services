import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { RealEstateDto } from './dto/real-estate.dto';
import { RealEstatesRepository } from './real-estates.repository';
import { LabelValue } from '../shared/dto/label-value.dto';
import { AddressesService } from '../shared/addresses.service';
import { I18nService } from 'nestjs-i18n';
import * as fs from 'fs';
import { unlink } from 'fs';
import { Media } from '../medias/entities/media.entity';
import { MediaType } from '../medias/entities/media-type.enum';
import { MediasService } from '../medias/medias.service';
import * as path from 'path';

@Injectable()
export class RealEstatesService {
  public static pictureMaxSize = 2 * 1024 * 1024;
  public static videoMaxSize = 20 * 1024 * 1024;
  public static documentMaxSize = 1024 * 1024;

  private readonly logger = new Logger(RealEstatesService.name);

  constructor(
    private readonly realEstateRepository: RealEstatesRepository,
    private readonly addressesService: AddressesService,
    private readonly i18nService: I18nService,
    private readonly mediasService: MediasService,
  ) {}

  async create(createRealEstateDto: RealEstateDto): Promise<RealEstateDto> {
    return this.realEstateRepository.create(createRealEstateDto);
  }

  async findAll(): Promise<RealEstateDto[]> {
    return this.realEstateRepository.findAll();
  }

  async findOne(realEstateId: number): Promise<RealEstateDto> {
    return this.realEstateRepository.findOne(realEstateId);
  }

  async update(
    realEstateId: number,
    updateRealEstateDto: RealEstateDto,
  ): Promise<RealEstateDto> {
    return this.realEstateRepository.update(realEstateId, updateRealEstateDto);
  }

  async remove(realEstateId: number, addressId: number): Promise<boolean> {
    if (addressId > 0) {
      this.addressesService.remove(addressId);
    }
    return this.realEstateRepository.remove(realEstateId);
  }

  findAllOwners(): Promise<LabelValue<number>[]> {
    return this.realEstateRepository.findAllOwners();
  }

  async uploadMedia(
    files: Express.Multer.File[],
    acceptLanguage: string,
    createBy: number,
    realEstateId: string,
    mediaType: MediaType,
  ): Promise<Media[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException(
        this.i18nService.translate('common.no_pictures_attached', {
          lang: acceptLanguage,
        }),
      );
    }
    let authorizedTotalSize = 0;
    let errorMessage: string;
    switch (mediaType) {
      case MediaType.IMAGE:
        authorizedTotalSize = RealEstatesService.pictureMaxSize; // 2Mo
        errorMessage = 'common.picture_max_file_size_exceeded';
        break;
      case MediaType.VIDEO:
        authorizedTotalSize = RealEstatesService.videoMaxSize; // 20Mo
        errorMessage = 'common.video_max_file_size_exceeded';
        break;
      case MediaType.DOCUMENT:
        authorizedTotalSize = RealEstatesService.documentMaxSize; // 1Mo
        errorMessage = 'common.document_max_file_size_exceeded';
        break;
      default:
        authorizedTotalSize = RealEstatesService.documentMaxSize;
        errorMessage = 'common.document_max_file_size_exceeded';
        break;
    }
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > authorizedTotalSize) {
      for (const file of files) {
        unlink(file.path, (err) => {
          if (err) {
            this.logger.error(`Failed to delete file: ${file.path}`, err);
          }
        });
      }
      throw new BadRequestException(
        this.i18nService.translate(errorMessage, {
          lang: acceptLanguage,
        }),
      );
    }

    const createdMedias: Media[] = [];
    for (const file of files) {
      const media = new Media();
      media.absolutePath = path.resolve(file.path);
      media.fileName = file.originalname;
      media.fileSize = file.size;
      media.mediaType = MediaType.IMAGE;
      media.mimeType = file.mimetype;
      media.createdBy = createBy;
      createdMedias.push(await this.mediasService.create(media));
    }

    this.realEstateRepository.linkMediaToRealEstate(
      realEstateId,
      createdMedias,
    );

    return createdMedias;
  }

  async removePicture(media: Media) {
    const result = await this.mediasService.remove(media.id);
    unlink(media.absolutePath, (err) => {
      if (err) {
        this.logger.error(`Failed to delete file: ${media.absolutePath}`, err);
      }
    });
    this.removeFolderIfEmpty(path.dirname(media.absolutePath));
    return result;
  }

  removeFolderIfEmpty(folderPath: string) {
    try {
      const files = fs.readdirSync(folderPath);
      if (files.length === 0) {
        fs.rmdirSync(folderPath); // Remove the empty folder
      }
    } catch (err) {
      this.logger.error(`Failed to delete folder: ${folderPath}`, err);
    }
  }
}
