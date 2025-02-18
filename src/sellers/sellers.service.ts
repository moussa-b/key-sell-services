import { Injectable } from '@nestjs/common';
import { CreateSellerDto } from './dto/create-seller.dto';
import { UpdateSellerDto } from './dto/update-seller.dto';
import { SellersRepository } from './sellers.repository';
import { Seller } from './entities/seller.entity';
import { SendEmailDto } from '../shared/dto/send-email.dto';
import { ResponseStatus } from '../shared/dto/response-status.dto';
import { MailService } from '../shared/mail/mail.service';
import { MailAudit } from '../shared/mail/entities/mail-audit.entity';
import { AddressesService } from '../shared/addresses.service';

@Injectable()
export class SellersService {
  constructor(
    private readonly sellerRepository: SellersRepository,
    private readonly mailService: MailService,
    private readonly addressesService: AddressesService,
  ) {}

  async create(createSellerDto: CreateSellerDto): Promise<Seller> {
    return this.sellerRepository.create(createSellerDto);
  }

  async findAll(): Promise<Seller[]> {
    return this.sellerRepository.findAll();
  }

  async findOne(id: number): Promise<Seller> {
    return this.sellerRepository.findOne(id);
  }

  async update(id: number, updateSellerDto: UpdateSellerDto): Promise<Seller> {
    return this.sellerRepository.update(id, updateSellerDto);
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
}
