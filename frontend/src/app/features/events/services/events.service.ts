import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  CreateEventDto,
  Event,
  EventFilters,
  PaginatedEvents,
  UpdateEventDto,
} from '../models/event.models';

@Injectable({ providedIn: 'root' })
export class EventsService {
  private readonly base = `${environment.apiUrl}/events`;

  constructor(private http: HttpClient) {}

  getAll(filters: EventFilters = {}): Observable<PaginatedEvents> {
    let params = new HttpParams();
    if (filters.page) params = params.set('page', filters.page);
    if (filters.limit) params = params.set('limit', filters.limit);
    if (filters.search) params = params.set('search', filters.search);
    if (filters.estado) params = params.set('estado', filters.estado);
    if (filters.modalidad) params = params.set('modalidad', filters.modalidad);
    return this.http.get<PaginatedEvents>(this.base, { params });
  }

  getAllAdmin(filters: EventFilters = {}): Observable<PaginatedEvents> {
    let params = new HttpParams();
    if (filters.page) params = params.set('page', filters.page);
    if (filters.limit) params = params.set('limit', filters.limit);
    if (filters.search) params = params.set('search', filters.search);
    if (filters.estado) params = params.set('estado', filters.estado);
    if (filters.modalidad) params = params.set('modalidad', filters.modalidad);
    return this.http.get<PaginatedEvents>(this.base, { params });
  }

  getById(id: string): Observable<Event> {
    return this.http.get<Event>(`${this.base}/${id}`);
  }

  create(dto: CreateEventDto): Observable<Event> {
    return this.http.post<Event>(this.base, dto);
  }

  update(id: string, dto: UpdateEventDto): Observable<Event> {
    return this.http.patch<Event>(`${this.base}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
