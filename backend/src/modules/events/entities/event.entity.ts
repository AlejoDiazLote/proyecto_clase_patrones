import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { EventStatus } from '../../../database/enums/event-status.enum';
import { EventModality } from '../../../database/enums/event-modality.enum';
import { RegistrationInscripcionType } from '../../../database/enums/inscription-type.enum';

@Entity('eventos')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  titulo: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ type: 'timestamptz' })
  fechaInicio: Date;

  @Column({ type: 'timestamptz' })
  fechaFin: Date;

  @Column({ type: 'int' })
  capacidadMaxima: number;

  @Column({ type: 'int' })
  cuposDisponibles: number;

  @Column({
    type: 'enum',
    enum: EventStatus,
    default: EventStatus.BORRADOR,
  })
  estado: EventStatus;

  @Column({
    type: 'enum',
    enum: EventModality,
    default: EventModality.PRESENCIAL,
  })
  modalidad: EventModality;

  @Column({
    type: 'enum',
    enum: RegistrationInscripcionType,
    default: RegistrationInscripcionType.GRATUITA,
  })
  tipoInscripcion: RegistrationInscripcionType;
}
