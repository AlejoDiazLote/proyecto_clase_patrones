import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  Certificate,
  GenerateCertificatesResponse,
} from '../models/certificate.models';

/**
 * Servicio para gestión de certificados de asistencia
 * Patrón: Service Layer - abstrae la comunicación con el backend
 */
@Injectable({
  providedIn: 'root',
})
export class CertificatesService {
  private readonly apiUrl = `${environment.apiUrl}/certificates`;

  constructor(private readonly http: HttpClient) {}

  /**
   * Obtiene los certificados del usuario autenticado
   * Endpoint: GET /certificates/my-certificates
   */
  getMyCertificates(): Observable<Certificate[]> {
    return this.http.get<Certificate[]>(`${this.apiUrl}/my-certificates`);
  }

  /**
   * Genera certificados para todos los asistentes de un evento finalizado
   * Solo accesible para ADMIN y ORGANIZADOR
   * Endpoint: POST /certificates/generate/:eventoId
   */
  generateForEvent(eventoId: string): Observable<GenerateCertificatesResponse> {
    return this.http.post<GenerateCertificatesResponse>(
      `${this.apiUrl}/generate/${eventoId}`,
      {},
    );
  }

  /**
   * Construye la URL de descarga de un certificado
   * El backend valida el token JWT antes de servir el PDF
   */
  getDownloadUrl(codigoUnico: string): string {
    return `${this.apiUrl}/${codigoUnico}`;
  }

  /**
   * Descarga el certificado en PDF
   * Abre en nueva pestaña para descarga automática
   */
  downloadCertificate(codigoUnico: string): void {
    const url = this.getDownloadUrl(codigoUnico);
    window.open(url, '_blank');
  }
}
