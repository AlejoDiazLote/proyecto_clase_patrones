import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { FilterEventDto } from './dto/filter-event.dto';
import { PaginatedResult, paginate } from '../../shared/dto/pagination.dto';
import { EventStatus } from '../../database/enums/event-status.enum';
import { EventModality } from '../../database/enums/event-modality.enum';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventsRepository: Repository<Event>,
  ) {}

  create(createEventDto: CreateEventDto): Promise<Event> {
    const event = this.eventsRepository.create(createEventDto);
    return this.eventsRepository.save(event);
  }

  async findAll(filters: FilterEventDto): Promise<PaginatedResult<Event>> {
    const {
      page = 1,
      limit = 10,
      search,
      estado,
      modalidad,
      tipoInscripcion,
      desde,
      hasta,
    } = filters;

    const qb = this.eventsRepository.createQueryBuilder('evento');

    if (search) {
      qb.andWhere(
        '(evento.titulo ILIKE :search OR evento.descripcion ILIKE :search)',
        { search: `%${search}%` },
      );
    }
    if (estado) qb.andWhere('evento.estado = :estado', { estado });
    if (modalidad) qb.andWhere('evento.modalidad = :modalidad', { modalidad });
    if (tipoInscripcion)
      qb.andWhere('evento.tipoInscripcion = :tipoInscripcion', {
        tipoInscripcion,
      });
    if (desde) qb.andWhere('evento.fechaInicio >= :desde', { desde });
    if (hasta) qb.andWhere('evento.fechaInicio <= :hasta', { hasta });

    qb.orderBy('evento.fechaInicio', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    return paginate(data, total, page, limit);
  }

  async findOne(id: string): Promise<Event> {
    const event = await this.eventsRepository.findOne({ where: { id } });
    if (!event) {
      throw new NotFoundException(`Evento con id "${id}" no encontrado`);
    }
    return event;
  }

  async update(id: string, updateEventDto: UpdateEventDto): Promise<Event> {
    const event = await this.findOne(id);
    Object.assign(event, updateEventDto);
    return this.eventsRepository.save(event);
  }

  async publish(id: string): Promise<Event> {
    const event = await this.findOne(id);

    if (
      event.estado !== EventStatus.BORRADOR &&
      event.estado !== EventStatus.EN_REVISION
    ) {
      throw new BadRequestException(
        `Solo se puede publicar un evento en estado BORRADOR o EN_REVISION (actual: ${event.estado})`,
      );
    }

    // Validar campos obligatorios según modalidad
    if (
      (event.modalidad === EventModality.PRESENCIAL ||
        event.modalidad === EventModality.HIBRIDO) &&
      !event.ubicacion
    ) {
      throw new BadRequestException(
        'Los eventos PRESENCIAL e HÍBRIDO requieren una ubicación',
      );
    }

    if (
      (event.modalidad === EventModality.VIRTUAL ||
        event.modalidad === EventModality.HIBRIDO) &&
      !event.enlaceConferencia
    ) {
      throw new BadRequestException(
        'Los eventos VIRTUAL e HÍBRIDO requieren un enlace de conferencia',
      );
    }

    // Verificar al menos una sesión
    const sessionCount = await this.eventsRepository
      .createQueryBuilder('evento')
      .leftJoin('sesiones', 'sesion', 'sesion.evento_id = evento.id')
      .where('evento.id = :id', { id })
      .select('COUNT(sesion.id)', 'total')
      .getRawOne<{ total: string }>();

    if (!sessionCount || Number(sessionCount.total) === 0) {
      throw new BadRequestException(
        'El evento debe tener al menos una sesión antes de publicarse. Por favor, crea una sesión desde el panel de administración del evento.',
      );
    }

    event.estado = event.requiereAprobacion
      ? EventStatus.EN_REVISION
      : EventStatus.PUBLICADO;

    return this.eventsRepository.save(event);
  }

  async approve(id: string): Promise<Event> {
    const event = await this.findOne(id);

    if (event.estado !== EventStatus.EN_REVISION) {
      throw new BadRequestException(
        `Solo se puede aprobar un evento EN_REVISION (actual: ${event.estado})`,
      );
    }

    event.estado = EventStatus.PUBLICADO;
    return this.eventsRepository.save(event);
  }

  async remove(id: string): Promise<void> {
    const event = await this.findOne(id);
    await this.eventsRepository.remove(event);
  }

  async getRegistrations(eventoId: string, estado?: string): Promise<any[]> {
    const event = await this.findOne(eventoId);

    const qb = this.eventsRepository
      .createQueryBuilder('evento')
      .leftJoinAndSelect('evento.inscripciones', 'inscripcion')
      .leftJoinAndSelect('inscripcion.usuario', 'usuario')
      .where('evento.id = :eventoId', { eventoId });

    if (estado) {
      qb.andWhere('inscripcion.estado = :estado', { estado });
    }

    const result = await qb.getOne();
    return result?.inscripciones ?? [];
  }
}
