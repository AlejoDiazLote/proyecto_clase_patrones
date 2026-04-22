import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { FilterEventDto } from './dto/filter-event.dto';
import { PaginatedResult, paginate } from '../../shared/dto/pagination.dto';

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

  async remove(id: string): Promise<void> {
    const event = await this.findOne(id);
    await this.eventsRepository.remove(event);
  }
}
