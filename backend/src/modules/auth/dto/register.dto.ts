import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Juan Perez' })
  @IsString()
  @MaxLength(100)
  nombre: string;

  @ApiProperty({ example: 'juan@eventos.edu' })
  @IsEmail()
  correo: string;

  @ApiProperty({ example: 'Passw0rd!', minLength: 8 })
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password: string;
}
