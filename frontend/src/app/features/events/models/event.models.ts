export type EventStatus =
  | 'BORRADOR'
  | 'EN_REVISION'
  | 'PUBLICADO'
  | 'CANCELADO'
  | 'FINALIZADO';
export type EventModality = 'PRESENCIAL' | 'VIRTUAL' | 'HIBRIDO';
export type InscriptionType = 'GRATUITA' | 'PAGA';

export interface CreateEventDto {
  titulo: string;
  descripcion?: string;
  fechaInicio: string;
  fechaFin: string;
  capacidadMaxima: number;
  cuposDisponibles: number;
  estado?: EventStatus;
  modalidad?: EventModality;
  tipoInscripcion?: InscriptionType;
  precio?: number;
}

export type UpdateEventDto = Partial<CreateEventDto>;

export interface Event {
  id: string;
  titulo: string;
  descripcion: string | null;
  fechaInicio: string;
  fechaFin: string;
  capacidadMaxima: number;
  cuposDisponibles: number;
  estado: EventStatus;
  modalidad: EventModality;
  tipoInscripcion: InscriptionType;
  precio: number;
  ubicacion?: string | null;
  enlaceConferencia?: string | null;
  fechaLimiteInscripcion?: string | null;
  requiereAprobacion?: boolean;
}

export interface PaginatedEvents {
  data: Event[];
  total: number;
  page: number;
  lastPage: number;
}

export interface EventFilters {
  page?: number;
  limit?: number;
  search?: string;
  estado?: EventStatus;
  modalidad?: EventModality;
}
