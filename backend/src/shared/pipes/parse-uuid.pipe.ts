import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { validate as isUuid } from 'uuid';

@Injectable()
export class ParseUUIDPipe implements PipeTransform<string> {
  constructor(private readonly fieldName: string = 'id') {}

  transform(value: string): string {
    if (!value) {
      throw new BadRequestException(
        `El campo ${this.fieldName} es requerido`,
      );
    }

    const trimmedValue = value.toString().trim();

    if (!isUuid(trimmedValue)) {
      throw new BadRequestException(
        `El campo ${this.fieldName} debe ser un UUID válido. ` +
        `Valor recibido: "${trimmedValue}" (tipo: ${typeof value})`,
      );
    }

    return trimmedValue;
  }
}
