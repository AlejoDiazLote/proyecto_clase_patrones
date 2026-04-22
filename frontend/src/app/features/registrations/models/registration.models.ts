export type RegistrationStatus =
  | 'PENDIENTE'
  | 'CONFIRMADA'
  | 'CANCELADA'
  | 'FALLIDA';

export interface RegistrationEvent {
  id: string;
  titulo: string;
  fechaInicio: string;
  fechaFin: string;
  modalidad: string;
  tipoInscripcion: string;
  cuposDisponibles: number;
  capacidadMaxima: number;
}

export interface RegistrationUser {
  id: string;
  nombre: string;
  correo: string;
}

export interface Registration {
  id: string;
  estado: RegistrationStatus;
  createdAt: string;
  usuario: RegistrationUser;
  evento: RegistrationEvent;
}

export interface InscribirseDto {
  usuarioId: string;
  eventoId: string;
}

export interface CancelarInscripcionDto {
  usuarioId: string;
  eventoId: string;
}

export interface FilterRegistrationDto {
  page?: number;
  limit?: number;
  estado?: RegistrationStatus;
}

export interface PaginatedRegistrations {
  data: Registration[];
  total: number;
  page: number;
  lastPage: number;
}
