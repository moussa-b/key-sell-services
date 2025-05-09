import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSellerDto } from './dto/create-seller.dto';
import { UpdateSellerDto } from './dto/update-seller.dto';
import { SellersRepository } from './sellers.repository';
import { Seller } from './entities/seller.entity';
import { SendEmailDto } from '../shared/dto/send-email.dto';
import { ResponseStatus } from '../shared/dto/response-status.dto';
import { MailService } from '../shared/mail/mail.service';
import { MailAudit } from '../shared/mail/entities/mail-audit.entity';
import { AddressesService } from '../shared/addresses.service';
import { Media } from '../medias/entities/media.entity';
import * as path from 'path';
import { MediaType } from '../shared/models/media-type.enum';
import { MediasService } from '../medias/medias.service';
import { existsSync, mkdirSync, renameSync } from 'fs-extra';

@Injectable()
export class SellersService {
  constructor(
    private readonly sellerRepository: SellersRepository,
    private readonly mediasService: MediasService,
    private readonly mailService: MailService,
    private readonly addressesService: AddressesService,
  ) {}

  async create(
    createSellerDto: CreateSellerDto,
    documents: Express.Multer.File[],
  ): Promise<Seller> {
    const seller = await this.sellerRepository.create(createSellerDto);
    if (documents?.length > 0) {
      const createdMedias: Media[] = [];
      for (const file of documents) {
        const media = new Media();
        const currentPath = file.path;
        const parentDir = path.dirname(currentPath);
        const newDir = path.join(parentDir, String(seller.id));
        if (!existsSync(newDir)) {
          mkdirSync(newDir);
        }
        const newFilePath = path.join(newDir, file.originalname);
        renameSync(currentPath, newFilePath);
        media.absolutePath = path.resolve(newFilePath);
        media.fileName = file.originalname;
        media.fileSize = file.size;
        media.mediaType = MediaType.IDENTITY_DOCUMENT;
        media.mimeType = file.mimetype;
        media.createdBy = createSellerDto.createdBy;
        createdMedias.push(await this.mediasService.create(media));
      }
      this.sellerRepository.linkMediaToSeller(seller.id, createdMedias);
    }
    return seller;
  }

  async findAll(): Promise<Seller[]> {
    return this.sellerRepository.findAll();
  }

  async findOne(id: number): Promise<Seller> {
    return this.sellerRepository.findOne(id);
  }

  async update(
    id: number,
    updateSellerDto: UpdateSellerDto,
    documents: Express.Multer.File[],
  ): Promise<Seller> {
    const seller = await this.sellerRepository.update(id, updateSellerDto);
    if (documents?.length > 0) {
      const createdMedias: Media[] = [];
      for (const file of documents) {
        const media = new Media();
        media.absolutePath = path.resolve(file.path);
        media.fileName = file.originalname;
        media.fileSize = file.size;
        media.mediaType = MediaType.IDENTITY_DOCUMENT;
        media.mimeType = file.mimetype;
        media.createdBy = updateSellerDto.updatedBy;
        createdMedias.push(await this.mediasService.create(media));
      }
      this.sellerRepository.linkMediaToSeller(seller.id, createdMedias);
    }
    return seller;
  }

  async remove(id: number, addressId: number): Promise<boolean> {
    if (addressId > 0) {
      this.addressesService.remove(addressId);
    }
    return this.sellerRepository.remove(id);
  }

  async sendEmail(
    sellerEmail: string,
    sendEmailDto: SendEmailDto,
  ): Promise<ResponseStatus> {
    const result: false | void = await this.mailService.sendEmail(
      sellerEmail,
      sendEmailDto.subject,
      {
        text: sendEmailDto.messageText,
        html: sendEmailDto.messageHtml,
      },
      new MailAudit(sendEmailDto),
    );
    return { status: result !== false };
  }

  async checkAndFindSellerById(sellerId: string): Promise<Seller> {
    const seller = await this.findOne(+sellerId);
    if (!seller) {
      throw new NotFoundException(`Seller with ID ${sellerId} not found`);
    }
    return seller;
  }
}
