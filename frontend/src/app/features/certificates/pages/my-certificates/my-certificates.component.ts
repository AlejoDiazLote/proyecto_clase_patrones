import { Component, OnInit } from '@angular/core';
import { CertificatesService } from '../../services/certificates.service';
import { Certificate } from '../../models/certificate.models';
import { ToastService } from '../../../../core/services/toast.service';

/**
 * Componente para mostrar los certificados del usuario autenticado
 * Patrón: Smart Component - maneja lógica de negocio y estado
 */
@Component({
  selector: 'app-my-certificates',
  templateUrl: './my-certificates.component.html',
  styleUrls: ['./my-certificates.component.scss'],
})
export class MyCertificatesComponent implements OnInit {
  certificates: Certificate[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    private readonly certificatesService: CertificatesService,
    private readonly toastService: ToastService,
  ) {}

  ngOnInit(): void {
    this.loadCertificates();
  }

  /**
   * Carga los certificados del usuario desde el backend
   * Maneja estados de loading y error
   */
  loadCertificates(): void {
    this.loading = true;
    this.error = null;

    this.certificatesService.getMyCertificates().subscribe({
      next: (data) => {
        this.certificates = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar certificados:', err);
        this.error =
          'No se pudieron cargar los certificados. Intenta nuevamente.';
        this.loading = false;
      },
    });
  }

  /**
   * Descarga un certificado en PDF
   * Abre el PDF en nueva pestaña
   */
  onDownload(certificate: Certificate): void {
    this.certificatesService.downloadCertificate(certificate.codigoUnico);
    this.toastService.show('Descargando certificado...', 'info');
  }

  /**
   * Formatea fecha para visualización
   */
  formatDate(isoDate: string): string {
    const date = new Date(isoDate);
    return date.toLocaleDateString('es', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  /**
   * Obtiene el badge de color según la modalidad del evento
   */
  getModalityBadge(modalidad: string): string {
    const badges: Record<string, string> = {
      PRESENCIAL: 'mc__badge--presencial',
      VIRTUAL: 'mc__badge--virtual',
      HIBRIDO: 'mc__badge--hibrido',
    };
    return badges[modalidad] || '';
  }
}
