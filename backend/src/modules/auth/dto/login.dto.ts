import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'juan@eventos.edu' })
  @IsEmail()
  correo: string;

  @ApiProperty({ example: 'Passw0rd!' })
  @IsString()
  password: string;
}
