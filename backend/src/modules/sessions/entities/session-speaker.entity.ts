import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Session } from '../../sessions/entities/session.entity';
import { User } from '../../users/entities/user.entity';
import { SpeakerStatus } from '../../../database/enums/speaker-status.enum';

@Entity('sesion_ponentes')
export class SessionSpeaker {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Session, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sesion_id' })
  sesion: Session;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'ponente_id' })
  ponente: User;

  @Column({
    type: 'enum',
    enum: SpeakerStatus,
    default: SpeakerStatus.PENDIENTE,
  })
  estado: SpeakerStatus;

  @CreateDateColumn({ type: 'timestamptz' })
  invitadoEn: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  respondidoEn: Date;
}
