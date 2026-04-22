import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { AuthProvider } from '../../database/enums/auth-provider.enum';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly rolesRepository: Repository<Role>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existente = await this.usersRepository.findOne({
      where: { correo: dto.correo },
    });
    if (existente) {
      throw new BadRequestException('El correo ya esta registrado');
    }

    const rolParticipante = await this.rolesRepository.findOne({
      where: { nombre: 'PARTICIPANTE' },
    });

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const nuevo = this.usersRepository.create({
      nombre: dto.nombre,
      correo: dto.correo,
      password: passwordHash,
      provider: AuthProvider.LOCAL,
      rol: rolParticipante ?? undefined,
    });

    await this.usersRepository.save(nuevo);

    // Recargar con relaciones
    const guardado = await this.usersRepository.findOne({
      where: { correo: dto.correo },
    });
    return this.buildTokenResponse(guardado!);
  }

  async login(dto: LoginDto) {
    // Seleccionamos password explicitamente porque tiene select:false en la entidad
    const usuario = await this.usersRepository
      .createQueryBuilder('u')
      .addSelect('u.password')
      .leftJoinAndSelect('u.rol', 'rol')
      .where('u.correo = :correo', { correo: dto.correo })
      .getOne();

    if (!usuario || !usuario.password) {
      throw new UnauthorizedException('Credenciales invalidas');
    }

    const passwordValido = await bcrypt.compare(dto.password, usuario.password);
    if (!passwordValido) {
      throw new UnauthorizedException('Credenciales invalidas');
    }

    return this.buildTokenResponse(usuario);
  }

  async validateGoogleUser(googleProfile: {
    providerId: string;
    nombre: string;
    correo: string;
  }) {
    let usuario = await this.usersRepository.findOne({
      where: { providerId: googleProfile.providerId },
    });

    if (!usuario) {
      usuario = await this.usersRepository.findOne({
        where: { correo: googleProfile.correo },
      });

      if (usuario) {
        // Vincular cuenta Google a usuario existente
        usuario.providerId = googleProfile.providerId;
        usuario.provider = AuthProvider.GOOGLE;
        await this.usersRepository.save(usuario);
      } else {
        // Crear nuevo usuario con rol PARTICIPANTE
        const rolParticipante = await this.rolesRepository.findOne({
          where: { nombre: 'PARTICIPANTE' },
        });

        usuario = this.usersRepository.create({
          nombre: googleProfile.nombre,
          correo: googleProfile.correo,
          providerId: googleProfile.providerId,
          provider: AuthProvider.GOOGLE,
          rol: rolParticipante ?? undefined,
        });

        await this.usersRepository.save(usuario);
      }
    }

    return usuario;
  }

  async getProfile(userId: string) {
    const usuario = await this.usersRepository.findOne({
      where: { id: userId },
    });
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return usuario;
  }

  async buildTokenResponsePublic(usuario: User) {
    return this.buildTokenResponse(usuario);
  }

  private buildTokenResponse(usuario: User) {
    const payload = {
      sub: usuario.id,
      correo: usuario.correo,
      rol: usuario.rol?.nombre ?? null,
    };
    const token = this.jwtService.sign(payload);
    return {
      access_token: token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol?.nombre ?? null,
      },
    };
  }
}
