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
import { NotificationsService } from '../common/notifications/notifications.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RegistrationsService {
  constructor(
    @InjectRepository(Registration)
    private readonly registrationsRepository: Repository<Registration>,
    private readonly dataSource: DataSource,
    private readonly notificationsService: NotificationsService,
    private readonly configService: ConfigService,
  ) {}

  async inscribirse(dto: InscribirseDto): Promise<{
    mensaje: string;
    inscripcion: Partial<Registration>;
    cuposRestantes: number;
  }> {
    // Datos para email (fuera de la transacción)
    let usuario: User;
    let evento: Event;
    let estadoInicial: RegistrationStatus;

    const resultado = await this.dataSource.transaction(async (manager) => {
      evento = await manager.findOne(Event, {
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

      usuario = await manager.findOne(User, {
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

      estadoInicial =
        evento.tipoInscripcion === RegistrationInscripcionType.GRATUITA
          ? RegistrationStatus.CONFIRMADA
          : RegistrationStatus.PENDIENTE;

      // Actualizar cupos directamente sin cargar relaciones
      await manager.decrement(Event, { id: evento.id }, 'cuposDisponibles', 1);

      // Crear inscripción usando solo IDs para evitar problemas con relaciones
      const inscripcion = manager.create(Registration, {
        usuario: { id: dto.usuarioId } as User,
        evento: { id: dto.eventoId } as Event,
        estado: estadoInicial,
      });

      const inscripcionGuardada = await manager.save(Registration, inscripcion);

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
        cuposRestantes: evento.cuposDisponibles - 1,
      };
    });

    // Enviar email FUERA de la transacción (async, sin bloquear)
    setImmediate(() => {
      this.enviarEmailConfirmacion(usuario, evento, estadoInicial).catch(
        (error) => {
          console.error('Error encolando email de confirmación:', error);
        },
      );
    });

    return resultado;
  }

  private async enviarEmailConfirmacion(
    usuario: User,
    evento: Event,
    estadoInicial: RegistrationStatus,
  ): Promise<void> {
    try {
      const appUrl = this.configService.get<string>(
        'APP_URL',
        'http://localhost:4200',
      );
      
      // Timeout de 5 segundos para evitar bloqueos
      await Promise.race([
        this.notificationsService.enqueueEnrollmentConfirmation({
          nombreUsuario: usuario.nombre,
          correo: usuario.correo,
          tituloEvento: evento.titulo,
          fechaInicio: evento.fechaInicio.toISOString(),
          fechaFin: evento.fechaFin.toISOString(),
          modalidad: evento.modalidad,
          ubicacion: evento.ubicacion,
          esPago: evento.tipoInscripcion === RegistrationInscripcionType.PAGA,
          appUrl,
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Email timeout')), 5000),
        ),
      ]);
    } catch (error) {
      console.error('Error enviando email de confirmación:', error.message);
      // Fallar silenciosamente - el email no es crítico
    }
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
      await manager.save(Registration, inscripcion);

      // Incrementar cupos directamente sin cargar relaciones del evento
      await manager.increment(
        Event,
        { id: dto.eventoId },
        'cuposDisponibles',
        1,
      );

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
      relations: ['usuario', 'evento'],
    });
    if (!registration) {
      throw new NotFoundException(`Inscripción con id "${id}" no encontrada`);
    }
    return registration;
  }
}
