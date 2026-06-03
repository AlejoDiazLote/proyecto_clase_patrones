import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Session } from './entities/session.entity';
import { SessionSpeaker } from './entities/session-speaker.entity';
import { SessionsService } from './sessions.service';
import { SessionsController } from './sessions.controller';
import { SessionSpeakersService } from './session-speakers.service';
import { SessionSpeakersController } from './session-speakers.controller';
import { EventsModule } from '../events/events.module';
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../common/notifications/notifications.module';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Session, SessionSpeaker, User]),
    EventsModule,
    UsersModule,
    NotificationsModule,
  ],
  controllers: [SessionsController, SessionSpeakersController],
  providers: [SessionsService, SessionSpeakersService],
  exports: [SessionsService, SessionSpeakersService],
})
export class SessionsModule {}
