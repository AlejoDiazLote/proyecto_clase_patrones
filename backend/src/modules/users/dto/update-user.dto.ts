import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({ example: 'Carlos López' })
  nombre?: string;

  @ApiPropertyOptional({ example: 'carlos@correo.com' })
  correo?: string;

  @ApiPropertyOptional({ example: 'uuid-del-rol' })
  rolId?: string;
}
