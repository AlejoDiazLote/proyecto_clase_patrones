import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EventModality } from '../../../database/enums/event-modality.enum';
import { EventStatus } from '../../../database/enums/event-status.enum';
import { RegistrationInscripcionType } from '../../../database/enums/inscription-type.enum';

export class CreateEventDto {
  @ApiProperty({
    example: 'Congreso Internacional de IA',
    maxLength: 200,
    description: 'Título del evento',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  titulo: string;

  @ApiPropertyOptional({
    example: 'Evento académico sobre inteligencia artificial',
    description: 'Descripción del evento',
  })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiProperty({
    example: '2026-05-01T09:00:00Z',
    description: 'Fecha y hora de inicio (ISO 8601)',
  })
  @IsDateString()
  @IsNotEmpty()
  fechaInicio: string;

  @ApiProperty({
    example: '2026-05-03T18:00:00Z',
    description: 'Fecha y hora de fin (ISO 8601)',
  })
  @IsDateString()
  @IsNotEmpty()
  fechaFin: string;

  @ApiProperty({
    example: 200,
    description: 'Número máximo de asistentes',
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  capacidadMaxima: number;

  @ApiProperty({
    example: 200,
    description: 'Cupos actualmente disponibles',
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  cuposDisponibles: number;

  @ApiPropertyOptional({
    enum: EventStatus,
    example: EventStatus.BORRADOR,
    description: 'Estado del evento',
  })
  @IsEnum(EventStatus)
  @IsOptional()
  estado?: EventStatus;

  @ApiPropertyOptional({
    enum: EventModality,
    example: EventModality.PRESENCIAL,
    description: 'Modalidad del evento',
  })
  @IsEnum(EventModality)
  @IsOptional()
  modalidad?: EventModality;

  @ApiPropertyOptional({
    enum: RegistrationInscripcionType,
    example: RegistrationInscripcionType.GRATUITA,
    description: 'Tipo de inscripción: GRATUITA o PAGA',
  })
  @IsEnum(RegistrationInscripcionType)
  @IsOptional()
  tipoInscripcion?: RegistrationInscripcionType;
}
