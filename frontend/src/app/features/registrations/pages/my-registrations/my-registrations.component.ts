import { Component, OnInit } from '@angular/core';
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

  constructor(
    private registrationsService: RegistrationsService,
    private authService: AuthService,
    private toastService: ToastService,
  ) {}

  ngOnInit(): void {
    this.load();
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
