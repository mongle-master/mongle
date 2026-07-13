import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ChipModule } from './chips/chip.module';
import { JwtAuthModule } from './common/auth/jwt-auth.module';
import { HealthModule } from './common/health/health.module';
import { EventModule } from './events/event.module';
import { HomeModule } from './home/home.module';
import { ImageModule } from './images/image.module';
import { PersonsModule } from './persons/person.module';
import { PrismaModule } from './prisma/prisma.module';
import { SeedModule } from './seed/seed.module';
import { TimelineModule } from './timeline/timeline.module';
import { UserModule } from './users/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, cache: true }),
    PrismaModule,
    JwtAuthModule,
    HealthModule,
    AuthModule,
    UserModule,
    ChipModule,
    ImageModule,
    PersonsModule,
    EventModule,
    TimelineModule,
    HomeModule,
    SeedModule,
  ],
})
export class AppModule {}
