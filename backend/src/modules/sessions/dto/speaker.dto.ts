import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SpeakerStatus } from '../../../database/enums/speaker-status.enum';

export class InviteSpeakerDto {
  @ApiProperty({ description: 'UUID del usuario a invitar como ponente' })
  @IsUUID()
  @IsNotEmpty()
  ponenteId: string;
}

export class RespondInvitationDto {
  @ApiProperty({ enum: [SpeakerStatus.ACEPTADO, SpeakerStatus.RECHAZADO] })
  @IsEnum([SpeakerStatus.ACEPTADO, SpeakerStatus.RECHAZADO])
  respuesta: SpeakerStatus.ACEPTADO | SpeakerStatus.RECHAZADO;

  @ApiProperty({ description: 'UUID del ponente que responde' })
  @IsUUID()
  @IsNotEmpty()
  ponenteId: string;
}
