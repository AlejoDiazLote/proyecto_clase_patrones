import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateRoleDto } from './create-role.dto';

export class UpdateRoleDto extends PartialType(CreateRoleDto) {
  @ApiPropertyOptional({
    example: 'MODERADOR',
    description: 'Nuevo nombre del rol',
  })
  nombre?: string;
}
