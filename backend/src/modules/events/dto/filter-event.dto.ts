import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../../shared/dto/pagination.dto';
import { EventStatus } from '../../../database/enums/event-status.enum';
import { EventModality } from '../../../database/enums/event-modality.enum';
import { RegistrationInscripcionType } from '../../../database/enums/inscription-type.enum';

export class FilterEventDto extends PaginationDto {
  @ApiPropertyOptional({
    example: 'congreso',
    description: 'Buscar por texto en título o descripción',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: EventStatus, example: EventStatus.PUBLICADO })
  @IsOptional()
  @IsEnum(EventStatus)
  estado?: EventStatus;

  @ApiPropertyOptional({ enum: EventModality, example: EventModality.VIRTUAL })
  @IsOptional()
  @IsEnum(EventModality)
  modalidad?: EventModality;

  @ApiPropertyOptional({
    enum: RegistrationInscripcionType,
    example: RegistrationInscripcionType.GRATUITA,
  })
  @IsOptional()
  @IsEnum(RegistrationInscripcionType)
  tipoInscripcion?: RegistrationInscripcionType;

  @ApiPropertyOptional({
    example: '2026-05-01',
    description: 'Eventos que inician desde esta fecha (ISO 8601)',
  })
  @IsOptional()
  @IsDateString()
  desde?: string;

  @ApiPropertyOptional({
    example: '2026-06-01',
    description: 'Eventos que inician hasta esta fecha (ISO 8601)',
  })
  @IsOptional()
  @IsDateString()
  hasta?: string;
}
