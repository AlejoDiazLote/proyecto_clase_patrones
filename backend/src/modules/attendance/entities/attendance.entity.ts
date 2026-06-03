import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Registration } from '../../registrations/entities/registration.entity';
import { AttendanceMethod } from '../../../database/enums/attendance-method.enum';

@Entity('asistencias')
export class Attendance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Registration, {
    nullable: false,
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn({ name: 'inscripcion_id' })
  inscripcion: Registration;

  @Column({
    type: 'enum',
    enum: AttendanceMethod,
    default: AttendanceMethod.MANUAL,
  })
  metodo: AttendanceMethod;

  @CreateDateColumn({ type: 'timestamptz' })
  registradoEn: Date;
}
