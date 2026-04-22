export interface Session {
  id: string;
  titulo: string;
  descripcion: string | null;
  fechaInicio: string;
  fechaFin: string;
}

export interface CreateSessionDto {
  titulo: string;
  descripcion?: string;
  fechaInicio: string;
  fechaFin: string;
  eventoId: string;
}

export type UpdateSessionDto = Partial<Omit<CreateSessionDto, 'eventoId'>>;

export interface PaginatedSessions {
  data: Session[];
  total: number;
  page: number;
  lastPage: number;
}
