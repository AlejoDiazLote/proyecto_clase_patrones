import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SessionSpeakersService } from './session-speakers.service';
import { InviteSpeakerDto, RespondInvitationDto } from './dto/speaker.dto';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { SessionSpeaker } from './entities/session-speaker.entity';
import { SpeakerStatus } from '../../database/enums/speaker-status.enum';

class RespondByIdDto {
  @IsEnum([SpeakerStatus.ACEPTADO, SpeakerStatus.RECHAZADO])
  respuesta: SpeakerStatus.ACEPTADO | SpeakerStatus.RECHAZADO;
}

@ApiTags('Sesión – Ponentes')
@Controller()
export class SessionSpeakersController {
  constructor(
    private readonly speakersService: SessionSpeakersService,
    @InjectRepository(SessionSpeaker)
    private readonly speakersRepository: Repository<SessionSpeaker>,
  ) {}

  @Post('sessions/:sessionId/speakers')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'ORGANIZADOR')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Invitar un ponente a una sesión' })
  @ApiParam({ name: 'sessionId', description: 'UUID de la sesión' })
  invite(@Param('sessionId') sessionId: string, @Body() dto: InviteSpeakerDto) {
    return this.speakersService.invite(sessionId, dto);
  }

  @Get('sessions/:sessionId/speakers')
  @ApiOperation({ summary: 'Listar ponentes de una sesión' })
  @ApiParam({ name: 'sessionId', description: 'UUID de la sesión' })
  findAll(
    @Param('sessionId') sessionId: string,
    @Query('soloAceptados') soloAceptados?: string,
  ) {
    return this.speakersService.findBySesion(
      sessionId,
      soloAceptados === 'true',
    );
  }

  @Patch('sessions/:sessionId/speakers/respond')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Responder invitación como ponente (aceptar/rechazar)',
  })
  @ApiParam({ name: 'sessionId', description: 'UUID de la sesión' })
  respond(
    @Param('sessionId') sessionId: string,
    @Body() dto: RespondInvitationDto,
  ) {
    return this.speakersService.respond(sessionId, dto);
  }

  /** Endpoint público para responder desde el enlace del email (sin JWT) */
  @Patch('sessions/invitations/:invitationId/respond')
  @ApiOperation({
    summary: 'Responder invitación por UUID de invitación (enlace email)',
  })
  @ApiParam({
    name: 'invitationId',
    description: 'UUID del registro SessionSpeaker',
  })
  async respondByInvitationId(
    @Param('invitationId') invitationId: string,
    @Body() dto: RespondByIdDto,
  ) {
    const entry = await this.speakersRepository.findOne({
      where: { id: invitationId },
    });
    if (!entry) throw new NotFoundException('Invitación no encontrada');
    if (entry.estado !== SpeakerStatus.PENDIENTE) {
      throw new BadRequestException('Esta invitación ya fue respondida');
    }
    entry.estado = dto.respuesta;
    return this.speakersRepository.save(entry);
  }

  @Delete('sessions/:sessionId/speakers/:ponenteId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'ORGANIZADOR')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar ponente de una sesión' })
  @ApiParam({ name: 'sessionId', description: 'UUID de la sesión' })
  @ApiParam({ name: 'ponenteId', description: 'UUID del ponente' })
  remove(
    @Param('sessionId') sessionId: string,
    @Param('ponenteId') ponenteId: string,
  ) {
    return this.speakersService.remove(sessionId, ponenteId);
  }
}
