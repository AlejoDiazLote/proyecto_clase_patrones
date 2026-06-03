import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import Stripe = require('stripe');
import { Payment } from './entities/payment.entity';
import { Registration } from '../registrations/entities/registration.entity';
import { RegistrationStatus } from '../../database/enums/registration-status.enum';
import { PaymentStatus } from '../../database/enums/payment-status.enum';
import { NotificationsService } from '../common/notifications/notifications.service';

@Injectable()
export class PaymentsService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly stripe: any;
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(Payment)
    private readonly paymentsRepository: Repository<Payment>,
    @InjectRepository(Registration)
    private readonly registrationsRepository: Repository<Registration>,
    private readonly configService: ConfigService,
    private readonly notificationsService: NotificationsService,
  ) {
    this.stripe = new Stripe(
      this.configService.getOrThrow<string>('STRIPE_SECRET_KEY'),
      { apiVersion: '2026-05-27.dahlia' },
    );
  }

  async createPaymentIntent(
    inscripcionId: string,
  ): Promise<{ clientSecret: string }> {
    const inscripcion = await this.registrationsRepository.findOne({
      where: { id: inscripcionId },
      relations: ['evento'],
    });

    if (!inscripcion) {
      throw new NotFoundException(
        `Inscripción "${inscripcionId}" no encontrada`,
      );
    }

    if (inscripcion.estado !== RegistrationStatus.PENDIENTE) {
      throw new BadRequestException(
        `La inscripción ya está en estado "${inscripcion.estado}". Solo se puede pagar inscripciones PENDIENTE`,
      );
    }

    // Idempotencia: verificar si ya existe un PaymentIntent activo
    const pagoExistente = await this.paymentsRepository.findOne({
      where: { inscripcion: { id: inscripcionId } },
    });

    if (pagoExistente && pagoExistente.estado === PaymentStatus.PENDIENTE) {
      // Recuperar el PaymentIntent existente de Stripe
      const pi = await this.stripe.paymentIntents.retrieve(
        pagoExistente.stripePaymentIntentId,
      );
      return { clientSecret: pi.client_secret! };
    }

    if (pagoExistente && pagoExistente.estado === PaymentStatus.COMPLETADO) {
      throw new ConflictException('Esta inscripción ya fue pagada');
    }

    if (!inscripcion.evento?.precio || inscripcion.evento.precio <= 0) {
      throw new BadRequestException(
        'El evento no tiene un precio válido configurado',
      );
    }

    const montoEnCentavos = Math.round(inscripcion.evento.precio * 100);

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: montoEnCentavos,
      currency: 'usd',
      metadata: { inscripcionId },
    });

    const pago = this.paymentsRepository.create({
      inscripcion,
      stripePaymentIntentId: paymentIntent.id,
      estado: PaymentStatus.PENDIENTE,
      monto: montoEnCentavos / 100,
      moneda: 'usd',
    });

    await this.paymentsRepository.save(pago);

    return { clientSecret: paymentIntent.client_secret! };
  }

  async handleWebhook(payload: Buffer, signature: string): Promise<void> {
    const webhookSecret = this.configService.getOrThrow<string>(
      'STRIPE_WEBHOOK_SECRET',
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let event: any;
    try {
      event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret,
      );
    } catch {
      throw new BadRequestException('Firma de webhook inválida');
    }

    if (event.type === 'payment_intent.succeeded') {
      await this.handlePaymentSucceeded(event.data.object);
    } else if (event.type === 'payment_intent.payment_failed') {
      await this.handlePaymentFailed(event.data.object);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async handlePaymentSucceeded(pi: any): Promise<void> {
    const pago = await this.paymentsRepository.findOne({
      where: { stripePaymentIntentId: pi.id },
      relations: ['inscripcion', 'inscripcion.usuario', 'inscripcion.evento'],
    });

    if (!pago) {
      this.logger.warn(`PaymentIntent ${pi.id} no encontrado en BD`);
      return;
    }

    // Idempotencia: si ya está completado, ignorar
    if (pago.estado === PaymentStatus.COMPLETADO) return;

    pago.estado = PaymentStatus.COMPLETADO;
    await this.paymentsRepository.save(pago);

    await this.registrationsRepository.update(
      { id: pago.inscripcion.id },
      { estado: RegistrationStatus.CONFIRMADA },
    );

    this.logger.log(`Pago confirmado para inscripción ${pago.inscripcion.id}`);

    // Enviar email de confirmación de pago
    const appUrl = this.configService.get<string>(
      'APP_URL',
      'http://localhost:4200',
    );
    const paymentMethod =
      pi.charges?.data?.[0]?.payment_method_details?.type || 'card';
    await this.notificationsService.enqueuePaymentConfirmation({
      nombreUsuario: pago.inscripcion.usuario.nombre,
      correo: pago.inscripcion.usuario.correo,
      tituloEvento: pago.inscripcion.evento.titulo,
      fechaInicio: pago.inscripcion.evento.fechaInicio.toISOString(),
      fechaFin: pago.inscripcion.evento.fechaFin.toISOString(),
      modalidad: pago.inscripcion.evento.modalidad,
      monto: pago.monto,
      metodoPago: paymentMethod,
      transaccionId: pi.id,
      fechaPago: new Date(pi.created * 1000).toISOString(),
      appUrl,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async handlePaymentFailed(pi: any): Promise<void> {
    const pago = await this.paymentsRepository.findOne({
      where: { stripePaymentIntentId: pi.id },
    });

    if (!pago || pago.estado !== PaymentStatus.PENDIENTE) return;

    pago.estado = PaymentStatus.FALLIDO;
    await this.paymentsRepository.save(pago);

    await this.registrationsRepository.update(
      { id: pago.inscripcion.id },
      { estado: RegistrationStatus.FALLIDA },
    );

    this.logger.warn(`Pago fallido para inscripción ${pago.inscripcion.id}`);
  }
}
