import { Module } from '@nestjs/common';
import { ChipController } from './chip.controller';
import { ChipSeeder } from './chip.seeder';
import { ChipService } from './chip.service';

@Module({
  controllers: [ChipController],
  providers: [ChipService, ChipSeeder],
  exports: [ChipService],
})
export class ChipModule {}
