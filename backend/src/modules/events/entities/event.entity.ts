import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { EventStatus } from '../../../database/enums/event-status.enum';
import { EventModality } from '../../../database/enums/event-modality.enum';
import { RegistrationInscripcionType } from '../../../database/enums/inscription-type.enum';
import { Registration } from '../../registrations/entities/registration.entity';

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

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  precio: number;

  @Column({ type: 'varchar', length: 300, nullable: true })
  ubicacion: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  enlaceConferencia: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  fechaLimiteInscripcion: Date | null;

  @OneToMany(() => Registration, (registration) => registration.evento)
  inscripciones: Registration[];

  @Column({ type: 'boolean', default: false })
  requiereAprobacion: boolean;
}
