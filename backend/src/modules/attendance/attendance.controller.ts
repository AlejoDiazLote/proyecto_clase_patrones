import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { Response } from 'express';
import { AttendanceService } from './attendance.service';
import { RegisterAttendanceDto } from './dto/register-attendance.dto';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';

@ApiTags('Asistencia')
@Controller()
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('attendance')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar asistencia a un evento' })
  register(@Body() dto: RegisterAttendanceDto) {
    return this.attendanceService.register(dto);
  }

  @Get('events/:eventoId/attendance')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'ORGANIZADOR')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar asistencias de un evento' })
  @ApiParam({ name: 'eventoId', description: 'UUID del evento' })
  getByEvent(@Param('eventoId') eventoId: string) {
    return this.attendanceService.getByEvent(eventoId);
  }

  @Get('registrations/:inscripcionId/qr')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Generar código QR de acceso para una inscripción confirmada',
  })
  @ApiParam({ name: 'inscripcionId', description: 'UUID de la inscripción' })
  async getQr(
    @Param('inscripcionId') inscripcionId: string,
    @Res() res: Response,
  ) {
    const buffer = await this.attendanceService.generateQr(inscripcionId);
    res.set({ 'Content-Type': 'image/png', 'Content-Length': buffer.length });
    res.send(buffer);
  }
}
