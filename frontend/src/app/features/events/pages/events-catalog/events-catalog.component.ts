import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { EventsService } from '../../services/events.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { RegistrationsService } from '../../../registrations/services/registrations.service';
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
  enrolledEventIds = new Set<string>();

  constructor(
    private eventsService: EventsService,
    private authService: AuthService,
    private registrationsService: RegistrationsService,
    private toastService: ToastService,
  ) {}

  ngOnInit(): void {
    this.currentUser$ = this.authService.currentUser$;
    this.authService.currentUser$.subscribe((user) => {
      this.isLoggedIn = !!user;
      if (user) {
        this.loadEnrolled(user.id);
      } else {
        this.enrolledEventIds.clear();
      }
    });
    this.loadEvents();
  }

  loadEnrolled(userId: string): void {
    this.registrationsService
      .getMisInscripciones(userId, { limit: 200 })
      .subscribe({
        next: (res) => {
          this.enrolledEventIds = new Set(
            res.data
              .filter(
                (r) => r.estado === 'CONFIRMADA' || r.estado === 'PENDIENTE',
              )
              .map((r) => r.evento.id),
          );
        },
        error: () => {},
      });
  }

  isEnrolled(eventId: string): boolean {
    return this.enrolledEventIds.has(eventId);
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
  }

  closeDetail(): void {
    this.selectedEvent = null;
    this.inscriptionState = 'idle';
  }

  onInscribir(event: Event): void {
    const user = this.authService.currentUser;
    if (!user) return;

    this.inscriptionState = 'loading';
    this.registrationsService
      .inscribirse({ usuarioId: user.id, eventoId: event.id })
      .subscribe({
        next: (reg) => {
          this.inscriptionState = 'success';
          this.enrolledEventIds.add(event.id);
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
        },
        error: (err) => {
          this.inscriptionState = 'idle';
          const msg =
            err?.error?.message ?? 'No se pudo completar la inscripción.';
          this.toastService.show(Array.isArray(msg) ? msg[0] : msg, 'error');
        },
      });
  }
}
