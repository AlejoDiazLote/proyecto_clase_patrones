import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EventsService } from '../../../events/services/events.service';

@Component({
  selector: 'app-organizer-dashboard',
  template: `
    <div class="p-6 max-w-5xl mx-auto">
      <h1 class="text-3xl font-bold mb-6">Panel del Organizador</h1>

      <div *ngIf="loading" class="text-gray-500">Cargando eventos...</div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          *ngFor="let evento of eventos"
          class="border rounded-lg p-4 shadow-sm hover:shadow-md cursor-pointer"
          (click)="goToDetail(evento.id)"
        >
          <h3 class="font-semibold text-lg mb-1">{{ evento.titulo }}</h3>
          <p class="text-sm text-gray-500 mb-2">
            {{ evento.fechaInicio | date: 'mediumDate' }}
          </p>
          <span
            class="text-xs px-2 py-1 rounded-full font-medium"
            [ngClass]="{
              'bg-yellow-100 text-yellow-800': evento.estado === 'BORRADOR',
              'bg-blue-100 text-blue-800': evento.estado === 'EN_REVISION',
              'bg-green-100 text-green-800': evento.estado === 'PUBLICADO',
              'bg-red-100 text-red-800': evento.estado === 'CANCELADO',
              'bg-gray-100 text-gray-800': evento.estado === 'FINALIZADO',
            }"
          >
            {{ evento.estado }}
          </span>
        </div>
      </div>

      <p *ngIf="!loading && eventos.length === 0" class="text-gray-500 mt-4">
        No tienes eventos creados aún.
      </p>
    </div>
  `,
})
export class OrganizerDashboardComponent implements OnInit {
  eventos: any[] = [];
  loading = true;

  constructor(
    private readonly eventsService: EventsService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.eventsService.getAll({}).subscribe({
      next: (res) => {
        this.eventos = (res as any).data ?? res;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  goToDetail(id: string): void {
    this.router.navigate(['/organizer/events', id]);
  }
}
