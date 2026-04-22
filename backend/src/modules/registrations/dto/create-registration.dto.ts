import { IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class InscribirseDto {
  @ApiProperty({
    example: 'uuid-del-usuario',
    description: 'UUID del usuario que se inscribe',
  })
  @IsUUID()
  @IsNotEmpty()
  usuarioId: string;

  @ApiProperty({
    example: 'uuid-del-evento',
    description: 'UUID del evento al que se inscribe',
  })
  @IsUUID()
  @IsNotEmpty()
  eventoId: string;
}
