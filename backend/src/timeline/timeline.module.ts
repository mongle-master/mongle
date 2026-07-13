import { Module } from '@nestjs/common';
import { ChipModule } from '../chips/chip.module';
import { EventModule } from '../events/event.module';
import { PersonsModule } from '../persons/person.module';
import { TimelineController } from './timeline.controller';
import { TimelineService } from './timeline.service';

@Module({
  imports: [ChipModule, EventModule, PersonsModule],
  controllers: [TimelineController],
  providers: [TimelineService],
})
export class TimelineModule {}
