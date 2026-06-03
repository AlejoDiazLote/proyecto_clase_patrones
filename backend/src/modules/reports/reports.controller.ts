import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';

@ApiTags('Reportes')
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'ORGANIZADOR')
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('events/:eventoId')
  @ApiOperation({
    summary: 'Obtener reporte de asistencia e inscripciones de un evento',
  })
  @ApiParam({ name: 'eventoId', description: 'UUID del evento' })
  getEventReport(@Param('eventoId') eventoId: string) {
    return this.reportsService.getEventReport(eventoId);
  }
}
