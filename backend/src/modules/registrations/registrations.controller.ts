import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RegistrationsService } from './registrations.service';
import { InscribirseDto } from './dto/create-registration.dto';
import { CancelarInscripcionDto } from './dto/update-registration.dto';
import { FilterRegistrationDto } from './dto/filter-registration.dto';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';

@ApiTags('Inscripciones')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('inscripciones')
export class RegistrationsController {
  constructor(private readonly registrationsService: RegistrationsService) {}

  @Post()
  @ApiOperation({ summary: 'Inscribir un usuario a un evento' })
  @ApiResponse({ status: 201, description: 'Inscripción creada o confirmada' })
  @ApiResponse({
    status: 400,
    description: 'Evento no publicado, sin cupos o datos inválidos',
  })
  @ApiResponse({ status: 404, description: 'Usuario o evento no encontrado' })
  @ApiResponse({
    status: 409,
    description: 'El usuario ya tiene una inscripción activa',
  })
  inscribirse(@Body() dto: InscribirseDto) {
    return this.registrationsService.inscribirse(dto);
  }

  @Post('cancelar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancelar una inscripción activa' })
  @ApiResponse({ status: 200, description: 'Inscripción cancelada' })
  @ApiResponse({
    status: 404,
    description: 'No se encontró inscripción activa',
  })
  cancelarInscripcion(@Body() dto: CancelarInscripcionDto) {
    return this.registrationsService.cancelarInscripcion(dto);
  }

  @Get('usuario/:usuarioId')
  @ApiOperation({
    summary: 'Listar inscripciones de un usuario con filtros y paginación',
  })
  @ApiParam({ name: 'usuarioId', description: 'UUID del usuario' })
  @ApiResponse({ status: 200, description: 'Lista paginada de inscripciones' })
  listarMisInscripciones(
    @Param('usuarioId') usuarioId: string,
    @Query() filters: FilterRegistrationDto,
  ) {
    return this.registrationsService.listarMisInscripciones(usuarioId, filters);
  }

  @Get()
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Listar inscripciones con filtros y paginación (admin)',
  })
  @ApiResponse({ status: 200, description: 'Lista paginada de inscripciones' })
  @ApiResponse({ status: 403, description: 'Sin permisos' })
  findAll(@Query() filters: FilterRegistrationDto) {
    return this.registrationsService.findAll(filters);
  }

  @Get(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Obtener una inscripción por ID' })
  @ApiParam({ name: 'id', description: 'UUID de la inscripción' })
  @ApiResponse({ status: 200, description: 'Inscripción encontrada' })
  @ApiResponse({ status: 403, description: 'Sin permisos' })
  @ApiResponse({ status: 404, description: 'Inscripción no encontrada' })
  findOne(@Param('id') id: string) {
    return this.registrationsService.findOne(id);
  }
}
