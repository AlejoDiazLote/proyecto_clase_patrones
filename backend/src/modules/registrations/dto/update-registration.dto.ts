import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsUuidFormat } from '../../../shared/validators/is-uuid-format.validator';

export class CancelarInscripcionDto {
  @ApiProperty({ example: 'uuid-del-usuario', description: 'UUID del usuario' })
  @IsUuidFormat({ message: 'usuarioId must be a valid UUID format' })
  @IsNotEmpty()
  usuarioId: string;

  @ApiProperty({ example: 'uuid-del-evento', description: 'UUID del evento' })
  @IsUuidFormat({ message: 'eventoId must be a valid UUID format' })
  @IsNotEmpty()
  eventoId: string;
}
