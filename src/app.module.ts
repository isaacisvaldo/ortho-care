import { Module } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './module/shared/auth/auth.module';
import { PrismaModule } from './config/libs/prisma/prisma.module';
import { StockModule } from './module/stock/stock.module';
import { PatientModule } from './module/patient/patient.module';
import { DoctorModule } from './module/doctor/doctor.module';
import { SupplierModule } from './module/supplier/supplier.module';


@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
  }), AuthModule, PrismaModule, StockModule, PatientModule, DoctorModule, SupplierModule]
})
export class AppModule { }
