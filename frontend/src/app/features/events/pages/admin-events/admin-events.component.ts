import { Component, OnInit } from '@angular/core';
import { EventsService } from '../../services/events.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { Event, EventFilters, EventStatus } from '../../models/event.models';

@Component({
  selector: 'app-admin-events',
  templateUrl: './admin-events.component.html',
  styleUrls: ['./admin-events.component.scss'],
})
export class AdminEventsComponent implements OnInit {
  events: Event[] = [];
  loading = true;
  error = '';
  total = 0;
  page = 1;
  limit = 10;
  searchInput = '';
  search = '';
  estadoFilter: EventStatus | '' = '';

  showFormModal = false;
  editingEvent: Event | null = null;

  confirmDeleteId: string | null = null;
  confirmDeleteTitle = '';
  deleting = false;

  expandedEventId: string | null = null;

  get isAdmin(): boolean {
    return this.authService.currentUser?.rol === 'ADMIN';
  }

  get isAdminOrOrganizador(): boolean {
    const rol = this.authService.currentUser?.rol;
    return rol === 'ADMIN' || rol === 'ORGANIZADOR';
  }

  get totalPages(): number {
    return Math.ceil(this.total / this.limit);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  constructor(
    private eventsService: EventsService,
    private authService: AuthService,
    private toastService: ToastService,
  ) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    this.loading = true;
    this.error = '';
    const filters: EventFilters = { page: this.page, limit: this.limit };
    if (this.search) filters.search = this.search;
    if (this.estadoFilter) filters.estado = this.estadoFilter;

    this.eventsService.getAllAdmin(filters).subscribe({
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

  onEstadoFilter(estado: string): void {
    this.page = 1;
    this.estadoFilter = estado as EventStatus | '';
    this.loadEvents();
  }

  onPageChange(p: number): void {
    this.page = p;
    this.loadEvents();
  }

  openCreate(): void {
    this.editingEvent = null;
    this.showFormModal = true;
  }

  openEdit(event: Event): void {
    this.editingEvent = event;
    this.showFormModal = true;
  }

  onFormSaved(): void {
    this.showFormModal = false;
    this.editingEvent = null;
    this.loadEvents();
  }

  onFormClosed(): void {
    this.showFormModal = false;
    this.editingEvent = null;
  }

  askDelete(event: Event): void {
    this.confirmDeleteId = event.id;
    this.confirmDeleteTitle = event.titulo;
  }

  cancelDelete(): void {
    this.confirmDeleteId = null;
    this.confirmDeleteTitle = '';
  }

  executeDelete(): void {
    if (!this.confirmDeleteId) return;
    this.deleting = true;
    this.eventsService.delete(this.confirmDeleteId).subscribe({
      next: () => {
        this.deleting = false;
        this.confirmDeleteId = null;
        this.confirmDeleteTitle = '';
        this.toastService.show('Evento eliminado correctamente.', 'success');
        this.loadEvents();
      },
      error: (err) => {
        this.deleting = false;
        const msg = err?.error?.message ?? 'No se pudo eliminar el evento.';
        this.toastService.show(Array.isArray(msg) ? msg[0] : msg, 'error');
      },
    });
  }

  statusLabel(s: string): string {
    const map: Record<string, string> = {
      BORRADOR: 'Borrador',
      PUBLICADO: 'Publicado',
      CANCELADO: 'Cancelado',
      FINALIZADO: 'Finalizado',
    };
    return map[s] ?? s;
  }

  statusClass(s: string): string {
    const map: Record<string, string> = {
      BORRADOR: 'badge--borrador',
      PUBLICADO: 'badge--publicado',
      CANCELADO: 'badge--cancelado',
      FINALIZADO: 'badge--finalizado',
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

  toggleSessions(eventId: string): void {
    this.expandedEventId = this.expandedEventId === eventId ? null : eventId;
  }
}
