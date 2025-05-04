import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RealEstateDto } from './dto/real-estate.dto';
import { RealEstatesRepository } from './real-estates.repository';
import { LabelValue } from '../shared/dto/label-value.dto';
import { AddressesService } from '../shared/addresses.service';
import { I18nService } from 'nestjs-i18n';
import { readdirSync, readFile, rmdirSync, unlink } from 'fs-extra';
import { Media } from '../medias/entities/media.entity';
import { MediaType } from '../medias/entities/media-type.enum';
import { MediasService } from '../medias/medias.service';
import * as path from 'path';
import { PdfService } from '../shared/pdf/pdf.service';
import { AppLoggerService } from '../shared/logger/app-logger.service';
import { UpdateStatusDto } from './dto/update-status.dto';
import { TasksService } from '../tasks/tasks.service';
import { Task, TaskStatus } from '../tasks/entities/task.entity';
import { CreateTaskDto } from '../tasks/dto/create-task.dto';
import { UsersService } from '../users/users.service';
import { UpdateTaskDto } from '../tasks/dto/update-task.dto';

@Injectable()
export class RealEstatesService {
  public static pictureMaxSize = 2 * 1024 * 1024; // 2Mo
  public static videoMaxSize = 20 * 1024 * 1024; // 20Mo
  public static documentMaxSize = 1024 * 1024; // 1Mo
  public static pictureMaxCount = 10;
  public static videoMaxCount = 1;
  public static documentMaxCount = 5;
  private readonly className = RealEstatesService.name;

  constructor(
    private readonly realEstateRepository: RealEstatesRepository,
    private readonly addressesService: AddressesService,
    private readonly i18nService: I18nService,
    private readonly mediasService: MediasService,
    private readonly pdfService: PdfService,
    private readonly logger: AppLoggerService,
    private readonly tasksService: TasksService,
    private readonly userService: UsersService,
  ) {}

  async create(createRealEstateDto: RealEstateDto): Promise<RealEstateDto> {
    return this.realEstateRepository.create(createRealEstateDto);
  }

  async findAll(): Promise<RealEstateDto[]> {
    return this.realEstateRepository.findAll();
  }

  async checkRealEstateId(realEstateId: string) {
    const realEstate = await this.findOne(+realEstateId, true);
    if (!realEstate) {
      throw new NotFoundException(
        `Real estate with ID ${realEstate} not found`,
      );
    }
  }

  async findOne(
    realEstateId: number,
    includeMediaPath = false,
  ): Promise<RealEstateDto> {
    return this.realEstateRepository.findOne(realEstateId, includeMediaPath);
  }

  async update(
    realEstateId: number,
    updateRealEstateDto: RealEstateDto,
  ): Promise<RealEstateDto> {
    return this.realEstateRepository.update(realEstateId, updateRealEstateDto);
  }

