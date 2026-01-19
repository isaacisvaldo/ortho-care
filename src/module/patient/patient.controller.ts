import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PatientService } from './patient.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { FindAllDto } from 'src/common/pagination/find-all.dto';
import { JwtAuthGuard } from '../shared/auth/guards/jwt-auth.guard';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';


@Controller('patients')
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @Post()
  async create(@Body() createPatientDto: CreatePatientDto, @Request() req) {
    const createdBy = req.user?.sub;
    return this.patientService.create(createPatientDto, createdBy);
  }

  @Get('simple')
  async getPatientsForSelect(@Query('search') search?: string) {
    return this.patientService.findAllSimple({
      search,
      onlyActive: true,
      take: 100,
    });
  }

  @Get()
  async findAll(@Query() findAllQuery: FindAllDto) {
    return this.patientService.findAll(findAllQuery);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePatientDto: UpdatePatientDto,
    @Request() req,
  ) {
    const updatedBy = req.user?.sub;
    return this.patientService.update(id, updatePatientDto, updatedBy);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string, @Request() req) {
    const deletedBy = req.user?.sub;
    return this.patientService.remove(id, deletedBy);
  }

  @Get(':id') // sempre a última rota GET
  async findOne(@Param('id') id: string) {
    return this.patientService.findOne(id);
  }
}
