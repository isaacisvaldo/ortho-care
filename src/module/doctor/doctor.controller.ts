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
import { DoctorService } from './doctor.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { FindAllDto } from 'src/common/pagination/find-all.dto';
import { JwtAuthGuard } from '../shared/auth/guards/jwt-auth.guard';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';



@Controller('doctors') 
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createDoctorDto: CreateDoctorDto, @Request() req) {
    const creatorId = req.user.sub; 
    return this.doctorService.create(createDoctorDto, creatorId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(
    @Query() findAllQuery: FindAllDto ,
  ) {
   

    return this.doctorService.findAll(findAllQuery);
  }
/**
 * Lista simplificada de médicos para dropdowns e selects
 * Retorna apenas campos essenciais: id, nome completo, especialidade (se disponível)
 */
@Get('simple')
@UseGuards(JwtAuthGuard)
@ApiOperation({
  summary: 'Lista leve de médicos para dropdowns e selects',
  description: 'Retorna lista simplificada de médicos ativos. Ideal para campos de seleção/autocomplete.'
})
@ApiQuery({
  name: 'search',
  required: false,
  type: String,
  description: 'Busca parcial por nome ou sobrenome (opcional)',
  example: 'João Silva'
})
async getDoctorsForSelect(
  @Query('search') search?: string,
) {
  return this.doctorService.findAllSimple({
    search,
    onlyActive: true,      // por padrão só médicos ativos
    take: 100,             // limite máximo (ajuste conforme necessidade)
  });
}
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string) {
    return this.doctorService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard) 
  async update(
    @Param('id') id: string,
    @Body() updateDoctorDto: UpdateDoctorDto,
    @Request() req,
  ) {
    const updaterId = req.user.sub;
    return this.doctorService.update(id, updateDoctorDto, updaterId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string, @Request() req) {
    const deleterId = req.user.sub;
    return this.doctorService.remove(id, deleterId);
  }

  @Patch(':id/restore')
  @UseGuards(JwtAuthGuard)

  async restore(@Param('id') id: string, @Request() req) {
    const userId = req.user.sub;

    
    return { message: 'Funcionalidade de restauração ainda não implementada' };
  }
}