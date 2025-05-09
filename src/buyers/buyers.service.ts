import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBuyerDto } from './dto/create-buyer.dto';
import { UpdateBuyerDto } from './dto/update-buyer.dto';
import { BuyersRepository } from './buyers.repository';
import { Buyer } from './entities/buyer.entity';
import { SendEmailDto } from '../shared/dto/send-email.dto';
import { MailService } from '../shared/mail/mail.service';
import { ResponseStatus } from '../shared/dto/response-status.dto';
import { MailAudit } from '../shared/mail/entities/mail-audit.entity';
import { AddressesService } from '../shared/addresses.service';
import { MediasService } from '../medias/medias.service';
import { Media } from '../medias/entities/media.entity';
import * as path from 'path';
import { MediaType } from '../shared/models/media-type.enum';
import { existsSync, mkdirSync, renameSync } from 'fs-extra';

@Injectable()
export class BuyersService {
  constructor(
    private readonly buyerRepository: BuyersRepository,
    private readonly mailService: MailService,
    private readonly mediasService: MediasService,
    private readonly addressesService: AddressesService,
  ) {}

  async create(
    createBuyerDto: CreateBuyerDto,
    documents?: Express.Multer.File[],
  ): Promise<Buyer> {
    const buyer = await this.buyerRepository.create(createBuyerDto);
    if (documents?.length > 0) {
      const createdMedias: Media[] = [];
      for (const file of documents) {
        const media = new Media();
        const currentPath = file.path;
        const parentDir = path.dirname(currentPath);
        const newDir = path.join(parentDir, String(buyer.id));
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
        media.createdBy = createBuyerDto.createdBy;
        createdMedias.push(await this.mediasService.create(media));
      }
      this.buyerRepository.linkMediaToBuyer(buyer.id, createdMedias);
    }
    return buyer;
  }

  async findAll(): Promise<Buyer[]> {
    return this.buyerRepository.findAll();
  }

  async findOne(id: number): Promise<Buyer> {
    return this.buyerRepository.findOne(id);
  }

  async update(
    id: number,
    updateBuyerDto: UpdateBuyerDto,
    documents: Express.Multer.File[] = [],
  ): Promise<Buyer> {
    const buyer = await this.buyerRepository.update(id, updateBuyerDto);
    if (documents?.length > 0) {
      const createdMedias: Media[] = [];
      for (const file of documents) {
        const media = new Media();
        media.absolutePath = path.resolve(file.path);
        media.fileName = file.originalname;
        media.fileSize = file.size;
        media.mediaType = MediaType.IDENTITY_DOCUMENT;
        media.mimeType = file.mimetype;
        media.createdBy = updateBuyerDto.updatedBy;
        createdMedias.push(await this.mediasService.create(media));
      }
      this.buyerRepository.linkMediaToBuyer(buyer.id, createdMedias);
    }
    return buyer;
  }

  async remove(id: number, addressId: number): Promise<boolean> {
    if (addressId > 0) {
      this.addressesService.remove(addressId);
    }
    return this.buyerRepository.remove(id);
  }

  async sendEmail(
    buyerEmail: string,
    sendEmailDto: SendEmailDto,
  ): Promise<ResponseStatus> {
    const result: false | void = await this.mailService.sendEmail(
      buyerEmail,
      sendEmailDto.subject,
      {
        text: sendEmailDto.messageText,
        html: sendEmailDto.messageHtml,
      },
      new MailAudit(sendEmailDto),
    );
    return { status: result !== false };
  }

  async checkAndFindBuyerById(buyerId: string) {
    const buyer = await this.findOne(+buyerId);
    if (!buyer) {
      throw new NotFoundException(`Buyer with ID ${buyerId} not found`);
    }
    return buyer;
  }
}
