import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSessionDto {
  @ApiProperty({
    example: 'Taller de Machine Learning',
    maxLength: 200,
    description: 'Título de la sesión',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  titulo: string;

  @ApiPropertyOptional({
    example: 'Introducción práctica a modelos de ML',
    description: 'Descripción de la sesión',
  })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiProperty({
    example: '2026-05-01T10:00:00Z',
    description: 'Fecha y hora de inicio (ISO 8601)',
  })
  @IsDateString()
  @IsNotEmpty()
  fechaInicio: string;

  @ApiProperty({
    example: '2026-05-01T12:00:00Z',
    description: 'Fecha y hora de fin (ISO 8601)',
  })
  @IsDateString()
  @IsNotEmpty()
  fechaFin: string;

  @ApiProperty({
    example: 'uuid-del-evento',
    description: 'UUID del evento al que pertenece la sesión',
  })
  @IsUUID()
  @IsNotEmpty()
  eventoId: string;
}
