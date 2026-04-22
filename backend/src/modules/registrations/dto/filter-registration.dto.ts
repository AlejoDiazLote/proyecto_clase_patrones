import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { PaginationDto } from '../../../shared/dto/pagination.dto';
import { RegistrationStatus } from '../../../database/enums/registration-status.enum';

export class FilterRegistrationDto extends PaginationDto {
  @ApiPropertyOptional({
    example: 'uuid-del-usuario',
    description: 'Filtrar por UUID del usuario',
  })
  @IsOptional()
  @IsUUID()
  usuarioId?: string;

  @ApiPropertyOptional({
    example: 'uuid-del-evento',
    description: 'Filtrar por UUID del evento',
  })
  @IsOptional()
  @IsUUID()
  eventoId?: string;

  @ApiPropertyOptional({
    enum: RegistrationStatus,
    example: RegistrationStatus.CONFIRMADA,
  })
  @IsOptional()
  @IsEnum(RegistrationStatus)
  estado?: RegistrationStatus;
}
