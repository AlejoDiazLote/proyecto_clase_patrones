import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Registration } from '../../registrations/entities/registration.entity';

@Entity('certificados')
export class Certificate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Registration, {
    nullable: false,
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn({ name: 'inscripcion_id' })
  inscripcion: Registration;

  @Column({ type: 'uuid', unique: true })
  codigoUnico: string;

  @Column({ type: 'text', nullable: true })
  urlPdf: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  generadoEn: Date;
}
