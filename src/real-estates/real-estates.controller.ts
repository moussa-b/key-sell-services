import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  Headers,
  MaxFileSizeValidator,
  NotFoundException,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { RealEstatesService } from './real-estates.service';
import { RealEstateDto } from './dto/real-estate.dto';
import { RealEstate } from './entities/real-estate.entity';
import { ResponseStatus } from '../shared/dto/response-status.dto';
import { LabelValue } from '../shared/dto/label-value.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ConnectedUser } from '../shared/models/current-user';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Request } from 'express';
import { DateUtils } from '../utils/date-utils';
import { existsSync, mkdirSync } from 'fs';
import { Media } from '../medias/entities/media.entity';
import { MediasService } from '../medias/medias.service';
import { MediaType } from '../medias/entities/media-type.enum';

const getFilename = (
  req: Request,
  file: Express.Multer.File,
  callback: (error: Error | null, filename: string) => void,
) => {
  callback(
    null,
    `${DateUtils.formatToFileName(new Date())}_${file.originalname}`,
  );
};

const getDestination = (
  req: Request,
  file: Express.Multer.File,
  callback: (error: Error | null, destination: string) => void,
  mediaType: MediaType,
) => {
  const id = req.params.id;
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
    default:
      subfolder = 'documents';
      break;
  }
  const uploadPath = `${uploadspath}/${subfolder}/${id}`;
  if (!existsSync(uploadPath)) {
    mkdirSync(uploadPath, { recursive: true });
  }
  callback(null, uploadPath);
};

@Controller('real-estates')
@UseGuards(JwtAuthGuard)
export class RealEstatesController {
  constructor(
    private readonly realEstateService: RealEstatesService,
    private readonly mediasService: MediasService,
  ) {}

  @Post()
  create(
    @Body() createRealEstateDto: RealEstateDto,
    @CurrentUser() user: ConnectedUser,
  ): Promise<RealEstateDto> {
    createRealEstateDto.createdBy = user.id;
    return this.realEstateService.create(createRealEstateDto);
  }

  @Get()
  findAll(): Promise<RealEstateDto[]> {
    return this.realEstateService.findAll();
  }

  @Get('owners') // must come before @Get(':id')
  findAllOwners(): Promise<LabelValue<number>[]> {
    return this.realEstateService.findAllOwners();
  }

  @Get(':id')
  findOne(@Param('id') realEstateId: string): Promise<RealEstateDto> {
    return this.realEstateService.findOne(+realEstateId);
  }

  @Patch(':id')
  update(
    @Param('id') realEstateId: string,
    @Body() updateRealEstateDto: RealEstateDto,
  ): Promise<RealEstate> {
    return this.realEstateService.update(+realEstateId, updateRealEstateDto);
  }

  @Delete(':id')
  async remove(@Param('id') realEstateId: string): Promise<ResponseStatus> {
    const realEstate = await this.realEstateService.findOne(+realEstateId);
    if (!realEstate) {
      throw new NotFoundException(
        `Real estate with ID ${realEstateId} not found`,
      );
    }
    return {
      status: await this.realEstateService.remove(
        +realEstateId,
        realEstate.address?.id,
      ),
    };
  }

  @Post(':id/pictures/upload')
  @UseInterceptors(
    FilesInterceptor('pictures[]', 10, {
      storage: diskStorage({
        destination: (
          req: Request,
          file: Express.Multer.File,
          callback: (error: Error | null, destination: string) => void,
        ) => getDestination(req, file, callback, MediaType.IMAGE),
        filename: getFilename,
      }),
    }),
  )
  async uploadPictures(
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: 'image/(jpg|jpeg|png|gif)' }),
          new MaxFileSizeValidator({
            maxSize: RealEstatesService.pictureMaxSize,
          }),
        ],
      }),
    )
    files: Array<Express.Multer.File>,
    @Headers('accept-language') acceptLanguage: string,
    @CurrentUser() user: ConnectedUser,
    @Param('id') realEstateId: string,
  ): Promise<Media[]> {
    return this.realEstateService.uploadMedia(
      files,
      acceptLanguage,
      user.id,
      realEstateId,
      MediaType.IMAGE,
    );
  }

  @Post(':id/videos/upload')
  @UseInterceptors(
    FilesInterceptor('videos[]', 10, {
      storage: diskStorage({
        destination: (
          req: Request,
          file: Express.Multer.File,
          callback: (error: Error | null, destination: string) => void,
        ) => getDestination(req, file, callback, MediaType.VIDEO),
        filename: getFilename,
      }),
    }),
  )
  async uploadVideos(
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: 'video/(mp4|avi|mov|mkv)' }),
          new MaxFileSizeValidator({
            maxSize: RealEstatesService.videoMaxSize,
          }),
        ],
      }),
    )
    files: Array<Express.Multer.File>,
    @Headers('accept-language') acceptLanguage: string,
    @CurrentUser() user: ConnectedUser,
    @Param('id') realEstateId: string,
  ): Promise<Media[]> {
    return this.realEstateService.uploadMedia(
      files,
      acceptLanguage,
      user.id,
      realEstateId,
      MediaType.VIDEO,
    );
  }

  @Post(':id/documents/upload')
  @UseInterceptors(
    FilesInterceptor('documents[]', 10, {
      storage: diskStorage({
        destination: (
          req: Request,
          file: Express.Multer.File,
          callback: (error: Error | null, destination: string) => void,
        ) => getDestination(req, file, callback, MediaType.DOCUMENT),
        filename: getFilename,
      }),
    }),
  )
  async uploadDocuments(
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: 'application/pdf' }),
          new MaxFileSizeValidator({
            maxSize: RealEstatesService.documentMaxSize,
          }),
        ],
      }),
    )
    files: Array<Express.Multer.File>,
    @Headers('accept-language') acceptLanguage: string,
    @CurrentUser() user: ConnectedUser,
    @Param('id') realEstateId: string,
  ): Promise<Media[]> {
    return this.realEstateService.uploadMedia(
      files,
      acceptLanguage,
      user.id,
      realEstateId,
      MediaType.DOCUMENT,
    );
  }

  @Delete(':id/pictures/:uuid')
  @Delete(':id/videos/:uuid')
  @Delete(':id/documents/:uuid')
  async removePicture(
    @Param('id') realEstateId: string,
    @Param('uuid') mediaUuid: string,
  ): Promise<ResponseStatus> {
    const realEstate = await this.realEstateService.findOne(+realEstateId);
    if (!realEstate) {
      throw new NotFoundException(
        `Real estate with ID ${realEstateId} not found`,
      );
    }
    const media = await this.mediasService.findOneByUuid(mediaUuid, true);
    if (!media) {
      throw new NotFoundException(`Media with UUID ${mediaUuid} not found`);
    }
    return {
      status: await this.realEstateService.removePicture(media),
    };
  }
}
