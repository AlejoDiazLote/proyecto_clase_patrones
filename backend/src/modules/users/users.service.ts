import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FilterUserDto } from './dto/filter-user.dto';
import { RolesService } from '../roles/roles.service';
import { PaginatedResult, paginate } from '../../shared/dto/pagination.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly rolesService: RolesService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const exists = await this.usersRepository.findOne({
      where: { correo: createUserDto.correo },
    });
    if (exists) {
      throw new BadRequestException(
        `El correo "${createUserDto.correo}" ya está registrado`,
      );
    }

    const { rolId, ...userData } = createUserDto;
    const user = this.usersRepository.create(userData);

    if (rolId) {
      user.rol = await this.rolesService.findOne(rolId);
    }

    return this.usersRepository.save(user);
  }

  async findAll(filters: FilterUserDto): Promise<PaginatedResult<User>> {
    const { page = 1, limit = 10, search, rolId } = filters;

    const qb = this.usersRepository
      .createQueryBuilder('usuario')
      .leftJoinAndSelect('usuario.rol', 'rol');

    if (search) {
      qb.andWhere(
        '(usuario.nombre ILIKE :search OR usuario.correo ILIKE :search)',
        { search: `%${search}%` },
      );
    }
    if (rolId) qb.andWhere('rol.id = :rolId', { rolId });

    qb.orderBy('usuario.nombre', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    return paginate(data, total, page, limit);
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Usuario con id "${id}" no encontrado`);
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    const { rolId, ...userData } = updateUserDto;

    if (rolId !== undefined) {
      user.rol = await this.rolesService.findOne(rolId);
    }

    Object.assign(user, userData);
    return this.usersRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
  }
}
