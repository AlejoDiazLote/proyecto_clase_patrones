import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from './entities/session.entity';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { FilterSessionDto } from './dto/filter-session.dto';
import { EventsService } from '../events/events.service';
import { PaginatedResult, paginate } from '../../shared/dto/pagination.dto';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(Session)
    private readonly sessionsRepository: Repository<Session>,
    private readonly eventsService: EventsService,
  ) {}

  async create(createSessionDto: CreateSessionDto): Promise<Session> {
    const { eventoId, ...sessionData } = createSessionDto;
    const evento = await this.eventsService.findOne(eventoId);
    const session = this.sessionsRepository.create({
      ...sessionData,
      evento,
    });
    return this.sessionsRepository.save(session);
  }

  async findAll(filters: FilterSessionDto): Promise<PaginatedResult<Session>> {
    const { page = 1, limit = 10, search, eventoId } = filters;

    const qb = this.sessionsRepository
      .createQueryBuilder('sesion')
      .leftJoinAndSelect('sesion.evento', 'evento');

    if (search) {
      qb.andWhere(
        '(sesion.titulo ILIKE :search OR sesion.descripcion ILIKE :search)',
        { search: `%${search}%` },
      );
    }
    if (eventoId) qb.andWhere('evento.id = :eventoId', { eventoId });

    qb.orderBy('sesion.fechaInicio', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    return paginate(data, total, page, limit);
  }

  async findOne(id: string): Promise<Session> {
    const session = await this.sessionsRepository.findOne({
      where: { id },
      relations: ['evento'],
    });
    if (!session) {
      throw new NotFoundException(`Sesión con id "${id}" no encontrada`);
    }
    return session;
  }

  async update(
    id: string,
    updateSessionDto: UpdateSessionDto,
  ): Promise<Session> {
    const session = await this.findOne(id);
    const { eventoId, ...sessionData } = updateSessionDto;

    if (eventoId !== undefined) {
      session.evento = await this.eventsService.findOne(eventoId);
    }

    Object.assign(session, sessionData);
    return this.sessionsRepository.save(session);
  }

  async remove(id: string): Promise<void> {
    const session = await this.findOne(id);
    await this.sessionsRepository.remove(session);
  }
}
