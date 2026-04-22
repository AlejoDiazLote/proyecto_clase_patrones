import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Role } from '../../roles/entities/role.entity';
import { AuthProvider } from '../../../database/enums/auth-provider.enum';

@Entity('usuarios')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  nombre: string;

  @Column({ unique: true, length: 150 })
  correo: string;

  @Exclude()
  @Column({ nullable: true, select: false })
  password: string | null;

  @Column({ nullable: true })
  providerId: string;

  @Column({
    type: 'enum',
    enum: AuthProvider,
    default: AuthProvider.LOCAL,
  })
  provider: AuthProvider;

  @ManyToOne(() => Role, { eager: true, nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'rol_id' })
  rol: Role;
}
