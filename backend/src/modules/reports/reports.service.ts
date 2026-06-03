import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from '../events/entities/event.entity';
import { Registration } from '../registrations/entities/registration.entity';
import { Attendance } from '../attendance/entities/attendance.entity';
import { RegistrationStatus } from '../../database/enums/registration-status.enum';

export interface EventReportDto {
  eventoId: string;
  titulo: string;
  totalInscritos: number;
  totalAsistentes: number;
  tasaAsistencia: number;
  porEstado: Record<string, number>;
  porModalidad: string;
}

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventsRepository: Repository<Event>,
    @InjectRepository(Registration)
    private readonly registrationsRepository: Repository<Registration>,
    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,
  ) {}

  async getEventReport(eventoId: string): Promise<EventReportDto> {
    const evento = await this.eventsRepository.findOne({
      where: { id: eventoId },
    });
    if (!evento)
      throw new NotFoundException(`Evento "${eventoId}" no encontrado`);

    // Conteos por estado
    const porEstadoRaw = await this.registrationsRepository
      .createQueryBuilder('r')
      .select('r.estado', 'estado')
      .addSelect('COUNT(*)', 'total')
      .where('r.evento_id = :eventoId', { eventoId })
      .groupBy('r.estado')
      .getRawMany<{ estado: string; total: string }>();

    const porEstado: Record<string, number> = {};
    let totalInscritos = 0;
    for (const row of porEstadoRaw) {
      porEstado[row.estado] = Number(row.total);
      totalInscritos += Number(row.total);
    }

    const confirmados = porEstado[RegistrationStatus.CONFIRMADA] ?? 0;

    const totalAsistentes = await this.attendanceRepository
      .createQueryBuilder('a')
      .leftJoin('a.inscripcion', 'ins')
      .where('ins.evento_id = :eventoId', { eventoId })
      .getCount();

    const tasaAsistencia =
      confirmados > 0 ? Math.round((totalAsistentes / confirmados) * 100) : 0;

    return {
      eventoId,
      titulo: evento.titulo,
      totalInscritos,
      totalAsistentes,
      tasaAsistencia,
      porEstado,
      porModalidad: evento.modalidad,
    };
  }
}
