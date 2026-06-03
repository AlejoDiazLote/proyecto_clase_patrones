import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { EventsService } from '../../services/events.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { RegistrationsService } from '../../../registrations/services/registrations.service';
import { Registration } from '../../../registrations/models/registration.models';
import { AuthUser } from '../../../../core/models/auth.models';
import { Event, EventFilters } from '../../models/event.models';

@Component({
  selector: 'app-events-catalog',
  templateUrl: './events-catalog.component.html',
  styleUrls: ['./events-catalog.component.scss'],
})
export class EventsCatalogComponent implements OnInit {
  events: Event[] = [];
  loading = true;
  error = '';
  total = 0;
  page = 1;
  limit = 12;
  search = '';
  searchInput = '';

  currentUser$!: Observable<AuthUser | null>;
  isLoggedIn = false;

  selectedEvent: Event | null = null;
  inscriptionState: 'idle' | 'loading' | 'success' | 'error' = 'idle';
  paymentState: 'idle' | 'loading' = 'idle';
  enrolledEventIds = new Set<string>();
  /** Mapa eventoId → inscripción del usuario */
  userRegistrationsMap = new Map<string, Registration>();

  constructor(
    private eventsService: EventsService,
    private authService: AuthService,
    private registrationsService: RegistrationsService,
    private toastService: ToastService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.currentUser$ = this.authService.currentUser$;
    this.authService.currentUser$.subscribe((user) => {
      this.isLoggedIn = !!user;
      if (user) {
        this.loadEnrolled(user.id);
      } else {
        this.enrolledEventIds.clear();
        this.userRegistrationsMap.clear();
      }
    });
    // Cargar eventos siempre
    this.loadEvents();
  }

  loadEnrolled(userId: string): void {
    console.log('[EventsCatalog] Cargando inscripciones para usuario:', userId);
    this.registrationsService
      .getMisInscripciones(userId, { limit: 200 })
      .subscribe({
        next: (res) => {
          console.log('[EventsCatalog] Inscripciones recibidas:', res);
          this.enrolledEventIds = new Set(
            res.data
              .filter(
                (r) => r.estado === 'CONFIRMADA' || r.estado === 'PENDIENTE',
              )
              .map((r) => r.evento.id),
          );
          this.userRegistrationsMap = new Map(
            res.data
              .filter(
                (r) => r.estado === 'CONFIRMADA' || r.estado === 'PENDIENTE',
              )
              .map((r) => [r.evento.id, r]),
          );
          console.log(
            '[EventsCatalog] enrolledEventIds:',
            Array.from(this.enrolledEventIds),
          );
          console.log(
            '[EventsCatalog] userRegistrationsMap size:',
            this.userRegistrationsMap.size,
          );
          // Forzar detección de cambios después de cargar inscripciones
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('[EventsCatalog] Error cargando inscripciones:', err);
          // No mostramos error al usuario, solo fallamos silenciosamente
          // Los eventos ya se cargaron de todas formas
        },
      });
  }

  isEnrolled(eventId: string): boolean {
    return this.enrolledEventIds.has(eventId);
  }

  getUserRegistration(eventId: string): Registration | null {
    return this.userRegistrationsMap.get(eventId) ?? null;
  }

  loadEvents(): void {
    this.loading = true;
    this.error = '';
    const filters: EventFilters = {
      page: this.page,
      limit: this.limit,
      estado: 'PUBLICADO',
    };
    if (this.search) filters.search = this.search;

    this.eventsService.getAll(filters).subscribe({
      next: (res) => {
        this.events = res.data;
        this.total = res.total;
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar los eventos.';
        this.loading = false;
      },
    });
  }

  onSearch(): void {
    this.page = 1;
    this.search = this.searchInput.trim();
    this.loadEvents();
  }

  onPageChange(newPage: number): void {
    this.page = newPage;
    this.loadEvents();
  }

  get totalPages(): number {
    return Math.ceil(this.total / this.limit);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
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

  openDetail(event: Event): void {
    this.selectedEvent = event;
    this.inscriptionState = 'idle';
    this.paymentState = 'idle';
  }

  closeDetail(): void {
    this.selectedEvent = null;
    this.inscriptionState = 'idle';
    this.paymentState = 'idle';
  }

  onInscribir(event: Event): void {
    const user = this.authService.currentUser;
    if (!user) return;

    // Debug: Verificar los valores antes de enviar
    console.log('[DEBUG] Inscripción:', {
      usuarioId: user.id,
      eventoId: event.id,
      eventoIdType: typeof event.id,
      evento: event,
    });

    this.inscriptionState = 'loading';
    this.registrationsService
      .inscribirse({ usuarioId: user.id, eventoId: event.id })
      .subscribe({
        next: (reg) => {
          this.inscriptionState = 'success';
          this.enrolledEventIds.add(event.id);
          this.userRegistrationsMap.set(event.id, reg);
          // Decrementar cupos localmente
          this.events = this.events.map((e) =>
            e.id === event.id
              ? { ...e, cuposDisponibles: e.cuposDisponibles - 1 }
              : e,
          );
          if (this.selectedEvent?.id === event.id) {
            this.selectedEvent = {
              ...this.selectedEvent,
              cuposDisponibles: this.selectedEvent.cuposDisponibles - 1,
            };
          }
          if (reg.estado === 'CONFIRMADA') {
            this.toastService.show('¡Inscripción confirmada!', 'success');
          } else {
            this.toastService.show(
              'Inscripción registrada. Pago pendiente de procesamiento.',
              'warning',
            );
          }
          // Forzar detección de cambios
          this.cdr.markForCheck();
          // Resetear estado después de 2 segundos
          setTimeout(() => {
            this.inscriptionState = 'idle';
            this.cdr.markForCheck();
          }, 2000);
        },
        error: (err) => {
          this.inscriptionState = 'idle';
          const msg =
            err?.error?.message ?? 'No se pudo completar la inscripción.';
          this.toastService.show(Array.isArray(msg) ? msg[0] : msg, 'error');
          this.cdr.markForCheck();
        },
      });
  }

  onPagar(reg: Registration): void {
    this.router.navigate(['/checkout'], { queryParams: { id: reg.id } });
  }
}
