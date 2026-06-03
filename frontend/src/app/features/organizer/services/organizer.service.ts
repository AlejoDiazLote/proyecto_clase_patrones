import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface EventReport {
  eventoId: string;
  titulo: string;
  totalInscritos: number;
  totalAsistentes: number;
  tasaAsistencia: number;
  porEstado: Record<string, number>;
  porModalidad: string;
}

export interface AttendanceRecord {
  id: string;
  metodo: string;
  registradoEn: string;
  inscripcion: {
    id: string;
    usuario: { nombre: string; correo: string };
  };
}

export interface AttendanceResponse {
  total: number;
  tasa: number;
  asistencias: AttendanceRecord[];
}

@Injectable({ providedIn: 'root' })
export class OrganizerService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  getEventReport(eventoId: string): Observable<EventReport> {
    return this.http.get<EventReport>(
      `${this.apiUrl}/reports/events/${eventoId}`,
    );
  }

  getAttendance(eventoId: string): Observable<AttendanceResponse> {
    return this.http.get<AttendanceResponse>(
      `${this.apiUrl}/events/${eventoId}/attendance`,
    );
  }

  registerAttendance(
    inscripcionId: string,
    metodo = 'MANUAL',
  ): Observable<AttendanceRecord> {
    return this.http.post<AttendanceRecord>(`${this.apiUrl}/attendance`, {
      inscripcionId,
      metodo,
    });
  }

  publishEvent(eventoId: string): Observable<unknown> {
    return this.http.patch(`${this.apiUrl}/events/${eventoId}/publish`, {});
  }

  approveEvent(eventoId: string): Observable<unknown> {
    return this.http.patch(`${this.apiUrl}/events/${eventoId}/approve`, {});
  }

  inviteSpeaker(sessionId: string, ponenteId: string): Observable<unknown> {
    return this.http.post(`${this.apiUrl}/sessions/${sessionId}/speakers`, {
      ponenteId,
    });
  }

  getSessionSpeakers(sessionId: string): Observable<unknown[]> {
    return this.http.get<unknown[]>(
      `${this.apiUrl}/sessions/${sessionId}/speakers`,
    );
  }

  generateCertificates(eventoId: string): Observable<{ generados: number }> {
    return this.http.post<{ generados: number }>(
      `${this.apiUrl}/certificates/generate/${eventoId}`,
      {},
    );
  }

  getConfirmedRegistrations(eventoId: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/events/${eventoId}/registrations?estado=CONFIRMADA`,
    );
  }
}
