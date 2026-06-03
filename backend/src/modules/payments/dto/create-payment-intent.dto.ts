import { IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentIntentDto {
  @ApiProperty({ description: 'UUID de la inscripción a pagar' })
  @IsUUID()
  @IsNotEmpty()
  inscripcionId: string;
}
