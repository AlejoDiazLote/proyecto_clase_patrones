import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { Registration } from './entities/registration.entity';
import { Event } from '../events/entities/event.entity';
import { User } from '../users/entities/user.entity';
import { InscribirseDto } from './dto/create-registration.dto';
import { CancelarInscripcionDto } from './dto/update-registration.dto';
import { FilterRegistrationDto } from './dto/filter-registration.dto';
import { PaginatedResult, paginate } from '../../shared/dto/pagination.dto';
import { RegistrationStatus } from '../../database/enums/registration-status.enum';
import { EventStatus } from '../../database/enums/event-status.enum';
import { RegistrationInscripcionType } from '../../database/enums/inscription-type.enum';

@Injectable()
export class RegistrationsService {
  constructor(
    @InjectRepository(Registration)
    private readonly registrationsRepository: Repository<Registration>,
    private readonly dataSource: DataSource,
  ) {}

  async inscribirse(dto: InscribirseDto): Promise<{
    mensaje: string;
    inscripcion: Partial<Registration>;
    cuposRestantes: number;
  }> {
    return this.dataSource.transaction(async (manager) => {
      const evento = await manager.findOne(Event, {
        where: { id: dto.eventoId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!evento) {
        throw new NotFoundException(
          `Evento con id "${dto.eventoId}" no encontrado`,
        );
      }

      if (evento.estado !== EventStatus.PUBLICADO) {
        throw new BadRequestException(
          `El evento no está disponible para inscripción (estado: ${evento.estado})`,
        );
      }

      if (evento.cuposDisponibles <= 0) {
        throw new BadRequestException(
          'No hay cupos disponibles para este evento',
        );
      }

      const usuario = await manager.findOne(User, {
        where: { id: dto.usuarioId },
      });

      if (!usuario) {
        throw new NotFoundException(
          `Usuario con id "${dto.usuarioId}" no encontrado`,
        );
      }

      const inscripcionExistente = await manager.findOne(Registration, {
        where: {
          usuario: { id: dto.usuarioId },
          evento: { id: dto.eventoId },
          estado: In([
            RegistrationStatus.PENDIENTE,
            RegistrationStatus.CONFIRMADA,
          ]),
        },
      });

      if (inscripcionExistente) {
        throw new ConflictException(
          'El usuario ya tiene una inscripción activa en este evento',
        );
      }

      const estadoInicial =
        evento.tipoInscripcion === RegistrationInscripcionType.GRATUITA
          ? RegistrationStatus.CONFIRMADA
          : RegistrationStatus.PENDIENTE;

      evento.cuposDisponibles -= 1;
      await manager.save(evento);

      const inscripcion = manager.create(Registration, {
        usuario,
        evento,
        estado: estadoInicial,
      });

      const inscripcionGuardada = await manager.save(inscripcion);

      return {
        mensaje:
          estadoInicial === RegistrationStatus.CONFIRMADA
            ? 'Inscripción confirmada exitosamente'
            : 'Inscripción creada. Pendiente de pago para confirmar',
        inscripcion: {
          id: inscripcionGuardada.id,
          estado: inscripcionGuardada.estado,
          createdAt: inscripcionGuardada.createdAt,
        },
        cuposRestantes: evento.cuposDisponibles,
      };
    });
  }

  async cancelarInscripcion(
    dto: CancelarInscripcionDto,
  ): Promise<{ mensaje: string }> {
    return this.dataSource.transaction(async (manager) => {
      const inscripcion = await manager.findOne(Registration, {
        where: {
          usuario: { id: dto.usuarioId },
          evento: { id: dto.eventoId },
          estado: In([
            RegistrationStatus.PENDIENTE,
            RegistrationStatus.CONFIRMADA,
          ]),
        },
      });

      if (!inscripcion) {
        throw new NotFoundException(
          'No se encontró una inscripción activa para este usuario y evento',
        );
      }

      inscripcion.estado = RegistrationStatus.CANCELADA;
      await manager.save(inscripcion);

      const evento = await manager.findOne(Event, {
        where: { id: dto.eventoId },
        lock: { mode: 'pessimistic_write' },
      });

      if (evento) {
        evento.cuposDisponibles += 1;
        await manager.save(evento);
      }

      return { mensaje: 'Inscripción cancelada exitosamente' };
    });
  }

  async listarMisInscripciones(
    usuarioId: string,
    filters: FilterRegistrationDto,
  ): Promise<PaginatedResult<Registration>> {
    const { page = 1, limit = 10, estado } = filters;

    const qb = this.registrationsRepository
      .createQueryBuilder('inscripcion')
      .leftJoinAndSelect('inscripcion.usuario', 'usuario')
      .leftJoinAndSelect('inscripcion.evento', 'evento')
      .where('usuario.id = :usuarioId', { usuarioId });

    if (estado) qb.andWhere('inscripcion.estado = :estado', { estado });

    qb.orderBy('inscripcion.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    return paginate(data, total, page, limit);
  }

  async findAll(
    filters: FilterRegistrationDto,
  ): Promise<PaginatedResult<Registration>> {
    const { page = 1, limit = 10, usuarioId, eventoId, estado } = filters;

    const qb = this.registrationsRepository
      .createQueryBuilder('inscripcion')
      .leftJoinAndSelect('inscripcion.usuario', 'usuario')
      .leftJoinAndSelect('inscripcion.evento', 'evento');

    if (usuarioId) qb.andWhere('usuario.id = :usuarioId', { usuarioId });
    if (eventoId) qb.andWhere('evento.id = :eventoId', { eventoId });
    if (estado) qb.andWhere('inscripcion.estado = :estado', { estado });

    qb.orderBy('inscripcion.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    return paginate(data, total, page, limit);
  }

  async findOne(id: string): Promise<Registration> {
    const registration = await this.registrationsRepository.findOne({
      where: { id },
    });
    if (!registration) {
      throw new NotFoundException(`Inscripción con id "${id}" no encontrada`);
    }
    return registration;
  }
}
