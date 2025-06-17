import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipeBuilder,
  Patch,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { BuyersService } from './buyers.service';
import { CreateBuyerDto } from './dto/create-buyer.dto';
import { UpdateBuyerDto } from './dto/update-buyer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Buyer } from './entities/buyer.entity';
import { ResponseStatus } from '../shared/dto/response-status.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ConnectedUser } from '../shared/models/current-user';
import { SendEmailDto } from '../shared/dto/send-email.dto';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Request } from 'express';
import {
  getDestination,
  getFilename,
  identityDocumentMaxSize,
} from '../utils/file-upload.utils';
import { MediaType } from '../shared/models/media-type.enum';

@Controller('buyers')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class BuyersController {
  constructor(private readonly buyersService: BuyersService) {}

  @Post()
  @Permissions('canEditBuyers')
  @UseInterceptors(
    FilesInterceptor('documents[]', 2, {
      storage: diskStorage({
        destination: (
          req: Request,
          file: Express.Multer.File,
          callback: (error: Error | null, destination: string) => void,
        ) =>
          getDestination(
            req,
            file,
            callback,
            MediaType.IDENTITY_DOCUMENT,
            'buyers',
          ),
        filename: getFilename,
      }),
    }),
  )
  create(
    @UploadedFiles(
      new ParseFilePipeBuilder()
        .addValidator(
          new FileTypeValidator({
            fileType: /^(image\/(jpe?g|png|gif)|application\/pdf)$/,
            skipMagicNumbersValidation: true,
          }),
        )
        .addValidator(
          new MaxFileSizeValidator({
            maxSize: identityDocumentMaxSize,
          }),
        )
        .build({
          fileIsRequired: false,
        }),
    )
    documents: Express.Multer.File[] = [],
    @Body('buyer') rawCreateBuyerDto: string,
    @CurrentUser() user: ConnectedUser,
  ): Promise<Buyer> {
    let createBuyerDto: CreateBuyerDto;
    try {
      createBuyerDto = JSON.parse(rawCreateBuyerDto);
    } catch (e) {
      throw new BadRequestException('Invalid buyer JSON', e);
    }
    createBuyerDto.createdBy = user.id;
    return this.buyersService.create(createBuyerDto, documents);
  }

  @Get()
  @Permissions('canShowBuyers')
  findAll(): Promise<Buyer[]> {
    return this.buyersService.findAll();
  }

  @Get(':buyerId')
  @Permissions('canShowBuyers')
  async findOne(@Param('buyerId') buyerId: string): Promise<Buyer> {
    return this.buyersService.checkAndFindBuyerById(buyerId);
  }

  @Patch(':id') // id here must not be renamed because of getDestination
  @Permissions('canEditBuyers')
  @UseInterceptors(
    FilesInterceptor('documents[]', 2, {
      storage: diskStorage({
        destination: (
          req: Request,
          file: Express.Multer.File,
          callback: (error: Error | null, destination: string) => void,
        ) =>
          getDestination(
            req,
            file,
            callback,
            MediaType.IDENTITY_DOCUMENT,
            'buyers',
          ),
        filename: getFilename,
      }),
    }),
  )
  async update(
    @Param('id') buyerId: string,
    @UploadedFiles(
      new ParseFilePipeBuilder()
        .addValidator(
          new FileTypeValidator({
            fileType: /^(image\/(jpe?g|png|gif)|application\/pdf)$/,
            skipMagicNumbersValidation: true,
          }),
        )
        .addValidator(
          new MaxFileSizeValidator({
            maxSize: identityDocumentMaxSize,
          }),
        )
        .build({
          fileIsRequired: false,
        }),
    )
    documents: Express.Multer.File[] = [],
    @Body('buyer') rawUpdateBuyerDto: string,
    @CurrentUser() user: ConnectedUser,
  ): Promise<Buyer> {
    let updateBuyerDto: UpdateBuyerDto;
    try {
      updateBuyerDto = JSON.parse(rawUpdateBuyerDto);
    } catch (e) {
      throw new BadRequestException('Invalid buyer JSON', e);
    }
    updateBuyerDto.updatedBy = user.id;
    await this.buyersService.checkAndFindBuyerById(buyerId);
    return this.buyersService.update(+buyerId, updateBuyerDto, documents);
  }

  @Delete(':buyerId')
  @Permissions('canEditBuyers')
  async remove(@Param('buyerId') buyerId: string): Promise<ResponseStatus> {
    const buyer = await this.buyersService.checkAndFindBuyerById(buyerId);
    return {
      status: await this.buyersService.remove(+buyerId, buyer.address?.id),
    };
  }

  @Post(':buyerId/email/sent')
  @Permissions('canSendEmail')
  async sendEmail(
    @Param('buyerId') buyerId: string,
    @Body() sendEmailDto: SendEmailDto,
    @CurrentUser() user: ConnectedUser,
  ): Promise<ResponseStatus> {
    sendEmailDto.sentByUserId = user.id;
    const buyer = await this.buyersService.checkAndFindBuyerById(buyerId);
    sendEmailDto.buyerId = +buyerId;
    return this.buyersService.sendEmail(buyer.email, sendEmailDto);
  }
}
