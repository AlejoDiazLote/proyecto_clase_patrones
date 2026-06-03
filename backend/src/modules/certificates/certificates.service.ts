import {
  BadRequestException,
  Injectable,
  NotFoundException,
  StreamableFile,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import * as PDFDocument from 'pdfkit';
import { Certificate } from './entities/certificate.entity';
import { Registration } from '../registrations/entities/registration.entity';
import { Attendance } from '../attendance/entities/attendance.entity';
import { Event } from '../events/entities/event.entity';
import { EventStatus } from '../../database/enums/event-status.enum';
import { RegistrationStatus } from '../../database/enums/registration-status.enum';
import { NotificationsService } from '../common/notifications/notifications.service';

@Injectable()
export class CertificatesService {
  constructor(
    @InjectRepository(Certificate)
    private readonly certificatesRepository: Repository<Certificate>,
    @InjectRepository(Registration)
    private readonly registrationsRepository: Repository<Registration>,
    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,
    @InjectRepository(Event)
    private readonly eventsRepository: Repository<Event>,
    private readonly notificationsService: NotificationsService,
    private readonly configService: ConfigService,
  ) {}

  async generateForEvent(eventoId: string): Promise<{ generados: number }> {
    const evento = await this.eventsRepository.findOne({
      where: { id: eventoId },
    });
    if (!evento)
      throw new NotFoundException(`Evento "${eventoId}" no encontrado`);

    if (evento.estado !== EventStatus.FINALIZADO) {
      throw new BadRequestException(
        'Solo se pueden generar certificados para eventos FINALIZADOS',
      );
    }

    const asistencias = await this.attendanceRepository
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.inscripcion', 'ins')
      .leftJoinAndSelect('ins.usuario', 'usuario')
      .leftJoinAndSelect('ins.evento', 'evento')
      .where('evento.id = :eventoId', { eventoId })
      .getMany();

    let generados = 0;

    for (const asistencia of asistencias) {
      const inscripcion = asistencia.inscripcion;

      // Verificar que la inscripción está confirmada
      if (inscripcion.estado !== RegistrationStatus.CONFIRMADA) continue;

      // No generar duplicados
      const existente = await this.certificatesRepository.findOne({
        where: { inscripcion: { id: inscripcion.id } },
      });
      if (existente) continue;

      const cert = this.certificatesRepository.create({
        inscripcion,
        codigoUnico: uuidv4(),
      });

      await this.certificatesRepository.save(cert);
      generados++;

      // Enviar email de certificado listo
      const appUrl = this.configService.get<string>(
        'APP_URL',
        'http://localhost:4200',
      );
      await this.notificationsService.enqueueCertificateReady({
        nombreUsuario: inscripcion.usuario.nombre,
        correo: inscripcion.usuario.correo,
        tituloEvento: inscripcion.evento.titulo,
        fechaInicio: inscripcion.evento.fechaInicio.toISOString(),
        fechaFin: inscripcion.evento.fechaFin.toISOString(),
        codigoCertificado: cert.codigoUnico,
        appUrl,
      });
    }

    return { generados };
  }

  async getByCodigoUnico(codigoUnico: string): Promise<StreamableFile> {
    const cert = await this.certificatesRepository.findOne({
      where: { codigoUnico },
      relations: ['inscripcion', 'inscripcion.usuario', 'inscripcion.evento'],
    });

    if (!cert) throw new NotFoundException('Certificado no encontrado');

    const buffer = await this.buildPdf(
      cert.inscripcion.usuario.nombre,
      cert.inscripcion.evento.titulo,
      cert.inscripcion.evento.fechaInicio,
      cert.inscripcion.evento.fechaFin,
      cert.codigoUnico,
    );

    return new StreamableFile(buffer, {
      type: 'application/pdf',
      disposition: `attachment; filename="certificado-${codigoUnico}.pdf"`,
    });
  }

  async findByRegistration(inscripcionId: string): Promise<Certificate | null> {
    return this.certificatesRepository.findOne({
      where: { inscripcion: { id: inscripcionId } },
      relations: ['inscripcion', 'inscripcion.usuario', 'inscripcion.evento'],
    });
  }

  /**
   * Obtiene todos los certificados de un usuario
   * @param userId - ID del usuario
   * @returns Lista de certificados con información del evento
   */
  async findByUser(userId: string): Promise<Certificate[]> {
    return this.certificatesRepository
      .createQueryBuilder('cert')
      .leftJoinAndSelect('cert.inscripcion', 'ins')
      .leftJoinAndSelect('ins.evento', 'evento')
      .leftJoinAndSelect('ins.usuario', 'usuario')
      .where('usuario.id = :userId', { userId })
      .orderBy('cert.generadoEn', 'DESC')
      .getMany();
  }

  private buildPdf(
    nombre: string,
    eventoTitulo: string,
    fechaInicio: Date,
    fechaFin: Date,
    codigo: string,
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margin: 50,
      });
      const buffers: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Fondo
      doc.rect(0, 0, doc.page.width, doc.page.height).fill('#f0f4ff');
      doc
        .rect(30, 30, doc.page.width - 60, doc.page.height - 60)
        .stroke('#2563eb');

      // Título
      doc
        .fontSize(32)
        .fillColor('#1e3a8a')
        .font('Helvetica-Bold')
        .text('CERTIFICADO DE PARTICIPACIÓN', 60, 80, { align: 'center' });

      // Línea separadora
      doc
        .moveTo(80, 130)
        .lineTo(doc.page.width - 80, 130)
        .stroke('#2563eb');

      // Cuerpo
      doc
        .fontSize(16)
        .fillColor('#333')
        .font('Helvetica')
        .text('Se certifica que:', 60, 160, { align: 'center' });

      doc
        .fontSize(26)
        .fillColor('#1e3a8a')
        .font('Helvetica-Bold')
        .text(nombre, 60, 195, { align: 'center' });

      doc
        .fontSize(16)
        .fillColor('#333')
        .font('Helvetica')
        .text('participó satisfactoriamente en el evento:', 60, 240, {
          align: 'center',
        });

      doc
        .fontSize(20)
        .fillColor('#1d4ed8')
        .font('Helvetica-Bold')
        .text(eventoTitulo, 60, 270, { align: 'center' });

      const inicio = new Date(fechaInicio).toLocaleDateString('es', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      const fin = new Date(fechaFin).toLocaleDateString('es', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      doc
        .fontSize(14)
        .fillColor('#555')
        .font('Helvetica')
        .text(`Celebrado del ${inicio} al ${fin}`, 60, 315, {
          align: 'center',
        });

      // Código de verificación
      doc
        .fontSize(10)
        .fillColor('#888')
        .text(`Código de verificación: ${codigo}`, 60, doc.page.height - 70, {
          align: 'center',
        });

      doc.end();
    });
  }
}
