import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Registration } from '../../registrations/entities/registration.entity';
import { PaymentStatus } from '../../../database/enums/payment-status.enum';

@Entity('pagos')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Registration, {
    nullable: false,
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn({ name: 'inscripcion_id' })
  inscripcion: Registration;

  @Column({ type: 'varchar', length: 255, unique: true })
  stripePaymentIntentId: string;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDIENTE,
  })
  estado: PaymentStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  monto: number;

  @Column({ type: 'varchar', length: 10, default: 'usd' })
  moneda: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
