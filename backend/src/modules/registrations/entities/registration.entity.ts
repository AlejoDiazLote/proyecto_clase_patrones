import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Event } from '../../events/entities/event.entity';
import { RegistrationStatus } from '../../../database/enums/registration-status.enum';

/**
 * Índice único compuesto (usuario_id, evento_id) donde el estado NO es CANCELADA ni FALLIDA.
 * Esto garantiza a nivel de base de datos que un usuario no puede tener más de una
 * inscripción activa (PENDIENTE o CONFIRMADA) al mismo evento.
 * Se complementa con la validación en el servicio para mayor claridad de errores.
 */
@Entity('inscripciones')
@Index('UQ_inscripcion_usuario_evento_activa', ['usuario', 'evento'], {
  unique: true,
  where: `estado NOT IN ('CANCELADA', 'FALLIDA')`,
})
export class Registration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'usuario_id' })
  usuario: User;

  @ManyToOne(() => Event, { nullable: false, onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'evento_id' })
  evento: Event;

  @Column({
    type: 'enum',
    enum: RegistrationStatus,
    default: RegistrationStatus.PENDIENTE,
  })
  estado: RegistrationStatus;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
