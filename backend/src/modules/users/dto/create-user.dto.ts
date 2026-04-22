import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    example: 'Juan Pérez',
    maxLength: 100,
    description: 'Nombre completo del usuario',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre: string;

  @ApiProperty({
    example: 'juan@correo.com',
    description: 'Correo electrónico único',
  })
  @IsEmail()
  @IsNotEmpty()
  correo: string;

  @ApiPropertyOptional({
    example: '116789012345678901234',
    description: 'ID de proveedor OAuth (Google)',
  })
  @IsString()
  @IsOptional()
  providerId?: string;

  @ApiPropertyOptional({
    example: 'uuid-del-rol',
    description: 'UUID del rol asignado',
  })
  @IsUUID()
  @IsOptional()
  rolId?: string;
}
