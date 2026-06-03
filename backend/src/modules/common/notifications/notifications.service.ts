import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

export interface RegistrationEmailPayload {
  nombre: string;
  correo: string;
  eventoTitulo: string;
  fechaInicio: string;
  modalidad: string;
  ubicacion?: string;
}

export interface CancellationEmailPayload {
  nombre: string;
  correo: string;
  eventoTitulo: string;
  motivo?: string;
}

export interface SpeakerInvitationPayload {
  nombre: string;
  correo: string;
  sesionTitulo: string;
  eventoTitulo: string;
  linkAceptar: string;
  linkRechazar: string;
}

export interface WelcomeEmailPayload {
  nombre: string;
  correo: string;
  appUrl: string;
}

export interface EnrollmentConfirmationPayload {
  nombreUsuario: string;
  correo: string;
  tituloEvento: string;
  fechaInicio: string;
  fechaFin: string;
  modalidad: string;
  ubicacion?: string;
  esPago: boolean;
  appUrl: string;
}

export interface PaymentConfirmationPayload {
  nombreUsuario: string;
  correo: string;
  tituloEvento: string;
  fechaInicio: string;
  fechaFin: string;
  modalidad: string;
  monto: number;
  metodoPago: string;
  transaccionId: string;
  fechaPago: string;
  appUrl: string;
}

export interface CertificateReadyPayload {
  nombreUsuario: string;
  correo: string;
  tituloEvento: string;
  fechaInicio: string;
  fechaFin: string;
  codigoCertificado: string;
  appUrl: string;
}

export const NOTIFICATIONS_QUEUE = 'notifications';
export const JOB_REGISTRATION_EMAIL = 'registration-email';
export const JOB_CANCELLATION_EMAIL = 'cancellation-email';
export const JOB_SPEAKER_INVITATION = 'speaker-invitation';
export const JOB_WELCOME_EMAIL = 'welcome-email';
export const JOB_ENROLLMENT_CONFIRMATION = 'enrollment-confirmation';
export const JOB_PAYMENT_CONFIRMATION = 'payment-confirmation';
export const JOB_CERTIFICATE_READY = 'certificate-ready';

/**
 * Servicio de notificaciones por email
 * Patrón: Queue-based Email Notifications con retry automático
 * Usa Bull para encolar jobs y procesarlos de forma asíncrona
 */
@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectQueue(NOTIFICATIONS_QUEUE)
    private readonly notificationsQueue: Queue,
  ) {}

  async enqueueRegistrationEmail(
    payload: RegistrationEmailPayload,
  ): Promise<void> {
    await this.notificationsQueue.add(JOB_REGISTRATION_EMAIL, payload, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
    });
    this.logger.log(`Email de confirmación encolado para ${payload.correo}`);
  }

  async enqueueCancellationEmail(
    payload: CancellationEmailPayload,
  ): Promise<void> {
    await this.notificationsQueue.add(JOB_CANCELLATION_EMAIL, payload, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
    });
    this.logger.log(`Email de cancelación encolado para ${payload.correo}`);
  }

  async enqueueSpeakerInvitation(
    payload: SpeakerInvitationPayload,
  ): Promise<void> {
    await this.notificationsQueue.add(JOB_SPEAKER_INVITATION, payload, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
    });
    this.logger.log(
      `Email de invitación ponente encolado para ${payload.correo}`,
    );
  }

  async enqueueWelcomeEmail(payload: WelcomeEmailPayload): Promise<void> {
    await this.notificationsQueue.add(JOB_WELCOME_EMAIL, payload, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
    });
    this.logger.log(`Email de bienvenida encolado para ${payload.correo}`);
  }

  async enqueueEnrollmentConfirmation(
    payload: EnrollmentConfirmationPayload,
  ): Promise<void> {
    await this.notificationsQueue.add(JOB_ENROLLMENT_CONFIRMATION, payload, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
    });
    this.logger.log(
      `Email de confirmación de inscripción encolado para ${payload.correo}`,
    );
  }

  async enqueuePaymentConfirmation(
    payload: PaymentConfirmationPayload,
  ): Promise<void> {
    await this.notificationsQueue.add(JOB_PAYMENT_CONFIRMATION, payload, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
    });
    this.logger.log(
      `Email de confirmación de pago encolado para ${payload.correo}`,
    );
  }

  async enqueueCertificateReady(
    payload: CertificateReadyPayload,
  ): Promise<void> {
    await this.notificationsQueue.add(JOB_CERTIFICATE_READY, payload, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
    });
    this.logger.log(
      `Email de certificado listo encolado para ${payload.correo}`,
    );
  }
}
