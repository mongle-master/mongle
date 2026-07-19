import { Module } from '@nestjs/common';
import { ChipModule } from '../chips/chip.module';
import { EventModule } from '../events/event.module';
import { PersonsModule } from '../persons/person.module';
import { HomeController } from './home.controller';
import { HomeService } from './home.service';

@Module({
  imports: [ChipModule, EventModule, PersonsModule],
  controllers: [HomeController],
  providers: [HomeService],
})
export class HomeModule {}
