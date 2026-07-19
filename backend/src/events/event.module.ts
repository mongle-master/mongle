import { Module } from '@nestjs/common';
import { ChipModule } from '../chips/chip.module';
import { EventController } from './event.controller';
import { EventService } from './event.service';

@Module({
  imports: [ChipModule],
  controllers: [EventController],
  providers: [EventService],
  exports: [EventService],
})
export class EventModule {}
