import {
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import type {
  Stripe,
  StripeElements,
  StripePaymentElement,
} from '@stripe/stripe-js';
import { AuthService } from '../../../../core/services/auth.service';
import { RegistrationsService } from '../../../registrations/services/registrations.service';
import { Registration } from '../../../registrations/models/registration.models';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
})
export class CheckoutComponent implements OnInit, OnDestroy {
  inscripcionId = '';
  loading = true;
  paying = false;
  waitingForWebhook = false;
  elementReady = false;
  errorMessage = '';
  infoMessage = '';

  private pollTimeoutId: ReturnType<typeof setTimeout> | null = null;

  private stripe: Stripe | null = null;
  private elements: StripeElements | null = null;
  private paymentElement: StripePaymentElement | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private registrationsService: RegistrationsService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: object,
  ) {}

  ngOnInit(): void {
    this.inscripcionId = this.route.snapshot.queryParamMap.get('id') ?? '';
    if (!this.inscripcionId) {
      this.router.navigate(['/mis-inscripciones']);
      return;
    }

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const clientSecret =
      this.route.snapshot.queryParamMap.get('payment_intent_client_secret') ??
      '';

    if (clientSecret) {
      void this.resumePaymentFlow(clientSecret);
      return;
    }

    void this.startCheckout();
  }

  private async ensureStripe(): Promise<Stripe | null> {
    if (this.stripe) {
      return this.stripe;
    }

    const { loadStripe } = await import('@stripe/stripe-js');
    this.stripe = await loadStripe(environment.stripePublishableKey);

    if (!this.stripe) {
      this.errorMessage = 'No se pudo cargar el procesador de pagos.';
      this.loading = false;
      return null;
    }

    return this.stripe;
  }

  private async startCheckout(existingClientSecret?: string): Promise<void> {
    this.loading = true;
    this.errorMessage = '';
    this.infoMessage = '';
    this.waitingForWebhook = false;
    this.destroyPaymentElement();

    if (existingClientSecret) {
      await this.mountPaymentElement(existingClientSecret);
      return;
    }

    this.registrationsService
      .createPaymentIntent(this.inscripcionId)
      .subscribe({
        next: ({ clientSecret }) => {
          void this.mountPaymentElement(clientSecret);
        },
        error: (err) => {
          const msg = err?.error?.message ?? 'No se pudo iniciar el pago.';
          this.errorMessage = Array.isArray(msg) ? msg[0] : msg;
          this.loading = false;
        },
      });
  }

  private async mountPaymentElement(clientSecret: string): Promise<void> {
    const stripe = await this.ensureStripe();
    if (!stripe) {
      return;
    }

    this.elements = stripe.elements({ clientSecret, locale: 'es' });

    // Patrón de inicialización en dos fases:
    // primero renderizamos el contenedor visible y luego montamos Stripe.
    this.loading = false;
    this.elementReady = false;
    this.cdr.detectChanges();

    setTimeout(() => {
      this.paymentElement = this.elements!.create('payment');
      this.paymentElement.on('ready', () => {
        this.elementReady = true;
        this.cdr.detectChanges();
      });
      this.paymentElement.mount('#stripe-payment-element');
    }, 0);
  }

  private async resumePaymentFlow(clientSecret: string): Promise<void> {
    const stripe = await this.ensureStripe();
    if (!stripe) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.infoMessage = 'Verificando el estado del pago...';

    const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret);

    if (!paymentIntent) {
      this.errorMessage = 'No se pudo recuperar el estado del pago.';
      this.infoMessage = '';
      this.loading = false;
      return;
    }

    if (
      paymentIntent.status === 'succeeded' ||
      paymentIntent.status === 'processing'
    ) {
      this.waitingForWebhook = true;
      this.loading = false;
      this.infoMessage =
        paymentIntent.status === 'succeeded'
          ? 'Pago recibido. Estamos confirmando tu inscripción.'
          : 'Stripe está procesando el pago. Esperando confirmación final.';
      this.pollRegistrationStatus(0);
      return;
    }

    if (
      paymentIntent.status === 'requires_payment_method' ||
      paymentIntent.status === 'requires_confirmation'
    ) {
      this.infoMessage =
        'El pago no se completó. Puedes intentarlo nuevamente.';
      await this.startCheckout(clientSecret);
      return;
    }

    this.errorMessage = 'El pago fue cancelado o no pudo ser confirmado.';
    this.infoMessage = '';
    this.loading = false;
    await this.startCheckout();
  }

  private pollRegistrationStatus(attempt: number): void {
    const user = this.authService.currentUser;
    if (!user) {
      this.waitingForWebhook = false;
      this.errorMessage =
        'Debes iniciar sesión nuevamente para validar el pago.';
      return;
    }

    this.registrationsService
      .getMisInscripciones(user.id, { limit: 200 })
      .subscribe({
        next: (res) => {
          const registration = res.data.find(
            (item) => item.id === this.inscripcionId,
          );

          if (registration?.estado === 'CONFIRMADA') {
            this.finishSuccessfulPayment(registration);
            return;
          }

          if (registration?.estado === 'FALLIDA') {
            this.waitingForWebhook = false;
            this.errorMessage =
              'El pago fue rechazado. Verifica tu método de pago.';
            this.infoMessage = '';
            void this.startCheckout();
            return;
          }

          if (attempt >= 9) {
            this.waitingForWebhook = false;
            this.infoMessage =
              'El pago fue enviado, pero la confirmación aún no llegó. Revisa tus inscripciones en unos segundos.';
            this.router.navigate(['/mis-inscripciones'], {
              queryParams: { payment: 'pending_confirmation' },
              replaceUrl: true,
            });
            return;
          }

          this.pollTimeoutId = setTimeout(() => {
            this.pollRegistrationStatus(attempt + 1);
          }, 2000);
        },
        error: () => {
          this.waitingForWebhook = false;
          this.errorMessage =
            'No se pudo verificar el estado final del pago. Revisa tus inscripciones.';
        },
      });
  }

  private finishSuccessfulPayment(registration: Registration): void {
    this.waitingForWebhook = false;
    this.infoMessage = 'Pago confirmado. Redirigiendo a tus inscripciones...';
    this.router.navigate(['/mis-inscripciones'], {
      queryParams: { payment: 'success', event: registration.evento.titulo },
      replaceUrl: true,
    });
  }

  async onSubmit(): Promise<void> {
    if (
      !this.stripe ||
      !this.elements ||
      !this.paymentElement ||
      !this.elementReady ||
      this.paying
    ) {
      return;
    }

    this.paying = true;
    this.errorMessage = '';
    this.infoMessage = '';

    const returnUrl = `${window.location.origin}/checkout?id=${this.inscripcionId}`;

    const { error } = await this.stripe.confirmPayment({
      elements: this.elements,
      confirmParams: { return_url: returnUrl },
    });

    if (error) {
      this.paying = false;
      this.errorMessage =
        error.message ?? 'Error al procesar el pago. Intenta de nuevo.';
    }
    // Si no hay error, Stripe redirige automáticamente a return_url
  }

  goBack(): void {
    this.router.navigate(['/mis-inscripciones']);
  }

  ngOnDestroy(): void {
    if (this.pollTimeoutId) {
      clearTimeout(this.pollTimeoutId);
    }
    this.destroyPaymentElement();
  }

  private destroyPaymentElement(): void {
    this.paymentElement?.unmount();
    this.paymentElement = null;
    this.elementReady = false;
  }
}
