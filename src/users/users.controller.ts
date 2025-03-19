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

  @Post()
  @Permissions('canEditUsers')
  create(
    @Body() createUserDto: CreateUserDto,
    @CurrentUser() user: ConnectedUser,
  ): Promise<User> {
    createUserDto.createdBy = user.id;
    return this.usersService.create(createUserDto);
  }

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

  @Get(':userId')
  @Permissions('canShowUsers')
  async findOne(@Param('userId') userId: string): Promise<User> {
    const user = await this.usersService.findOne(+userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    return user;
  }

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
