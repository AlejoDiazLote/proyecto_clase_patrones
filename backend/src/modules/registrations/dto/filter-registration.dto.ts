import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginationDto } from '../../../shared/dto/pagination.dto';
import { RegistrationStatus } from '../../../database/enums/registration-status.enum';
import { IsUuidFormat } from '../../../shared/validators/is-uuid-format.validator';

export class FilterRegistrationDto extends PaginationDto {
  @ApiPropertyOptional({
    example: 'uuid-del-usuario',
    description: 'Filtrar por UUID del usuario',
  })
  @IsOptional()
  @IsUuidFormat({ message: 'usuarioId must be a valid UUID format' })
  usuarioId?: string;

  @ApiPropertyOptional({
    example: 'uuid-del-evento',
    description: 'Filtrar por UUID del evento',
  })
  @IsOptional()
  @IsUuidFormat({ message: 'eventoId must be a valid UUID format' })
  eventoId?: string;

  @ApiPropertyOptional({
    enum: RegistrationStatus,
    example: RegistrationStatus.CONFIRMADA,
  })
  @IsOptional()
  @IsEnum(RegistrationStatus)
  estado?: RegistrationStatus;
}
