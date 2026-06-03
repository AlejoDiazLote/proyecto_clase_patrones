import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as QRCode from 'qrcode';
import { Attendance } from './entities/attendance.entity';
import { Registration } from '../registrations/entities/registration.entity';
import { RegistrationStatus } from '../../database/enums/registration-status.enum';
import { AttendanceMethod } from '../../database/enums/attendance-method.enum';
import { RegisterAttendanceDto } from './dto/register-attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,
    @InjectRepository(Registration)
    private readonly registrationsRepository: Repository<Registration>,
  ) {}

  async register(dto: RegisterAttendanceDto): Promise<Attendance> {
    const inscripcion = await this.registrationsRepository.findOne({
      where: { id: dto.inscripcionId },
    });

    if (!inscripcion) {
      throw new NotFoundException(
        `Inscripción "${dto.inscripcionId}" no encontrada`,
      );
    }

    if (inscripcion.estado !== RegistrationStatus.CONFIRMADA) {
      throw new BadRequestException(
        `Solo los inscritos CONFIRMADOS pueden registrar asistencia (estado: ${inscripcion.estado})`,
      );
    }

    const existente = await this.attendanceRepository.findOne({
      where: { inscripcion: { id: dto.inscripcionId } },
    });

    if (existente) {
      throw new ConflictException(
        'La asistencia ya fue registrada para esta inscripción',
      );
    }

    const attendance = this.attendanceRepository.create({
      inscripcion,
      metodo: dto.metodo ?? AttendanceMethod.MANUAL,
    });

    return this.attendanceRepository.save(attendance);
  }

  async generateQr(inscripcionId: string): Promise<Buffer> {
    const inscripcion = await this.registrationsRepository.findOne({
      where: { id: inscripcionId },
    });

    if (!inscripcion) {
      throw new NotFoundException(
        `Inscripción "${inscripcionId}" no encontrada`,
      );
    }

    if (inscripcion.estado !== RegistrationStatus.CONFIRMADA) {
      throw new BadRequestException(
        'Solo inscripciones CONFIRMADAS pueden generar QR',
      );
    }

    const payload = JSON.stringify({ inscripcionId, ts: Date.now() });
    return QRCode.toBuffer(payload, { type: 'png', width: 300 });
  }

  async getByEvent(eventoId: string): Promise<{
    total: number;
    tasa: number;
    asistencias: Attendance[];
  }> {
    const asistencias = await this.attendanceRepository
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.inscripcion', 'ins')
      .leftJoinAndSelect('ins.usuario', 'usuario')
      .leftJoinAndSelect('ins.evento', 'evento')
      .where('evento.id = :eventoId', { eventoId })
      .getMany();

    const totalInscritos = await this.registrationsRepository.count({
      where: {
        evento: { id: eventoId },
        estado: RegistrationStatus.CONFIRMADA,
      },
    });

    const tasa =
      totalInscritos > 0
        ? Math.round((asistencias.length / totalInscritos) * 100)
        : 0;

    return { total: asistencias.length, tasa, asistencias };
  }
}
