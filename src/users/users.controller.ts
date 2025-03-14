import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from './entities/user.entity';
import { ResponseStatus } from '../shared/dto/response-status.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ConnectedUser } from '../shared/models/current-user';
import { UpdateUserDto } from './dto/update-user.dto';
import { SendEmailDto } from '../shared/dto/send-email.dto';
import { UserAccessConfiguration } from './entities/user-access.configuration';
import { UserAccess } from './entities/user-access.entity';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully created.',
    type: User,
  })
  @Post()
  @Permissions('canEditUsers')
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
  @Permissions('canShowUsers')
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get('access')
  @Permissions('canShowUsersAccess')
  async getUserAccessConfiguration(
    @Query('userId') userId: number,
    @Headers('accept-language') acceptLanguage: string,
  ): Promise<UserAccessConfiguration> {
    if (!(+userId > 0)) {
      throw new BadRequestException(`The userId ${userId} is not valid`);
    }
    const user = await this.usersService.findOne(+userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    return await this.usersService.getUserAccessConfiguration(
      userId,
      user.role,
      acceptLanguage,
    );
  }

  @Post('access')
  @Permissions('canEditUsersAccess')
  async updateUserAccess(
    @Query('userId') userId: number,
    @Body() userAccess: UserAccess,
  ): Promise<UserAccess> {
    if (!(+userId > 0)) {
      throw new BadRequestException(`The userId ${userId} is not valid`);
    }
    const user = await this.usersService.findOne(+userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    return await this.usersService.updateUserAccess(userId, userAccess);
  }

  @ApiOperation({ summary: 'Retrieve a user by ID' })
  @ApiResponse({ status: 200, description: 'The user data.', type: User })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @Get(':userId')
  @Permissions('canShowUsers')
  async findOne(@Param('userId') userId: string): Promise<User> {
    const user = await this.usersService.findOne(+userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    return user;
  }

  @ApiOperation({ summary: 'Update a user' })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully updated',
    type: User,
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @Patch(':userId')
  @Permissions('canEditUsers')
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
  @Permissions('canEditUsers')
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
  @Permissions('canSendEmail')
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
