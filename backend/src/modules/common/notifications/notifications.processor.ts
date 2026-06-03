import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { MailerService } from '@nestjs-modules/mailer';
import {
  CancellationEmailPayload,
  JOB_CANCELLATION_EMAIL,
  JOB_REGISTRATION_EMAIL,
  JOB_SPEAKER_INVITATION,
  JOB_WELCOME_EMAIL,
  JOB_ENROLLMENT_CONFIRMATION,
  JOB_PAYMENT_CONFIRMATION,
  JOB_CERTIFICATE_READY,
  NOTIFICATIONS_QUEUE,
  RegistrationEmailPayload,
  SpeakerInvitationPayload,
  WelcomeEmailPayload,
  EnrollmentConfirmationPayload,
  PaymentConfirmationPayload,
  CertificateReadyPayload,
} from './notifications.service';

/**
 * Procesador de trabajos de notificación
 * Patrón: Worker Pattern - procesa jobs de manera asíncrona desde la cola
 */
@Processor(NOTIFICATIONS_QUEUE)
export class NotificationsProcessor {
  private readonly logger = new Logger(NotificationsProcessor.name);

  constructor(private readonly mailerService: MailerService) {}

  @Process(JOB_REGISTRATION_EMAIL)
  async handleRegistrationEmail(
    job: Job<RegistrationEmailPayload>,
  ): Promise<void> {
    const { correo, nombre, eventoTitulo, fechaInicio, modalidad, ubicacion } =
      job.data;
    await this.mailerService.sendMail({
      to: correo,
      subject: `Inscripción confirmada: ${eventoTitulo}`,
      template: 'confirmacion-inscripcion',
      context: { nombre, eventoTitulo, fechaInicio, modalidad, ubicacion },
    });
    this.logger.log(`Email de confirmación enviado a ${correo}`);
  }

  @Process(JOB_CANCELLATION_EMAIL)
  async handleCancellationEmail(
    job: Job<CancellationEmailPayload>,
  ): Promise<void> {
    const { correo, nombre, eventoTitulo, motivo } = job.data;
    await this.mailerService.sendMail({
      to: correo,
      subject: `Evento cancelado: ${eventoTitulo}`,
      template: 'cancelacion-evento',
      context: { nombre, eventoTitulo, motivo },
    });
    this.logger.log(`Email de cancelación enviado a ${correo}`);
  }

  @Process(JOB_SPEAKER_INVITATION)
  async handleSpeakerInvitation(
    job: Job<SpeakerInvitationPayload>,
  ): Promise<void> {
    const {
      correo,
      nombre,
      sesionTitulo,
      eventoTitulo,
      linkAceptar,
      linkRechazar,
    } = job.data;
    await this.mailerService.sendMail({
      to: correo,
      subject: `Invitación como ponente: ${sesionTitulo}`,
      template: 'invitacion-ponente',
      context: {
        nombre,
        sesionTitulo,
        eventoTitulo,
        linkAceptar,
        linkRechazar,
      },
    });
    this.logger.log(`Email de invitación ponente enviado a ${correo}`);
  }

  @Process(JOB_WELCOME_EMAIL)
  async handleWelcomeEmail(job: Job<WelcomeEmailPayload>): Promise<void> {
    const { correo, nombre, appUrl } = job.data;
    await this.mailerService.sendMail({
      to: correo,
      subject: '¡Bienvenido a Eventos Académicos!',
      template: 'welcome',
      context: { nombre, appUrl },
    });
    this.logger.log(`Email de bienvenida enviado a ${correo}`);
  }

  @Process(JOB_ENROLLMENT_CONFIRMATION)
  async handleEnrollmentConfirmation(
    job: Job<EnrollmentConfirmationPayload>,
  ): Promise<void> {
    const {
      correo,
      nombreUsuario,
      tituloEvento,
      fechaInicio,
      fechaFin,
      modalidad,
      ubicacion,
      esPago,
      appUrl,
    } = job.data;
    await this.mailerService.sendMail({
      to: correo,
      subject: `Inscripción confirmada: ${tituloEvento}`,
      template: 'enrollment-confirmation',
      context: {
        nombreUsuario,
        tituloEvento,
        fechaInicio,
        fechaFin,
        modalidad,
        ubicacion,
        esPago,
        appUrl,
      },
    });
    this.logger.log(`Email de inscripción enviado a ${correo}`);
  }

  @Process(JOB_PAYMENT_CONFIRMATION)
  async handlePaymentConfirmation(
    job: Job<PaymentConfirmationPayload>,
  ): Promise<void> {
    const {
      correo,
      nombreUsuario,
      tituloEvento,
      fechaInicio,
      fechaFin,
      modalidad,
      monto,
      metodoPago,
      transaccionId,
      fechaPago,
      appUrl,
    } = job.data;
    await this.mailerService.sendMail({
      to: correo,
      subject: `¡Pago confirmado! - ${tituloEvento}`,
      template: 'payment-confirmation',
      context: {
        nombreUsuario,
        tituloEvento,
        fechaInicio,
        fechaFin,
        modalidad,
        monto,
        metodoPago,
        transaccionId,
        fechaPago,
        appUrl,
      },
    });
    this.logger.log(`Email de confirmación de pago enviado a ${correo}`);
  }

  @Process(JOB_CERTIFICATE_READY)
  async handleCertificateReady(
    job: Job<CertificateReadyPayload>,
  ): Promise<void> {
    const {
      correo,
      nombreUsuario,
      tituloEvento,
      fechaInicio,
      fechaFin,
      codigoCertificado,
      appUrl,
    } = job.data;
    await this.mailerService.sendMail({
      to: correo,
      subject: `🏆 Tu certificado está listo - ${tituloEvento}`,
      template: 'certificate-ready',
      context: {
        nombreUsuario,
        tituloEvento,
        fechaInicio,
        fechaFin,
        codigoCertificado,
        appUrl,
      },
    });
    this.logger.log(`Email de certificado listo enviado a ${correo}`);
  }
}
