import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  OrganizerService,
  AttendanceResponse,
  EventReport,
} from '../../services/organizer.service';

@Component({
  selector: 'app-organizer-event-detail',
  template: `
    <div class="p-6 max-w-5xl mx-auto">
      <h2 class="text-2xl font-bold mb-4">Panel de Evento</h2>

      <!-- Tabs -->
      <div class="flex gap-2 border-b mb-6">
        <button
          *ngFor="let tab of tabs"
          [class.border-b-2]="activeTab === tab.key"
          [class.border-blue-600]="activeTab === tab.key"
          class="px-4 py-2 font-medium"
          (click)="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Reporte -->
      <ng-container *ngIf="activeTab === 'reporte' && report">
        <div class="grid grid-cols-3 gap-4 mb-6">
          <div class="bg-blue-50 rounded p-4">
            <p class="text-sm text-blue-600">Total inscritos</p>
            <p class="text-3xl font-bold">{{ report.totalInscritos }}</p>
          </div>
          <div class="bg-green-50 rounded p-4">
            <p class="text-sm text-green-600">Asistentes</p>
            <p class="text-3xl font-bold">{{ report.totalAsistentes }}</p>
          </div>
          <div class="bg-purple-50 rounded p-4">
            <p class="text-sm text-purple-600">Tasa de asistencia</p>
            <p class="text-3xl font-bold">{{ report.tasaAsistencia }}%</p>
          </div>
        </div>

        <h3 class="font-semibold mb-2">Por estado de inscripción</h3>
        <ul class="text-sm">
          <li
            *ngFor="let estado of objectEntries(report.porEstado)"
            class="py-1"
          >
            <span class="font-medium">{{ estado[0] }}:</span> {{ estado[1] }}
          </li>
        </ul>
      </ng-container>

      <!-- Asistencia -->
      <ng-container *ngIf="activeTab === 'asistencia' && attendance">
        <p class="mb-4 text-sm text-gray-600">
          {{ attendance.total }} asistentes registrados ({{ attendance.tasa }}%)
        </p>
        <table class="w-full text-sm border-collapse">
          <thead>
            <tr class="bg-gray-100">
              <th class="text-left p-2">Nombre</th>
              <th class="text-left p-2">Correo</th>
              <th class="text-left p-2">Método</th>
              <th class="text-left p-2">Registrado</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let a of attendance.asistencias" class="border-b">
              <td class="p-2">{{ a.inscripcion.usuario.nombre }}</td>
              <td class="p-2">{{ a.inscripcion.usuario.correo }}</td>
              <td class="p-2">{{ a.metodo }}</td>
              <td class="p-2">{{ a.registradoEn | date: 'short' }}</td>
            </tr>
          </tbody>
        </table>
      </ng-container>

      <!-- Registrar Asistencia -->
      <ng-container *ngIf="activeTab === 'registrar-asistencia'">
        <div class="mb-4">
          <h3 class="text-lg font-semibold mb-2">Inscritos Confirmados</h3>
          <p class="text-sm text-gray-600 mb-4">
            Marca la asistencia de los participantes que se presentaron al
            evento
          </p>
        </div>

        <div
          *ngIf="confirmedRegistrations.length === 0"
          class="text-center py-8 text-gray-500"
        >
          No hay inscritos confirmados para este evento
        </div>

        <table
          *ngIf="confirmedRegistrations.length > 0"
          class="w-full text-sm border-collapse"
        >
          <thead>
            <tr class="bg-gray-100">
              <th class="text-left p-2">Nombre</th>
              <th class="text-left p-2">Correo</th>
              <th class="text-left p-2">Fecha inscripción</th>
              <th class="text-center p-2">Asistencia</th>
            </tr>
          </thead>
          <tbody>
            <tr
              *ngFor="let reg of confirmedRegistrations"
              class="border-b hover:bg-gray-50"
            >
              <td class="p-2">{{ reg.usuario.nombre }}</td>
              <td class="p-2">{{ reg.usuario.correo }}</td>
              <td class="p-2">{{ reg.createdAt | date: 'short' }}</td>
              <td class="p-2 text-center">
                <button
                  *ngIf="!isAttendanceMarked(reg.id)"
                  (click)="markAttendance(reg.id)"
                  [disabled]="loadingAttendance[reg.id]"
                  class="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 disabled:opacity-50"
                >
                  {{ loadingAttendance[reg.id] ? 'Procesando...' : 'Marcar' }}
                </button>
                <span
                  *ngIf="isAttendanceMarked(reg.id)"
                  class="text-green-600 font-medium flex items-center justify-center gap-1"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    class="w-4 h-4"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  Presente
                </span>
              </td>
            </tr>
          </tbody>
        </table>

        <p
          *ngIf="actionMessage"
          class="text-sm mt-4 p-3 bg-blue-50 text-blue-700 rounded"
        >
          {{ actionMessage }}
        </p>
      </ng-container>

      <!-- Acciones -->
      <ng-container *ngIf="activeTab === 'acciones'">
        <div class="mb-4">
          <h3 class="text-lg font-semibold mb-2">Acciones del Evento</h3>
        </div>

        <div class="space-y-4 max-w-2xl">
          <!-- Publicar evento -->
          <div class="border rounded-lg p-4">
            <h4 class="font-medium mb-2">Publicar Evento</h4>
            <p class="text-sm text-gray-600 mb-3">
              Envía el evento a revisión (si eres organizador) o publícalo
              directamente (si eres admin).
              <strong class="text-red-600">Nota:</strong> El evento debe tener
              al menos una sesión creada.
            </p>
            <button
              (click)="publishEvent()"
              class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Publicar evento
            </button>
          </div>

          <!-- Aprobar evento -->
          <div class="border rounded-lg p-4 bg-gray-50">
            <h4 class="font-medium mb-2">Aprobar Evento (Solo Admin)</h4>
            <p class="text-sm text-gray-600 mb-3">
              Aprueba un evento que está EN_REVISIÓN para publicarlo en el
              catálogo. Solo disponible para administradores.
            </p>
            <button
              (click)="approveEvent()"
              class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Aprobar evento
            </button>
          </div>

          <!-- Generar certificados -->
          <div class="border rounded-lg p-4">
            <h4 class="font-medium mb-2">Generar Certificados</h4>
            <p class="text-sm text-gray-600 mb-3">
              Genera certificados PDF para todos los asistentes que marcaste en
              la pestaña "Registrar Asistencia". El evento debe estar
              FINALIZADO.
            </p>
            <button
              (click)="generateCertificates()"
              class="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
              Generar certificados
            </button>
          </div>

          <div
            *ngIf="actionMessage"
            class="p-4 rounded-lg"
            [class.bg-green-50]="!actionMessage.includes('Error')"
            [class.text-green-700]="!actionMessage.includes('Error')"
            [class.bg-red-50]="actionMessage.includes('Error')"
            [class.text-red-700]="actionMessage.includes('Error')"
          >
            {{ actionMessage }}
          </div>
        </div>
      </ng-container>
    </div>
  `,
})
export class OrganizerEventDetailComponent implements OnInit {
  eventoId!: string;
  activeTab = 'reporte';
  tabs = [
    { key: 'reporte', label: 'Reporte' },
    { key: 'asistencia', label: 'Asistencia' },
    { key: 'registrar-asistencia', label: 'Registrar Asistencia' },
    { key: 'acciones', label: 'Acciones' },
  ];

