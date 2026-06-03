import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsUuidFormat } from '../../../shared/validators/is-uuid-format.validator';

export class InscribirseDto {
  @ApiProperty({
    example: 'uuid-del-usuario',
    description: 'UUID del usuario que se inscribe',
  })
  @IsString()
  @IsNotEmpty()
  @IsUuidFormat({ message: 'usuarioId must be a valid UUID format' })
  @Transform(({ value }) => value?.toString().trim())
  usuarioId: string;

  @ApiProperty({
    example: 'uuid-del-evento',
    description: 'UUID del evento al que se inscribe',
  })
  @IsString()
  @IsNotEmpty()
  @IsUuidFormat({ message: 'eventoId must be a valid UUID format' })
  @Transform(({ value }) => value?.toString().trim())
  eventoId: string;
}
