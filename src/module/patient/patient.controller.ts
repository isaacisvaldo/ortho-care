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

  /**
   * Cria um novo paciente
   */
  @Post()
  //@UseGuards(JwtAuthGuard)
  async create(@Body() createPatientDto: CreatePatientDto, @Request() req) {
    const createdBy = req.user?.sub; // ID do usuário autenticado (ajuste conforme sua estratégia JWT)
    return this.patientService.create(createPatientDto, createdBy);
  }
@Get('simple')

  @ApiOperation({
    summary: 'Lista leve de pacientes para dropdowns e selects',
    description: 'Retorna lista simplificada de pacientes ativos. Ideal para campos de seleção/autocomplete.'
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Busca parcial por nome ou sobrenome (opcional)',
    example: 'João Silva'
  })
  async getPatientsForSelect(
    @Query('search') search?: string,
  ) {
    return this.patientService.findAllSimple({
      search,
      onlyActive: true,           // quase sempre queremos apenas pacientes ativos em dropdowns
      take: 100,                  // limite máximo para evitar sobrecarga (ajuste conforme necessidade)
    });
  }
  /**
   * Lista paginada de pacientes (para telas administrativas/clínicas)
   */
  @Get()
  //@UseGuards(JwtAuthGuard)
  async findAll(
    @Query() findAllQuery: FindAllDto 
  ) {
  

    return this.patientService.findAll(findAllQuery);
  }

  /**
   * Busca um paciente específico pelo ID
   */
  @Get(':id')
 // @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string) {
    return this.patientService.findOne(id);
  }

  /**
   * Atualiza dados do paciente
   */
  @Patch(':id')
  //@UseGuards(JwtAuthGuard) 
  async update(
    @Param('id') id: string,
    @Body() updatePatientDto: UpdatePatientDto,
    @Request() req,
  ) {
    const updatedBy = req.user?.sub;
    return this.patientService.update(id, updatePatientDto, updatedBy);
  }

  /**
   * Remove (soft-delete) um paciente
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  //@UseGuards(JwtAuthGuard) 
  async remove(@Param('id') id: string, @Request() req) {
    const deletedBy = req.user?.sub;
    return this.patientService.remove(id, deletedBy);
  }

}