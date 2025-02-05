import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { ActivateUserDto } from '../users/dto/activate-user.dto';
import { ResetPasswordDto } from '../users/dto/reset-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { UpdateUserDto } from '../users/dto/update-user.dto';
import { UpdateUserSecurityDto } from '../users/dto/update-user-security.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResponseStatus } from '../shared/dto/response-status.dto';
import { User } from '../users/entities/user.entity';
import { AccessToken } from './dto/access-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ConnectedUser } from '../shared/models/current-user';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Login a user' })
  async login(@Request() req): Promise<AccessToken> {
    return this.authService.login(req.user);
  }

  @Post('activate')
  @HttpCode(200)
  @ApiOperation({ summary: 'Activate a user account' })
  async activate(
    @Body() activateUserDto: ActivateUserDto,
  ): Promise<ResponseStatus> {
    return this.authService.activate(activateUserDto);
  }

  @Post('password/forgot')
  @ApiOperation({ summary: 'Request a password reset' })
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<ResponseStatus> {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Post('password/reset')
  @ApiOperation({ summary: 'Reset the user password' })
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<ResponseStatus> {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get user profile' })
  async profile(@CurrentUser() user: ConnectedUser): Promise<User> {
    return this.authService.getProfile(user.id);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update user profile' })
  async updateProfile(
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() user: ConnectedUser,
  ): Promise<User> {
    return this.authService.updateProfile(user.id, updateUserDto);
  }

  @Patch('profile/security')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update user security settings' })
  async updateProfileSecurity(
    @Body() updateUserSecurityDto: UpdateUserSecurityDto,
    @CurrentUser() user: ConnectedUser,
  ): Promise<ResponseStatus> {
    return this.authService.updateProfileSecurity(
      user.id,
      updateUserSecurityDto,
    );
  }
}
