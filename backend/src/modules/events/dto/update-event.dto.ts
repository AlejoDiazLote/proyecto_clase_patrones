import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateEventDto } from './create-event.dto';
import { EventModality } from '../../../database/enums/event-modality.enum';
import { EventStatus } from '../../../database/enums/event-status.enum';

export class UpdateEventDto extends PartialType(CreateEventDto) {
  @ApiPropertyOptional({ example: 'Nuevo título del evento' })
  titulo?: string;

  @ApiPropertyOptional({ enum: EventStatus })
  estado?: EventStatus;

  @ApiPropertyOptional({ enum: EventModality })
  modalidad?: EventModality;
}
