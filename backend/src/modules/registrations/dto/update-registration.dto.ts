import { IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CancelarInscripcionDto {
  @ApiProperty({ example: 'uuid-del-usuario', description: 'UUID del usuario' })
  @IsUUID()
  @IsNotEmpty()
  usuarioId: string;

  @ApiProperty({ example: 'uuid-del-evento', description: 'UUID del evento' })
  @IsUUID()
  @IsNotEmpty()
  eventoId: string;
}
