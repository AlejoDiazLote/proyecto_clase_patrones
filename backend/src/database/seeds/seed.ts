import 'reflect-metadata';
import * as dotenv from 'dotenv';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { Role } from '../../modules/roles/entities/role.entity';
import { User } from '../../modules/users/entities/user.entity';
import { Event } from '../../modules/events/entities/event.entity';
import { Session } from '../../modules/sessions/entities/session.entity';
import { Registration } from '../../modules/registrations/entities/registration.entity';
import { EventStatus } from '../enums/event-status.enum';
import { EventModality } from '../enums/event-modality.enum';
import { RegistrationInscripcionType } from '../enums/inscription-type.enum';
import { RegistrationStatus } from '../enums/registration-status.enum';
import { AuthProvider } from '../enums/auth-provider.enum';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: Number(process.env.DATABASE_PORT) || 5432,
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres123',
  database: process.env.DATABASE_NAME || 'eventos_academicos',
  entities: [Role, User, Event, Session, Registration],
  synchronize: false,
});

async function seed() {
  await AppDataSource.initialize();
  console.log('Conectado a la base de datos');

  const roleRepo = AppDataSource.getRepository(Role);
  const userRepo = AppDataSource.getRepository(User);
  const eventRepo = AppDataSource.getRepository(Event);
  const sessionRepo = AppDataSource.getRepository(Session);
  const registrationRepo = AppDataSource.getRepository(Registration);

  // Limpiar en orden FK-safe
  console.log('Limpiando tablas...');
  await AppDataSource.query('DELETE FROM inscripciones');
  await AppDataSource.query('DELETE FROM sesiones');
  await AppDataSource.query('DELETE FROM usuarios');
  await AppDataSource.query('DELETE FROM eventos');
  await AppDataSource.query('DELETE FROM roles');

  // Roles
  console.log('Creando roles...');
  const [adminRole, organizadorRole, participanteRole] = await roleRepo.save([
    { nombre: 'ADMIN' },
    { nombre: 'ORGANIZADOR' },
    { nombre: 'PARTICIPANTE' },
  ]);

  // Usuarios
  console.log('Creando usuarios...');
  const hash = (pw: string) => bcrypt.hash(pw, 12);

  const [, , , maria, juan, sofia, diego] = await userRepo.save([
    {
      nombre: 'Carlos Admin',
      correo: 'admin@eventos.edu',
      password: await hash('Admin1234!'),
      provider: AuthProvider.LOCAL,
      rol: adminRole,
    },
    {
      nombre: 'Ana Garcia',
      correo: 'ana.garcia@eventos.edu',
      password: await hash('Organizador1!'),
      provider: AuthProvider.LOCAL,
      rol: organizadorRole,
    },
    {
      nombre: 'Luis Rodriguez',
      correo: 'luis.rodriguez@eventos.edu',
      password: await hash('Organizador2!'),
      provider: AuthProvider.LOCAL,
      rol: organizadorRole,
    },
    {
      nombre: 'Maria Lopez',
      correo: 'maria.lopez@eventos.edu',
      password: await hash('Participante1!'),
      provider: AuthProvider.LOCAL,
      rol: participanteRole,
    },
    {
      nombre: 'Juan Martinez',
      correo: 'juan.martinez@eventos.edu',
      password: await hash('Participante2!'),
      provider: AuthProvider.LOCAL,
      rol: participanteRole,
    },
    {
      nombre: 'Sofia Hernandez',
      correo: 'sofia.hernandez@eventos.edu',
      password: await hash('Participante3!'),
      provider: AuthProvider.LOCAL,
      rol: participanteRole,
    },
    {
      nombre: 'Diego Torres',
      correo: 'diego.torres@eventos.edu',
      password: await hash('Participante4!'),
      provider: AuthProvider.LOCAL,
      rol: participanteRole,
    },
  ]);

  // Eventos
  console.log('Creando eventos...');
  const [congresoIA, tallerML, seminarioBC, , confSeguridad] =
    await eventRepo.save([
      {
        titulo: 'Congreso Internacional de Inteligencia Artificial',
        descripcion:
          'Congreso de alto nivel sobre IA, machine learning y deep learning.',
        fechaInicio: new Date('2026-06-10T09:00:00-05:00'),
        fechaFin: new Date('2026-06-12T18:00:00-05:00'),
        capacidadMaxima: 100,
        cuposDisponibles: 85,
        estado: EventStatus.PUBLICADO,
        modalidad: EventModality.PRESENCIAL,
        tipoInscripcion: RegistrationInscripcionType.GRATUITA,
      },
      {
        titulo: 'Taller Intensivo de Machine Learning con Python',
        descripcion:
          'Taller practico de 8 horas con scikit-learn y TensorFlow.',
        fechaInicio: new Date('2026-05-20T08:00:00-05:00'),
        fechaFin: new Date('2026-05-20T17:00:00-05:00'),
        capacidadMaxima: 30,
        cuposDisponibles: 22,
        estado: EventStatus.PUBLICADO,
        modalidad: EventModality.VIRTUAL,
        tipoInscripcion: RegistrationInscripcionType.PAGA,
      },
      {
        titulo: 'Seminario de Blockchain en Finanzas Digitales',
        descripcion:
          'Blockchain en el sistema financiero y nuevas oportunidades.',
        fechaInicio: new Date('2026-07-05T10:00:00-05:00'),
        fechaFin: new Date('2026-07-06T17:00:00-05:00'),
        capacidadMaxima: 50,
        cuposDisponibles: 47,
        estado: EventStatus.PUBLICADO,
        modalidad: EventModality.HIBRIDO,
        tipoInscripcion: RegistrationInscripcionType.GRATUITA,
      },
      {
        titulo: 'Workshop de DevOps y CI/CD Avanzado',
        descripcion: 'Pipelines de CI/CD, Docker y Kubernetes.',
        fechaInicio: new Date('2026-08-15T09:00:00-05:00'),
        fechaFin: new Date('2026-08-16T18:00:00-05:00'),
        capacidadMaxima: 20,
        cuposDisponibles: 20,
        estado: EventStatus.BORRADOR,
        modalidad: EventModality.PRESENCIAL,
        tipoInscripcion: RegistrationInscripcionType.PAGA,
      },
      {
        titulo: 'Conferencia de Seguridad Informatica 2025',
        descripcion: 'Edicion anual con ponentes internacionales.',
        fechaInicio: new Date('2025-11-20T09:00:00-05:00'),
        fechaFin: new Date('2025-11-21T18:00:00-05:00'),
        capacidadMaxima: 80,
        cuposDisponibles: 0,
        estado: EventStatus.FINALIZADO,
        modalidad: EventModality.PRESENCIAL,
        tipoInscripcion: RegistrationInscripcionType.GRATUITA,
      },
    ]);

  // Sesiones
  console.log('Creando sesiones...');
  await sessionRepo.save([
    {
      titulo: 'Keynote: El futuro de la IA Generativa',
      descripcion: 'Conferencia inaugural sobre tendencias en IA generativa.',
      fechaInicio: new Date('2026-06-10T09:00:00-05:00'),
      fechaFin: new Date('2026-06-10T10:30:00-05:00'),
      evento: congresoIA,
    },
    {
      titulo: 'Panel: Etica en Inteligencia Artificial',
      descripcion: 'Debate sobre desafios eticos y regulatorios de la IA.',
      fechaInicio: new Date('2026-06-10T11:00:00-05:00'),
      fechaFin: new Date('2026-06-10T13:00:00-05:00'),
      evento: congresoIA,
    },
    {
      titulo: 'Taller: Implementacion de LLMs en Produccion',
      descripcion: 'Despliegue y optimizacion de grandes modelos de lenguaje.',
      fechaInicio: new Date('2026-06-11T09:00:00-05:00'),
      fechaFin: new Date('2026-06-11T12:00:00-05:00'),
      evento: congresoIA,
    },
    {
      titulo: 'Modulo 1: Fundamentos de scikit-learn',
      descripcion: 'Pipelines, preprocesamiento y modelos clasicos de ML.',
      fechaInicio: new Date('2026-05-20T08:00:00-05:00'),
      fechaFin: new Date('2026-05-20T12:00:00-05:00'),
      evento: tallerML,
    },
    {
      titulo: 'Modulo 2: Redes Neuronales con TensorFlow',
      descripcion: 'Construccion y entrenamiento de redes neuronales.',
      fechaInicio: new Date('2026-05-20T13:00:00-05:00'),
      fechaFin: new Date('2026-05-20T17:00:00-05:00'),
      evento: tallerML,
    },
    {
      titulo: 'Introduccion a la Tecnologia Blockchain',
      descripcion: 'Conceptos fundamentales: bloques, consenso y contratos.',
      fechaInicio: new Date('2026-07-05T10:00:00-05:00'),
      fechaFin: new Date('2026-07-05T12:30:00-05:00'),
      evento: seminarioBC,
    },
    {
      titulo: 'Casos de Uso: DeFi y Tokenizacion de Activos',
      descripcion: 'Aplicaciones reales de blockchain en finanzas.',
      fechaInicio: new Date('2026-07-05T14:00:00-05:00'),
      fechaFin: new Date('2026-07-05T17:00:00-05:00'),
      evento: seminarioBC,
    },
    {
      titulo: 'Workshop: Smart Contracts en Solidity',
      descripcion: 'Escritura y despliegue de contratos inteligentes.',
      fechaInicio: new Date('2026-07-06T10:00:00-05:00'),
      fechaFin: new Date('2026-07-06T13:00:00-05:00'),
      evento: seminarioBC,
    },
    {
      titulo: 'Apertura: Panorama Global de Ciberseguridad 2025',
      descripcion: 'Estado de la ciberseguridad a nivel mundial.',
      fechaInicio: new Date('2025-11-20T09:00:00-05:00'),
      fechaFin: new Date('2025-11-20T11:00:00-05:00'),
      evento: confSeguridad,
    },
  ]);

  // Inscripciones
  console.log('Creando inscripciones...');
  await registrationRepo.save([
    {
      usuario: maria,
      evento: congresoIA,
      estado: RegistrationStatus.CONFIRMADA,
    },
    {
      usuario: juan,
      evento: congresoIA,
      estado: RegistrationStatus.CONFIRMADA,
    },
    {
      usuario: sofia,
      evento: congresoIA,
      estado: RegistrationStatus.PENDIENTE,
    },
    { usuario: maria, evento: tallerML, estado: RegistrationStatus.CONFIRMADA },
    { usuario: diego, evento: tallerML, estado: RegistrationStatus.PENDIENTE },
    {
      usuario: juan,
      evento: seminarioBC,
      estado: RegistrationStatus.CONFIRMADA,
    },
    {
      usuario: sofia,
      evento: seminarioBC,
      estado: RegistrationStatus.CONFIRMADA,
    },
    {
      usuario: diego,
      evento: seminarioBC,
      estado: RegistrationStatus.PENDIENTE,
    },
    {
      usuario: maria,
      evento: confSeguridad,
      estado: RegistrationStatus.CONFIRMADA,
    },
    {
      usuario: juan,
      evento: confSeguridad,
      estado: RegistrationStatus.CONFIRMADA,
    },
    {
      usuario: diego,
      evento: confSeguridad,
      estado: RegistrationStatus.CANCELADA,
    },
  ]);

  console.log('Seed completado exitosamente!');
  console.log(
    '  3 roles | 7 usuarios | 5 eventos | 9 sesiones | 11 inscripciones',
  );
  console.log('');
  console.log('Credenciales de prueba:');
  console.log('  admin@eventos.edu          -> Admin1234!      (ADMIN)');
  console.log('  ana.garcia@eventos.edu     -> Organizador1!   (ORGANIZADOR)');
  console.log('  luis.rodriguez@eventos.edu -> Organizador2!   (ORGANIZADOR)');
  console.log('  maria.lopez@eventos.edu    -> Participante1!  (PARTICIPANTE)');
  console.log('  juan.martinez@eventos.edu  -> Participante2!  (PARTICIPANTE)');
  console.log('  sofia.hernandez@eventos.edu-> Participante3!  (PARTICIPANTE)');
  console.log('  diego.torres@eventos.edu   -> Participante4!  (PARTICIPANTE)');

  await AppDataSource.destroy();
}

seed().catch((err) => {
  console.error('Error durante el seed:', err);
  process.exit(1);
});
