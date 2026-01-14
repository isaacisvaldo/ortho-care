import { Module } from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { DoctorController } from './doctor.controller';
import { ProfileService } from './profile-service.service';
import { ProfileController } from './profile.controller';
import { JwtService } from '@nestjs/jwt';


@Module({
  controllers: [DoctorController,ProfileController],
  providers: [DoctorService, ProfileService,JwtService],
})
export class DoctorModule {}
