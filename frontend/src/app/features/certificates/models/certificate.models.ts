/**
 * Modelos para el módulo de certificados
 * Representan certificados de asistencia a eventos
 */

export interface Certificate {
  id: string;
  codigoUnico: string;
  generadoEn: string;
  inscripcion: {
    id: string;
    evento: {
      id: string;
      titulo: string;
      fechaInicio: string;
      fechaFin: string;
      modalidad: string;
    };
    usuario: {
      id: string;
      nombre: string;
      correo: string;
    };
  };
}

export interface GenerateCertificatesResponse {
  generados: number;
}
