import { Global, Module } from '@nestjs/common';
import { JwtModule, type JwtSignOptions } from '@nestjs/jwt';
import { JwtAuthGuard } from './jwt-auth.guard';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.MONGLE_JWT_SECRET,
        signOptions: {
          algorithm: 'HS256',
          expiresIn: process.env.MONGLE_JWT_EXPIRATION as JwtSignOptions['expiresIn'],
        },
        verifyOptions: { algorithms: ['HS256'] },
      }),
    }),
  ],
  providers: [JwtAuthGuard],
  exports: [JwtModule, JwtAuthGuard],
})
export class JwtAuthModule {}
