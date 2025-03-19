import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
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

@Controller('buyers')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class BuyersController {
  constructor(private readonly buyersService: BuyersService) {}

  @Post()
  @Permissions('canEditBuyers')
  create(
    @Body() createBuyerDto: CreateBuyerDto,
    @CurrentUser() user: ConnectedUser,
  ): Promise<Buyer> {
    createBuyerDto.createdBy = user.id;
    return this.buyersService.create(createBuyerDto);
  }

  @Get()
  @Permissions('canShowBuyers')
  findAll(): Promise<Buyer[]> {
    return this.buyersService.findAll();
  }

  @Get(':buyerId')
  @Permissions('canShowBuyers')
  async findOne(@Param('buyerId') buyerId: string): Promise<Buyer> {
    const buyer = await this.buyersService.findOne(+buyerId);
    if (!buyer) {
      throw new NotFoundException(`Buyer with ID ${buyerId} not found`);
    }
    return buyer;
  }

  @Patch(':buyerId')
  @Permissions('canEditBuyers')
  async update(
    @Param('buyerId') buyerId: string,
    @Body() updateBuyerDto: UpdateBuyerDto,
    @CurrentUser() user: ConnectedUser,
  ): Promise<Buyer> {
    updateBuyerDto.updatedBy = user.id;
    const buyer = await this.buyersService.findOne(+buyerId);
    if (!buyer) {
      throw new NotFoundException(`Buyer with ID ${buyerId} not found`);
    }
    return this.buyersService.update(+buyerId, updateBuyerDto);
  }

  @Delete(':buyerId')
  @Permissions('canEditBuyers')
  async remove(@Param('buyerId') buyerId: string): Promise<ResponseStatus> {
    const buyer = await this.buyersService.findOne(+buyerId);
    if (!buyer) {
      throw new NotFoundException(`Buyer with ID ${buyerId} not found`);
    }
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
    const buyer = await this.buyersService.findOne(+buyerId);
    if (!buyer) {
      throw new NotFoundException(`Buyer with ID ${buyerId} not found`);
    }
    sendEmailDto.buyerId = +buyerId;
    return this.buyersService.sendEmail(buyer.email, sendEmailDto);
  }
}
