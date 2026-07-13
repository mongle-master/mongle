import { Module } from '@nestjs/common';
import { ChipModule } from '../chips/chip.module';
import { PersonController } from './person.controller';
import { PersonService } from './person.service';

@Module({
  imports: [ChipModule],
  controllers: [PersonController],
  providers: [PersonService],
  exports: [PersonService],
})
export class PersonsModule {}