  report?: EventReport;
  attendance?: AttendanceResponse;
  confirmedRegistrations: any[] = [];
  actionMessage = '';
  loadingAttendance: Record<string, boolean> = {};

  constructor(
    private readonly route: ActivatedRoute,
    private readonly organizerService: OrganizerService,
  ) {}

  ngOnInit(): void {
    this.eventoId = this.route.snapshot.paramMap.get('id') ?? '';
    this.loadReport();
    this.loadAttendance();
    this.loadConfirmedRegistrations();
  }

  loadReport(): void {
    this.organizerService.getEventReport(this.eventoId).subscribe({
      next: (r) => (this.report = r),
    });
  }

  loadAttendance(): void {
    this.organizerService.getAttendance(this.eventoId).subscribe({
      next: (a) => (this.attendance = a),
    });
  }

  loadConfirmedRegistrations(): void {
    this.organizerService.getConfirmedRegistrations(this.eventoId).subscribe({
      next: (regs) => (this.confirmedRegistrations = regs),
    });
  }

  markAttendance(inscripcionId: string): void {
    this.loadingAttendance[inscripcionId] = true;
    this.organizerService.registerAttendance(inscripcionId).subscribe({
      next: () => {
        this.actionMessage = 'Asistencia registrada correctamente.';
        this.loadingAttendance[inscripcionId] = false;
        this.loadAttendance();
        this.loadConfirmedRegistrations();
      },
      error: (e) => {
        this.actionMessage =
          e?.error?.message ?? 'Error al registrar asistencia';
        this.loadingAttendance[inscripcionId] = false;
      },
    });
  }

  isAttendanceMarked(inscripcionId: string): boolean {
    return (
      this.attendance?.asistencias.some(
        (a) => a.inscripcion.id === inscripcionId,
      ) ?? false
    );
  }

  publishEvent(): void {
    this.organizerService.publishEvent(this.eventoId).subscribe({
      next: () =>
        (this.actionMessage = 'Evento enviado a publicación correctamente.'),
      error: (e) =>
        (this.actionMessage = e?.error?.message ?? 'Error al publicar'),
    });
  }

  approveEvent(): void {
    this.organizerService.approveEvent(this.eventoId).subscribe({
      next: () => (this.actionMessage = 'Evento aprobado y publicado.'),
      error: (e) =>
        (this.actionMessage = e?.error?.message ?? 'Error al aprobar'),
    });
  }

  generateCertificates(): void {
    this.organizerService.generateCertificates(this.eventoId).subscribe({
      next: (r) =>
        (this.actionMessage = `${r.generados} certificados generados.`),
      error: (e) =>
        (this.actionMessage =
          e?.error?.message ?? 'Error al generar certificados'),
    });
  }

  objectEntries(obj: Record<string, number>): [string, number][] {
    return Object.entries(obj);
  }
}
