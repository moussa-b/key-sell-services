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
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ConnectedUser } from '../shared/models/current-user';
import { SendEmailDto } from '../shared/dto/send-email.dto';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@ApiTags('Buyers')
@Controller('buyers')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class BuyersController {
  constructor(private readonly buyersService: BuyersService) {}

  @ApiOperation({ summary: 'Create a new buyer' })
  @ApiResponse({
    status: 201,
    description: 'The buyer has been successfully created.',
    type: Buyer,
  })
  @Post()
  @Permissions('canEditBuyers')
  create(
    @Body() createBuyerDto: CreateBuyerDto,
    @CurrentUser() user: ConnectedUser,
  ): Promise<Buyer> {
    createBuyerDto.createdBy = user.id;
    return this.buyersService.create(createBuyerDto);
  }

  @ApiOperation({ summary: 'Retrieve a list of all buyers' })
  @ApiResponse({
    status: 200,
    description: 'List of all buyers.',
    type: [Buyer],
  })
  @Get()
  @Permissions('canShowBuyers')
  findAll(): Promise<Buyer[]> {
    return this.buyersService.findAll();
  }

  @ApiOperation({ summary: 'Retrieve a buyer by ID' })
  @ApiResponse({
    status: 200,
    description: 'The buyer with the given ID.',
    type: Buyer,
  })
  @ApiResponse({
    status: 404,
    description: 'Buyer not found.',
  })
  @Get(':buyerId')
  @Permissions('canShowBuyers')
  async findOne(@Param('buyerId') buyerId: string): Promise<Buyer> {
    const buyer = await this.buyersService.findOne(+buyerId);
    if (!buyer) {
      throw new NotFoundException(`Buyer with ID ${buyerId} not found`);
    }
    return buyer;
  }

  @ApiOperation({ summary: 'Update a buyer' })
  @ApiResponse({
    status: 200,
    description: 'The buyer has been successfully updated.',
    type: Buyer,
  })
  @ApiResponse({ status: 404, description: 'Buyer not found.' })
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

  @ApiOperation({ summary: 'Delete a buyer by ID' })
  @ApiResponse({
    status: 200,
    description: 'The buyer has been successfully deleted.',
    type: ResponseStatus,
  })
  @ApiResponse({ status: 404, description: 'Buyer not found.' })
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

  @ApiOperation({ summary: 'Send email to a buyer' })
  @ApiResponse({
    status: 200,
    description: 'The email has been successfully sent to the buyer.',
    type: ResponseStatus,
  })
  @ApiResponse({ status: 404, description: 'Buyer not found.' })
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