  async updateStatus(
    realEstateId: number,
    updateStatusDto: UpdateStatusDto,
    updatedBy: number,
  ): Promise<RealEstateDto> {
    return this.realEstateRepository.updateStatus(
      realEstateId,
      updateStatusDto,
      updatedBy,
    );
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

  findAllBuyers(): Promise<LabelValue<number>[]> {
    return this.realEstateRepository.findAllBuyers();
  }

  async uploadMedia(
    files: Express.Multer.File[],
    acceptLanguage: string,
    createBy: number,
    realEstateId: number,
    mediaType: MediaType,
  ): Promise<Media[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException(
        this.i18nService.translate('common.no_pictures_attached', {
          lang: acceptLanguage,
        }),
      );
    }
    let authorizedTotalSize: number;
    let authorizedFileCount: number;
    let fileSizeMessage: string;
    let fileCountMessage: string;
    switch (mediaType) {
      case MediaType.IMAGE:
        authorizedTotalSize = RealEstatesService.pictureMaxSize;
        authorizedFileCount = RealEstatesService.pictureMaxCount;
        fileSizeMessage = 'common.picture_max_file_size_exceeded';
        fileCountMessage = 'common.picture_max_file_count_exceeded';
        break;
      case MediaType.VIDEO:
        authorizedTotalSize = RealEstatesService.videoMaxSize;
        fileSizeMessage = 'common.video_max_file_size_exceeded';
        fileCountMessage = 'common.video_max_file_count_exceeded';
        authorizedFileCount = RealEstatesService.videoMaxCount;
        break;
      case MediaType.DOCUMENT:
        authorizedTotalSize = RealEstatesService.documentMaxSize;
        fileSizeMessage = 'common.document_max_file_size_exceeded';
        fileCountMessage = 'common.document_max_file_count_exceeded';
        authorizedFileCount = RealEstatesService.documentMaxCount;
        break;
      default:
        authorizedTotalSize = RealEstatesService.documentMaxSize;
        fileSizeMessage = 'common.document_max_file_size_exceeded';
        authorizedFileCount = RealEstatesService.documentMaxCount;
        fileCountMessage = 'common.document_max_file_count_exceeded';
        break;
    }
    let totalSize = files.reduce((sum, file) => sum + file.size, 0);
    let fileCount = files.length;
    const medias =
      await this.mediasService.findAllMediaByRealEstateIdAndMediaType(
        realEstateId,
        mediaType,
      );
    if (medias?.length > 0) {
      fileCount += medias?.length;
      const mediaSize = medias.reduce(
        (sum: number, media: Media) => sum + media.fileSize,
        0,
      );
      totalSize += mediaSize;
    }
    if (totalSize > authorizedTotalSize || fileCount > authorizedFileCount) {
      for (const file of files) {
        unlink(file.path, (err) => {
          if (err) {
            this.logger.error(
              `Failed to delete file: ${file.path} ${err.message}`,
              this.className,
            );
          }
        });
      }
      throw new BadRequestException(
        this.i18nService.translate(
          fileCount > authorizedFileCount ? fileCountMessage : fileSizeMessage,
          {
            lang: acceptLanguage,
          },
        ),
      );
    }

    const createdMedias: Media[] = [];
    for (const file of files) {
      const media = new Media();
      media.absolutePath = path.resolve(file.path);
      media.fileName = file.originalname;
      media.fileSize = file.size;
      media.mediaType = mediaType;
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

  async export(
    realEstate: RealEstateDto,
    acceptLanguage: string,
  ): Promise<Buffer> {
    const context = { ...realEstate, pictures: [] };
    let pdfFilesToMerge: string[];
    if (realEstate.medias?.length > 0) {
      const images = realEstate.medias
        .filter(
          (m: Media) =>
            m.mediaType === MediaType.IMAGE && m.absolutePath?.length > 0,
        )
        .map((m: Media) => m.absolutePath);
      pdfFilesToMerge = realEstate.medias
        .filter(
          (m: Media) =>
            m.mediaType === MediaType.DOCUMENT && m.absolutePath?.length > 0,
        )
        .map((m: Media) => m.absolutePath);
      if (images.length > 0) {
        context.pictures = await Promise.all(
          images.map(async (file: string) => {
            return await this.convertImageToBase64(file);
          }),
        );
      }
    }
    return await this.pdfService.generatePdf(
      'real-estate',
      context,
      acceptLanguage,
      pdfFilesToMerge,
    );
  }

  private async convertImageToBase64(imagePath: string): Promise<string> {
    const imageBuffer = await readFile(imagePath);
    return `data:image/png;base64,${imageBuffer.toString('base64')}`;
  }

  findAllByRealEstateId(realEstateId: number): Promise<Task[]> {
    return this.tasksService.findAllByRealEstateId(realEstateId);
  }

  createTask(createTaskDto: CreateTaskDto): Promise<Task> {
    return this.tasksService.create(createTaskDto);
  }

  findAllUsers(): Promise<LabelValue<number>[]> {
    return this.userService.findAllUsers();
  }

  updateTask(taskId: number, updateTaskDto: UpdateTaskDto): Promise<Task> {
    return this.tasksService.update(taskId, updateTaskDto);
  }

  updateTaskStatus(
    taskId: number,
    updateTaskStatusDto: { status: TaskStatus; updatedBy: number },
  ): Promise<boolean> {
    return this.tasksService.updateTaskStatus(taskId, updateTaskStatusDto);
  }

  removeTask(taskId: number): Promise<boolean> {
    return this.tasksService.remove(taskId);
  }

  findAllTaskType(lang = 'en'): Promise<LabelValue<number>[]> {
    return this.tasksService.findAllTaskType(lang);
  }
}
