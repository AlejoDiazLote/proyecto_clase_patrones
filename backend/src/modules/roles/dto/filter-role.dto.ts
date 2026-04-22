import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../../shared/dto/pagination.dto';

export class FilterRoleDto extends PaginationDto {
  @ApiPropertyOptional({
    example: 'admin',
    description: 'Buscar por nombre del rol',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
