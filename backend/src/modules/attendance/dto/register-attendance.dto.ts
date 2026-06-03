import { IsEnum, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AttendanceMethod } from '../../../database/enums/attendance-method.enum';

export class RegisterAttendanceDto {
  @ApiProperty({ description: 'UUID de la inscripción' })
  @IsUUID()
  @IsNotEmpty()
  inscripcionId: string;

  @ApiPropertyOptional({
    enum: AttendanceMethod,
    default: AttendanceMethod.MANUAL,
  })
  @IsEnum(AttendanceMethod)
  @IsOptional()
  metodo?: AttendanceMethod;
}
