import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginationDto } from '../../../shared/dto/pagination.dto';

export class FilterSessionDto extends PaginationDto {
  @ApiPropertyOptional({
    example: 'taller',
    description: 'Buscar por texto en título o descripción',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    example: 'uuid-del-evento',
    description: 'Filtrar por UUID del evento',
  })
  @IsOptional()
  @IsUUID()
  eventoId?: string;
}
