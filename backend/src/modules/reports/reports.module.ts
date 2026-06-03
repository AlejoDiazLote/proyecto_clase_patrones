import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from '../events/entities/event.entity';
import { Registration } from '../registrations/entities/registration.entity';
import { Attendance } from '../attendance/entities/attendance.entity';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Event, Registration, Attendance])],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
