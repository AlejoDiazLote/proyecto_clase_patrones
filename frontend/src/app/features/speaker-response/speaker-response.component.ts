import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-speaker-response',
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50">
      <div
        class="bg-white rounded-xl shadow-md p-8 max-w-md w-full text-center"
      >
        <ng-container *ngIf="loading">
          <p class="text-gray-500">Procesando tu respuesta...</p>
        </ng-container>

        <ng-container *ngIf="!loading && success">
          <div class="text-green-500 text-5xl mb-4">✓</div>
          <h2 class="text-xl font-bold mb-2">¡Gracias!</h2>
          <p class="text-gray-600">
            Tu respuesta ha sido registrada correctamente.
          </p>
        </ng-container>

        <ng-container *ngIf="!loading && !success">
          <div class="text-red-500 text-5xl mb-4">✗</div>
          <h2 class="text-xl font-bold mb-2">Ocurrió un error</h2>
          <p class="text-gray-600">{{ errorMessage }}</p>
        </ng-container>
      </div>
    </div>
  `,
})
export class SpeakerResponseComponent implements OnInit {
  loading = true;
  success = false;
  errorMessage = 'No se pudo procesar la respuesta.';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly http: HttpClient,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.queryParamMap.get('id');
    const respuesta = this.route.snapshot.queryParamMap.get('respuesta');

    if (!id || !respuesta) {
      this.loading = false;
      this.errorMessage = 'Parámetros inválidos en el enlace.';
      return;
    }

    // Resolve session/ponente ID from the invitation entry ID
    // The endpoint PATCH /sessions/:sessionId/speakers/respond needs sessionId and ponenteId
    // We use a dedicated endpoint that accepts the invitation UUID directly
    this.http
      .patch(`${environment.apiUrl}/sessions/invitations/${id}/respond`, {
        respuesta,
      })
      .subscribe({
        next: () => {
          this.success = true;
          this.loading = false;
        },
        error: (e) => {
          this.errorMessage =
            e?.error?.message ?? 'Error al procesar la respuesta.';
          this.loading = false;
        },
      });
  }
}
