import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  NotFoundException,
  Param,
  ParseFilePipeBuilder,
  Patch,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { SellersService } from './sellers.service';
import { CreateSellerDto } from './dto/create-seller.dto';
import { UpdateSellerDto } from './dto/update-seller.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Seller } from './entities/seller.entity';
import { ResponseStatus } from '../shared/dto/response-status.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ConnectedUser } from '../shared/models/current-user';
import { SendEmailDto } from '../shared/dto/send-email.dto';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Request } from 'express';
import {
  getDestination,
  getFilename,
  identityDocumentMaxSize,
} from '../utils/file-upload.utils';
import { MediaType } from '../shared/models/media-type.enum';

@Controller('sellers')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SellersController {
  constructor(private readonly sellersService: SellersService) {}

  @Post()
  @Permissions('canEditSellers')
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
            'sellers',
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
    @Body('seller') rawCreateSellerDto: string,
    @CurrentUser() user: ConnectedUser,
  ): Promise<Seller> {
    let createSellerDto: CreateSellerDto;
    try {
      createSellerDto = JSON.parse(rawCreateSellerDto);
    } catch (e) {
      throw new BadRequestException('Invalid seller JSON', e);
    }
    createSellerDto.createdBy = user.id;
    return this.sellersService.create(createSellerDto, documents);
  }

  @Get()
  @Permissions('canShowSellers')
  findAll(): Promise<Seller[]> {
    return this.sellersService.findAll();
  }

  @Get(':sellerId')
  @Permissions('canShowSellers')
  async findOne(@Param('sellerId') sellerId: string): Promise<Seller> {
    return await this.sellersService.checkAndFindSellerById(sellerId);
  }

  @Patch(':id') // id here must not be renamed because of getDestination
  @Permissions('canEditSellers')
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
            'sellers',
          ),
        filename: getFilename,
      }),
    }),
  )
  async update(
    @Param('id') sellerId: string,
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
    @Body('seller') rawUpdateSellerDto: string,
    @CurrentUser() user: ConnectedUser,
  ): Promise<Seller> {
    let updateSellerDto: UpdateSellerDto;
    try {
      updateSellerDto = JSON.parse(rawUpdateSellerDto);
    } catch (e) {
      throw new BadRequestException('Invalid buyer JSON', e);
    }
    updateSellerDto.updatedBy = user.id;
    const seller = await this.sellersService.findOne(+sellerId);
    if (!seller) {
      throw new NotFoundException(`Seller with ID ${sellerId} not found`);
    }
    return this.sellersService.update(+sellerId, updateSellerDto, documents);
  }

  @Delete(':sellerId')
  @Permissions('canEditSellers')
  async remove(@Param('sellerId') sellerId: string): Promise<ResponseStatus> {
    const seller = await this.sellersService.checkAndFindSellerById(sellerId);
    return {
      status: await this.sellersService.remove(+sellerId, seller.address?.id),
    };
  }

  @Post(':sellerId/email/sent')
  @Permissions('canSendEmail')
  async sendEmail(
    @Param('sellerId') sellerId: string,
    @Body() sendEmailDto: SendEmailDto,
    @CurrentUser() user: ConnectedUser,
  ): Promise<ResponseStatus> {
    sendEmailDto.sentByUserId = user.id;
    const seller = await this.sellersService.checkAndFindSellerById(sellerId);
    sendEmailDto.sellerId = +sellerId;
    return this.sellersService.sendEmail(seller.email, sendEmailDto);
  }
}
