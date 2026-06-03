import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

/**
 * Validador personalizado que acepta cualquier string con formato UUID (8-4-4-4-12)
 * sin validar la versión específica del UUID.
 * Útil para IDs de seed que no cumplen con UUID v4 estricto.
 */
export function IsUuidFormat(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isUuidFormat',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') return false;
          // Regex flexible que acepta cualquier UUID con formato 8-4-4-4-12
          const uuidRegex =
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          return uuidRegex.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a UUID format (8-4-4-4-12)`;
        },
      },
    });
  };
}
