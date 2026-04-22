import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginationDto } from '../../../shared/dto/pagination.dto';

export class FilterUserDto extends PaginationDto {
  @ApiPropertyOptional({
    example: 'juan',
    description: 'Buscar por texto en nombre o correo',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    example: 'uuid-del-rol',
    description: 'Filtrar por UUID del rol',
  })
  @IsOptional()
  @IsUUID()
  rolId?: string;
}
