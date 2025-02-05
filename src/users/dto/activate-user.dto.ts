import { IsNotEmpty, IsString } from 'class-validator';

export class ActivateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  activationToken: string;
}
