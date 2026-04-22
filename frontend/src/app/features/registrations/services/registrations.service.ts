import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  Registration,
  InscribirseDto,
  CancelarInscripcionDto,
  FilterRegistrationDto,
  PaginatedRegistrations,
} from '../models/registration.models';

@Injectable({ providedIn: 'root' })
export class RegistrationsService {
  private readonly baseUrl = `${environment.apiUrl}/inscripciones`;

  constructor(private http: HttpClient) {}

  inscribirse(dto: InscribirseDto): Observable<Registration> {
    return this.http.post<Registration>(this.baseUrl, dto);
  }

  cancelarInscripcion(dto: CancelarInscripcionDto): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/cancelar`, dto);
  }

  getMisInscripciones(
    usuarioId: string,
    filters: FilterRegistrationDto = {},
  ): Observable<PaginatedRegistrations> {
    let params = new HttpParams();
    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.limit) params = params.set('limit', filters.limit.toString());
    if (filters.estado) params = params.set('estado', filters.estado);
    return this.http.get<PaginatedRegistrations>(
      `${this.baseUrl}/usuario/${usuarioId}`,
      { params },
    );
  }
}
