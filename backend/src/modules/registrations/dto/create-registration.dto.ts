import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class InscribirseDto {
  @ApiProperty({
    example: 'uuid-del-usuario',
    description: 'UUID del usuario que se inscribe',
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID('all', { message: 'usuarioId must be a valid UUID' })
  @Transform(({ value }) => value?.toString().trim())
  usuarioId: string;

  @ApiProperty({
    example: 'uuid-del-evento',
    description: 'UUID del evento al que se inscribe',
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID('all', { message: 'eventoId must be a valid UUID' })
  @Transform(({ value }) => value?.toString().trim())
  eventoId: string;
}
