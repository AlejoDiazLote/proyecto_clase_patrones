import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { RegistrationsService } from '../../services/registrations.service';
import { Registration } from '../../models/registration.models';

@Component({
  selector: 'app-my-registrations',
  templateUrl: './my-registrations.component.html',
  styleUrls: ['./my-registrations.component.scss'],
})
export class MyRegistrationsComponent implements OnInit {
  registrations: Registration[] = [];
  loading = true;
  error = '';
  cancellingId: string | null = null;
  payingId: string | null = null;

  constructor(
    private registrationsService: RegistrationsService,
    private authService: AuthService,
    private toastService: ToastService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.handlePaymentFeedback();
    this.load();
  }

  private handlePaymentFeedback(): void {
    const paymentState = this.route.snapshot.queryParamMap.get('payment');
    const eventTitle = this.route.snapshot.queryParamMap.get('event');

    if (paymentState === 'success') {
      const message = eventTitle
        ? `Pago confirmado para "${eventTitle}".`
        : 'Pago confirmado correctamente.';
      this.toastService.show(message, 'success');
    }

    if (paymentState === 'pending_confirmation') {
      this.toastService.show(
        'Stripe confirmó el pago, pero la inscripción aún se está sincronizando. Revisa nuevamente en unos segundos.',
        'success',
      );
    }

    if (paymentState) {
      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { payment: null, event: null },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    }
  }

  load(): void {
    const user = this.authService.currentUser;
    if (!user) return;

    this.loading = true;
    this.error = '';
    this.registrationsService.getMisInscripciones(user.id).subscribe({
      next: (res) => {
        this.registrations = res.data;
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar tus inscripciones.';
        this.loading = false;
      },
    });
  }

  canCancel(reg: Registration): boolean {
    return reg.estado === 'PENDIENTE' || reg.estado === 'CONFIRMADA';
  }

  canPay(reg: Registration): boolean {
    return reg.estado === 'PENDIENTE' && reg.evento.tipoInscripcion === 'PAGA';
  }

  canDownloadQr(reg: Registration): boolean {
    return reg.estado === 'CONFIRMADA';
  }

  canDownloadCertificate(reg: Registration): boolean {
    return reg.estado === 'CONFIRMADA' && !!reg.certificado;
  }

  cancelar(reg: Registration): void {
    const user = this.authService.currentUser;
    if (!user || this.cancellingId) return;

    this.cancellingId = reg.id;
    this.registrationsService
      .cancelarInscripcion({ usuarioId: user.id, eventoId: reg.evento.id })
      .subscribe({
        next: () => {
          this.cancellingId = null;
          this.toastService.show(
            'Inscripción cancelada correctamente.',
            'success',
          );
          this.load();
        },
        error: (err) => {
          this.cancellingId = null;
          const msg =
            err?.error?.message ?? 'No se pudo cancelar la inscripción.';
          this.toastService.show(Array.isArray(msg) ? msg[0] : msg, 'error');
        },
      });
  }

  pagar(reg: Registration): void {
    this.router.navigate(['/checkout'], { queryParams: { id: reg.id } });
  }

  descargarQr(reg: Registration): void {
    const url = this.registrationsService.getQrUrl(reg.id);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qr-${reg.id}.png`;
    a.target = '_blank';
    a.click();
  }

  descargarCertificado(reg: Registration): void {
    const codigoUnico = reg.certificado?.codigoUnico;
    if (!codigoUnico) return;
    this.registrationsService.getCertificate(codigoUnico).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `certificado-${codigoUnico}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: () =>
        this.toastService.show('No se pudo descargar el certificado.', 'error'),
    });
  }

  statusLabel(s: string): string {
    const map: Record<string, string> = {
      PENDIENTE: 'Pendiente',
      CONFIRMADA: 'Confirmada',
      CANCELADA: 'Cancelada',
      FALLIDA: 'Fallida',
    };
    return map[s] ?? s;
  }

  statusClass(s: string): string {
    const map: Record<string, string> = {
      PENDIENTE: 'status--pendiente',
      CONFIRMADA: 'status--confirmada',
      CANCELADA: 'status--cancelada',
      FALLIDA: 'status--fallida',
    };
    return map[s] ?? '';
  }

  modalityLabel(m: string): string {
    const map: Record<string, string> = {
      PRESENCIAL: 'Presencial',
      VIRTUAL: 'Virtual',
      HIBRIDO: 'Híbrido',
    };
    return map[m] ?? m;
  }

  modalityClass(m: string): string {
    const map: Record<string, string> = {
      PRESENCIAL: 'badge--presencial',
      VIRTUAL: 'badge--virtual',
      HIBRIDO: 'badge--hibrido',
    };
    return map[m] ?? '';
  }
}
