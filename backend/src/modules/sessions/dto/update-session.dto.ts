import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateSessionDto } from './create-session.dto';

export class UpdateSessionDto extends PartialType(CreateSessionDto) {
  @ApiPropertyOptional({ example: 'Nuevo título de la sesión' })
  titulo?: string;

  @ApiPropertyOptional({ example: 'uuid-del-evento' })
  eventoId?: string;
}
