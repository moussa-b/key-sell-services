import { Injectable } from '@nestjs/common';
import { CreateBuyerDto } from './dto/create-buyer.dto';
import { UpdateBuyerDto } from './dto/update-buyer.dto';
import { BuyersRepository } from './buyers.repository';
import { Buyer } from './entities/buyer.entity';
import { SendEmailDto } from '../shared/dto/send-email.dto';
import { MailService } from '../shared/mail/mail.service';
import { ResponseStatus } from '../shared/dto/response-status.dto';
import { MailAudit } from '../shared/mail/entities/mail-audit.entity';
import { AddressesService } from '../shared/addresses.service';

@Injectable()
export class BuyersService {
  constructor(
    private readonly buyerRepository: BuyersRepository,
    private readonly mailService: MailService,
    private readonly addressesService: AddressesService,
  ) {}

  async create(createBuyerDto: CreateBuyerDto): Promise<Buyer> {
    return this.buyerRepository.create(createBuyerDto);
  }

  async findAll(): Promise<Buyer[]> {
    return this.buyerRepository.findAll();
  }

  async findOne(id: number): Promise<Buyer> {
    return this.buyerRepository.findOne(id);
  }

  async update(id: number, updateBuyerDto: UpdateBuyerDto): Promise<Buyer> {
    return this.buyerRepository.update(id, updateBuyerDto);
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
}
