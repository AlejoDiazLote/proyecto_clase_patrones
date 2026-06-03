import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Certificate } from './entities/certificate.entity';
import { Registration } from '../registrations/entities/registration.entity';
import { Attendance } from '../attendance/entities/attendance.entity';
import { Event } from '../events/entities/event.entity';
import { CertificatesService } from './certificates.service';
import { CertificatesController } from './certificates.controller';
import { NotificationsModule } from '../common/notifications/notifications.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Certificate, Registration, Attendance, Event]),
    NotificationsModule,
  ],
  controllers: [CertificatesController],
  providers: [CertificatesService],
  exports: [CertificatesService],
})
export class CertificatesModule {}
