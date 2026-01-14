import { Module } from '@nestjs/common';
import { PatientService } from './patient.service';
import { PatientController } from './patient.controller';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [PatientController],
  providers: [PatientService,JwtService],
})
export class PatientModule {}
