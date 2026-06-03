import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { SessionSpeaker } from './entities/session-speaker.entity';
import { Session } from './entities/session.entity';
import { User } from '../users/entities/user.entity';
import { SpeakerStatus } from '../../database/enums/speaker-status.enum';
import { InviteSpeakerDto, RespondInvitationDto } from './dto/speaker.dto';
import { NotificationsService } from '../common/notifications/notifications.service';

@Injectable()
export class SessionSpeakersService {
  constructor(
    @InjectRepository(SessionSpeaker)
    private readonly speakersRepository: Repository<SessionSpeaker>,
    @InjectRepository(Session)
    private readonly sessionsRepository: Repository<Session>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async invite(
    sessionId: string,
    dto: InviteSpeakerDto,
  ): Promise<SessionSpeaker> {
    const sesion = await this.sessionsRepository.findOne({
      where: { id: sessionId },
      relations: ['evento'],
    });
    if (!sesion)
      throw new NotFoundException(`Sesión "${sessionId}" no encontrada`);

    const ponente = await this.usersRepository.findOne({
      where: { id: dto.ponenteId },
    });
    if (!ponente)
      throw new NotFoundException(`Usuario "${dto.ponenteId}" no encontrado`);

    const existente = await this.speakersRepository.findOne({
      where: { sesion: { id: sessionId }, ponente: { id: dto.ponenteId } },
    });
    if (existente)
      throw new ConflictException('El usuario ya fue invitado a esta sesión');

    const speakerEntry = this.speakersRepository.create({ sesion, ponente });
    const saved = await this.speakersRepository.save(speakerEntry);

    const frontendUrl = this.configService.get<string>(
      'FRONTEND_URL',
      'http://localhost:4200',
    );
    await this.notificationsService.enqueueSpeakerInvitation({
      nombre: ponente.nombre,
      correo: ponente.correo,
      sesionTitulo: sesion.titulo,
      eventoTitulo: sesion.evento.titulo,
      linkAceptar: `${frontendUrl}/ponente/invitacion?id=${saved.id}&respuesta=ACEPTADO`,
      linkRechazar: `${frontendUrl}/ponente/invitacion?id=${saved.id}&respuesta=RECHAZADO`,
    });

    return saved;
  }

  async respond(
    sessionId: string,
    dto: RespondInvitationDto,
  ): Promise<SessionSpeaker> {
    const entry = await this.speakersRepository.findOne({
      where: { sesion: { id: sessionId }, ponente: { id: dto.ponenteId } },
    });
    if (!entry) throw new NotFoundException('Invitación no encontrada');

    if (entry.estado !== SpeakerStatus.PENDIENTE) {
      throw new BadRequestException('Esta invitación ya fue respondida');
    }

    entry.estado = dto.respuesta;
    return this.speakersRepository.save(entry);
  }

  async findBySesion(
    sessionId: string,
    onlyAccepted = false,
  ): Promise<SessionSpeaker[]> {
    const qb = this.speakersRepository
      .createQueryBuilder('sp')
      .leftJoinAndSelect('sp.ponente', 'ponente')
      .where('sp.sesion_id = :sessionId', { sessionId });

    if (onlyAccepted) {
      qb.andWhere('sp.estado = :estado', { estado: SpeakerStatus.ACEPTADO });
    }

    return qb.getMany();
  }

  async remove(sessionId: string, ponenteId: string): Promise<void> {
    const entry = await this.speakersRepository.findOne({
      where: { sesion: { id: sessionId }, ponente: { id: ponenteId } },
    });
    if (!entry) throw new NotFoundException('Invitación no encontrada');
    await this.speakersRepository.remove(entry);
  }
}
