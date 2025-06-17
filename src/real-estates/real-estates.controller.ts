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
  Res,
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
import { Request, Response } from 'express';
import { DateUtils } from '../utils/date-utils';
import { Media } from '../medias/entities/media.entity';
import { MediasService } from '../medias/medias.service';
import { MediaType } from '../shared/models/media-type.enum';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { UpdateStatusDto } from './dto/update-status.dto';
import { Task, TaskStatus } from '../tasks/entities/task.entity';
import { CreateTaskDto } from '../tasks/dto/create-task.dto';
import { UpdateTaskDto } from '../tasks/dto/update-task.dto';
import { getDestination, getFilename } from '../utils/file-upload.utils';

@Controller('real-estates')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RealEstatesController {
  constructor(
    private readonly realEstateService: RealEstatesService,
    private readonly mediasService: MediasService,
  ) {}

  @Post()
  @Permissions('canEditRealEstates')
  create(
    @Body() createRealEstateDto: RealEstateDto,
    @CurrentUser() user: ConnectedUser,
  ): Promise<RealEstateDto> {
    createRealEstateDto.createdBy = user.id;
    return this.realEstateService.create(createRealEstateDto);
  }

  @Get()
  @Permissions('canShowRealEstates')
  findAll(): Promise<RealEstateDto[]> {
    return this.realEstateService.findAll();
  }

  @Get('owners') // must come before @Get(':id')
  @Permissions('canShowRealEstates')
  findAllOwners(): Promise<LabelValue<number>[]> {
    return this.realEstateService.findAllOwners();
  }

  @Get('buyers') // must come before @Get(':id')
  @Permissions('canEditRealEstates')
  findAllBuyers(): Promise<LabelValue<number>[]> {
    return this.realEstateService.findAllBuyers();
  }

  @Get(':id')
  @Permissions('canShowRealEstates')
  findOne(@Param('id') realEstateId: string): Promise<RealEstateDto> {
    return this.realEstateService.findOne(+realEstateId);
  }

  @Patch(':id')
  @Permissions('canEditRealEstates')
  update(
    @Param('id') realEstateId: string,
    @Body() updateRealEstateDto: RealEstateDto,
  ): Promise<RealEstate> {
    return this.realEstateService.update(+realEstateId, updateRealEstateDto);
  }

  @Patch(':id/status')
  @Permissions('canEditRealEstates')
  updateStatus(
    @Param('id') realEstateId: string,
    @Body() updateStatusDto: UpdateStatusDto,
    @CurrentUser() user: ConnectedUser,
  ): Promise<RealEstateDto> {
    return this.realEstateService.updateStatus(
      +realEstateId,
      updateStatusDto,
      user.id,
    );
  }

  @Delete(':id')
  @Permissions('canEditRealEstates')
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

  @Post(':id/pictures/upload') // id here must not be renamed because of getDestination
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
  @Permissions('canEditRealEstates')
  async uploadPictures(
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({
            fileType: 'image/(jpg|jpeg|png|gif)',
            skipMagicNumbersValidation: true,
          }),
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
      +realEstateId,
      MediaType.IMAGE,
    );
  }

  @Post(':id/videos/upload') // id here must not be renamed because of getDestination
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
  @Permissions('canEditRealEstates')
  async uploadVideos(
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({
            fileType: 'video/(mp4|avi|mov|mkv)',
            skipMagicNumbersValidation: true,
          }),
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
      +realEstateId,
      MediaType.VIDEO,
    );
  }

  @Post(':id/documents/upload') // id here must not be renamed because of getDestination
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
  @Permissions('canEditRealEstates')
  async uploadDocuments(
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({
            fileType: 'application/pdf',
            skipMagicNumbersValidation: true,
          }),
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
      +realEstateId,
      MediaType.DOCUMENT,
    );
  }

  @Delete(':id/pictures/:uuid')
  @Delete(':id/videos/:uuid')
  @Delete(':id/documents/:uuid')
  @Permissions('canEditRealEstates')
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

  @Get(':id/export')
  async export(
    @Param('id') realEstateId: string,
    @Res({ passthrough: true }) res: Response,
    @Headers('accept-language') acceptLanguage: string,
  ) {
    const realEstate = await this.realEstateService.findOne(
      +realEstateId,
      true,
    );
    if (!realEstate) {
      throw new NotFoundException(
        `Real estate with ID ${realEstate} not found`,
      );
    }
    const pdfBuffer = await this.realEstateService.export(
      realEstate,
      acceptLanguage,
    );
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${DateUtils.formatToFileName(new Date())}_export_${realEstateId}.pdf"`,
    );
    res.send(pdfBuffer);
  }

  @Get(':realEstateId/tasks')
  @Permissions('canShowTasks')
  async findAllByRealEstateId(
    @Param('realEstateId') realEstateId: string,
  ): Promise<Task[]> {
    await this.realEstateService.checkAndFindRealEstateById(realEstateId);
    return this.realEstateService.findAllByRealEstateId(+realEstateId);
  }

  @Get(':realEstateId/users')
  @Permissions('canEditTasks')
  findAllUsers(): Promise<LabelValue<number>[]> {
    return this.realEstateService.findAllUsers();
  }

  @Get(':realEstateId/tasks/types')
  @Permissions('canEditTasks')
  findAllTaskType(
    @Headers('accept-language') acceptLanguage: string,
  ): Promise<LabelValue<number>[]> {
    return this.realEstateService.findAllTaskType(acceptLanguage);
  }

  @Post(':realEstateId/tasks')
  @Permissions('canEditTasks')
  async createTask(
    @Param('realEstateId') realEstateId: string,
    @Body() createTaskDto: CreateTaskDto,
    @CurrentUser() user: ConnectedUser,
  ): Promise<Task> {
    await this.realEstateService.checkAndFindRealEstateById(realEstateId);
    createTaskDto.createdBy = user.id;
    createTaskDto.realEstateId = +realEstateId;
    return this.realEstateService.createTask(createTaskDto);
  }

  @Patch(':realEstateId/tasks/:taskId')
  @Permissions('canEditTasks')
  async updateTask(
    @Param('taskId') taskId: string,
    @Param('realEstateId') realEstateId: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @CurrentUser() user: ConnectedUser,
  ): Promise<Task> {
    await this.realEstateService.checkAndFindRealEstateById(realEstateId);
    updateTaskDto.realEstateId = +realEstateId;
    updateTaskDto.updatedBy = user.id;
    return this.realEstateService.updateTask(+taskId, updateTaskDto);
  }

  @Patch(':realEstateId/tasks/:taskId/status')
  @Permissions('canEditTasks')
  async updateTaskStatus(
    @Param('taskId') taskId: string,
    @Param('realEstateId') realEstateId: string,
    @Body() updateTaskStatusDto: { status: TaskStatus; updatedBy: number },
    @CurrentUser() user: ConnectedUser,
  ): Promise<ResponseStatus> {
    await this.realEstateService.checkAndFindRealEstateById(realEstateId);
    updateTaskStatusDto.updatedBy = user.id;
    return {
      status: await this.realEstateService.updateTaskStatus(
        +taskId,
        updateTaskStatusDto,
      ),
    };
  }

  @Delete(':realEstateId/tasks/:taskId')
  async removeTask(
    @Param('taskId') taskId: string,
    @Param('realEstateId') realEstateId: string,
  ): Promise<ResponseStatus> {
    await this.realEstateService.checkAndFindRealEstateById(realEstateId);
    return {
      status: await this.realEstateService.removeTask(+taskId),
    };
  }
}
