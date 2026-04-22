import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  CreateSessionDto,
  PaginatedSessions,
  Session,
  UpdateSessionDto,
} from '../models/session.models';

@Injectable({ providedIn: 'root' })
export class SessionsService {
  private readonly base = `${environment.apiUrl}/sessions`;

  constructor(private http: HttpClient) {}

  getByEvent(eventoId: string): Observable<PaginatedSessions> {
    const params = new HttpParams()
      .set('eventoId', eventoId)
      .set('limit', '100');
    return this.http.get<PaginatedSessions>(this.base, { params });
  }

  create(dto: CreateSessionDto): Observable<Session> {
    return this.http.post<Session>(this.base, dto);
  }

  update(id: string, dto: UpdateSessionDto): Observable<Session> {
    return this.http.patch<Session>(`${this.base}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
