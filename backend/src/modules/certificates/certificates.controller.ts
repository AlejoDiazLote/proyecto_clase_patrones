import { Controller, Get, Param, Post, Res, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { Response } from 'express';
import { CertificatesService } from './certificates.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Certificados')
@Controller('certificates')
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @Post('generate/:eventoId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'ORGANIZADOR')
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Generar certificados para todos los asistentes de un evento FINALIZADO',
  })
  @ApiParam({ name: 'eventoId', description: 'UUID del evento' })
  generateForEvent(@Param('eventoId') eventoId: string) {
    return this.certificatesService.generateForEvent(eventoId);
  }

  @Get('my-certificates')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener certificados del usuario autenticado' })
  getMyCertificates(@CurrentUser() user: User) {
    return this.certificatesService.findByUser(user.id);
  }

  @Get(':codigoUnico')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Descargar certificado por código único (PDF)' })
  @ApiParam({
    name: 'codigoUnico',
    description: 'Código único del certificado (UUID)',
  })
  async download(
    @Param('codigoUnico') codigoUnico: string,
    @Res() res: Response,
  ) {
    const streamable =
      await this.certificatesService.getByCodigoUnico(codigoUnico);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="certificado-${codigoUnico}.pdf"`,
    });
    streamable.getStream().pipe(res);
  }
}
