import { Module } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './shared/auth/auth.module';
import { PrismaModule } from './config/libs/prisma/prisma.module';


@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
  }), AuthModule, PrismaModule]
})
export class AppModule { }
