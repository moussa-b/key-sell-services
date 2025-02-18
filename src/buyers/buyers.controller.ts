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
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user-role.enum';
import { Buyer } from './entities/buyer.entity';
import { ResponseStatus } from '../shared/dto/response-status.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ConnectedUser } from '../shared/models/current-user';
import { SendEmailDto } from '../shared/dto/send-email.dto';

@ApiTags('Buyers')
@Controller('buyers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BuyersController {
  constructor(private readonly buyersService: BuyersService) {}

  @ApiOperation({ summary: 'Create a new buyer' })
  @ApiResponse({
    status: 201,
    description: 'The buyer has been successfully created.',
    type: Buyer,
  })
  @Post()
  @Roles(UserRole.ADMIN)
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
  @Roles(UserRole.ADMIN)
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
  @Roles(UserRole.ADMIN)
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
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
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
