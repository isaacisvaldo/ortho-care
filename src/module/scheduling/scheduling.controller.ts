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
import { SchedulingService } from './scheduling.service';
import { CreateSchedulingDto } from './dto/create-scheduling.dto';
import { UpdateSchedulingDto } from './dto/update-scheduling.dto';
import { FindAllDto } from 'src/common/pagination/find-all.dto';

@ApiTags('Scheduling')
@Controller('scheduling')
export class SchedulingController {
  constructor(private readonly service: SchedulingService) {}

  @Post()
  @ApiOperation({ summary: 'Criar agendamento' })
  create(@Body() dto: CreateSchedulingDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar agendamentos' })
  findAll(
    @Query()
    query: FindAllDto & {
      patientId?: string;
      doctorId?: string;
      status?: string;
    },
  ) {
    return this.service.findAll(query);
  }

  @Get('simple')
  @ApiOperation({ summary: 'Listagem simples (agenda)' })
  findSimple(
    @Query('doctorId') doctorId?: string,
    @Query('patientId') patientId?: string,
  ) {
    return this.service.findAllSimple({ doctorId, patientId });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateSchedulingDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
