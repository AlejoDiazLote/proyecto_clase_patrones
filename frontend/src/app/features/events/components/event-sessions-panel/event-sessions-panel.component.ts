import { Component, Input, OnInit } from '@angular/core';
import { SessionsService } from '../../services/sessions.service';
import { ToastService } from '../../../../core/services/toast.service';
import { Session } from '../../models/session.models';

@Component({
  selector: 'app-event-sessions-panel',
  templateUrl: './event-sessions-panel.component.html',
  styleUrls: ['./event-sessions-panel.component.scss'],
})
export class EventSessionsPanelComponent implements OnInit {
  @Input() eventId!: string;
  @Input() isAdminOrOrganizador = false;
  @Input() isAdmin = false;

  sessions: Session[] = [];
  loading = true;
  error = '';

  showFormModal = false;
  editingSession: Session | null = null;

  confirmDeleteId: string | null = null;
  confirmDeleteTitle = '';
  deleting = false;

  constructor(
    private sessionsService: SessionsService,
    private toastService: ToastService,
  ) {}

  ngOnInit(): void {
    this.loadSessions();
  }

  loadSessions(): void {
    this.loading = true;
    this.error = '';
    this.sessionsService.getByEvent(this.eventId).subscribe({
      next: (res) => {
        this.sessions = res.data;
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar las sesiones.';
        this.loading = false;
      },
    });
  }

  openCreate(): void {
    this.editingSession = null;
    this.showFormModal = true;
  }

  openEdit(session: Session): void {
    this.editingSession = session;
    this.showFormModal = true;
  }

  onFormSaved(): void {
    this.showFormModal = false;
    this.editingSession = null;
    this.loadSessions();
  }

  onFormClosed(): void {
    this.showFormModal = false;
    this.editingSession = null;
  }

  askDelete(session: Session): void {
    this.confirmDeleteId = session.id;
    this.confirmDeleteTitle = session.titulo;
  }

  cancelDelete(): void {
    this.confirmDeleteId = null;
    this.confirmDeleteTitle = '';
  }

  executeDelete(): void {
    if (!this.confirmDeleteId) return;
    this.deleting = true;
    this.sessionsService.delete(this.confirmDeleteId).subscribe({
      next: () => {
        this.deleting = false;
        this.toastService.show('Sesión eliminada.', 'success');
        this.confirmDeleteId = null;
        this.confirmDeleteTitle = '';
        this.loadSessions();
      },
      error: () => {
        this.deleting = false;
        this.toastService.show('Error al eliminar la sesión.', 'error');
      },
    });
  }
}
