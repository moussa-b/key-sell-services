import {
  BadRequestException,
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
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from './entities/user-role.enum';
import { User } from './entities/user.entity';
import { ResponseStatus } from '../shared/dto/response-status.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ConnectedUser } from '../shared/models/current-user';
import { UpdateUserDto } from './dto/update-user.dto';
import { SendEmailDto } from '../shared/dto/send-email.dto';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully created.',
    type: User,
  })
  @Post()
  @Roles(UserRole.ADMIN)
  create(
    @Body() createUserDto: CreateUserDto,
    @CurrentUser() user: ConnectedUser,
  ): Promise<User> {
    createUserDto.createdBy = user.id;
    return this.usersService.create(createUserDto);
  }

  @ApiOperation({ summary: 'Retrieve a list of all users' })
  @ApiResponse({ status: 200, description: 'A list of users.', type: [User] })
  @Get()
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @ApiOperation({ summary: 'Retrieve a user by ID' })
  @ApiResponse({ status: 200, description: 'The user data.', type: User })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @Get(':userId')
  async findOne(@Param('userId') userId: string): Promise<User> {
    const client = await this.usersService.findOne(+userId);
    if (!client) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    return client;
  }

  @ApiOperation({ summary: 'Update a user' })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully updated',
    type: User,
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @Patch(':userId')
  @Roles(UserRole.ADMIN)
  update(
    @Param('userId') userId: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() user: ConnectedUser,
  ): Promise<User> {
    updateUserDto.updatedBy = user.id;
    return this.usersService.update(+userId, updateUserDto);
  }

  @ApiOperation({ summary: 'Delete a user by ID' })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully deleted.',
    type: ResponseStatus,
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @Delete(':userId')
  @Roles(UserRole.ADMIN)
  async remove(@Param('userId') userId: string): Promise<ResponseStatus> {
    if (+userId === 1) {
      throw new BadRequestException(
        `User with ID ${userId} can not be deleted`,
      );
    }
    const client = await this.usersService.findOne(+userId);
    if (!client) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    return { status: await this.usersService.remove(+userId) };
  }

  @ApiOperation({ summary: 'Send email to a user' })
  @ApiResponse({
    status: 200,
    description: 'The email has been successfully sent to the user.',
    type: ResponseStatus,
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @Post(':userId/email/sent')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async sendEmail(
    @Param('userId') userId: string,
    @Body() sendEmailDto: SendEmailDto,
    @CurrentUser() connectedUser: ConnectedUser,
  ): Promise<ResponseStatus> {
    sendEmailDto.sentByUserId = connectedUser.id;
    const user = await this.usersService.findOne(+userId);
    if (!user) {
      throw new NotFoundException(`Buyer with ID ${userId} not found`);
    }
    sendEmailDto.userId = +userId;
    return this.usersService.sendEmail(user.email, sendEmailDto);
  }
}
