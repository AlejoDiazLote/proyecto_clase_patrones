import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({
    example: 'ADMIN',
    maxLength: 50,
    description: 'Nombre único del rol',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  nombre: string;
}
