import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body } = request;

    // Log solo para el endpoint de inscripciones
    if (url.includes('/inscripciones') && method === 'POST') {
      this.logger.log(`[${method}] ${url}`);
      this.logger.log('Body sin validar:', JSON.stringify(body, null, 2));
    }

    return next.handle().pipe(
      tap({
        error: (error) => {
          if (url.includes('/inscripciones') && method === 'POST') {
            this.logger.error('Error en inscripción:', error.message);
            this.logger.error(
              'Body que causó error:',
              JSON.stringify(body, null, 2),
            );
          }
        },
      }),
    );
  }
}
