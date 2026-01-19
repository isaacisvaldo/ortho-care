import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ConsultationService } from './consultation.service';
import { CreateConsultationDto } from './dto/create-consultation.dto';
import { UpdateConsultationDto } from './dto/update-consultation.dto';
import { FindAllDto } from 'src/common/pagination/find-all.dto';

@ApiTags('Consultations')
@Controller('consultations')
export class ConsultationController {
  constructor(private readonly service: ConsultationService) {}

  @Post()
  @ApiOperation({ summary: 'Criar consulta' })
  create(@Body() dto: CreateConsultationDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar consultas' })
  findAll(
    @Query()
    query: FindAllDto & { schedulingId?: string },
  ) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhe da consulta' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar consulta' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateConsultationDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Arquivar consulta' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
