import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/config/libs/prisma/prisma.service';
import { CreateSchedulingDto } from './dto/create-scheduling.dto';
import { UpdateSchedulingDto } from './dto/update-scheduling.dto';
import { FindAllDto } from 'src/common/pagination/find-all.dto';
import { PaginatedDto } from 'src/common/pagination/paginated.dto';
import { Prisma, Scheduling } from '@prisma/client';

@Injectable()
export class SchedulingService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Criar agendamento
   */
  async create(dto: CreateSchedulingDto) {
    // valida paciente
    const patient = await this.prisma.patient.findUnique({
      where: { id: dto.patientId },
    });
    if (!patient) {
      throw new BadRequestException('Paciente inválido');
    }

    // valida médico
    const doctor = await this.prisma.admin.findUnique({
      where: { id: dto.doctorId },
    });
    if (!doctor) {
      throw new BadRequestException('Médico inválido');
    }

    const scheduling = await this.prisma.scheduling.create({
      data: {
        hours: dto.hours,
        patientId: dto.patientId,
        doctorId: dto.doctorId,
        type: dto.type,
        status: dto.status,
        observation: dto.observation,
        phone: dto.phone,
      },
    });

    return {
      message: 'Agendamento criado com sucesso',
      schedulingId: scheduling.id,
    };
  }

  /**
   * Listar agendamentos com paginação
   */
  async findAll(
    query: FindAllDto & {
      patientId?: string;
      doctorId?: string;
      status?: string;
    },
  ): Promise<PaginatedDto<Scheduling>> {
    const page = query.page || 1;
    const limit = query.limit || 15;
    const skip = (page - 1) * limit;

    const where: Prisma.SchedulingWhereInput = {
      deletedAt: null,
    };

    if (query.patientId) where.patientId = query.patientId;
    if (query.doctorId) where.doctorId = query.doctorId;
    if (query.status) where.status = query.status;

    if (query.search) {
      where.OR = [
        { phone: { contains: query.search } },
        { observation: { contains: query.search, mode: 'insensitive' } },
        { type: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.scheduling.findMany({
        skip,
        take: limit,
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          patient: true,
          admin: true,
        },
      }),
      this.prisma.scheduling.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Buscar por ID
   */
  async findOne(id: string): Promise<Scheduling> {
    const scheduling = await this.prisma.scheduling.findUnique({
      where: { id },
      include: {
        patient: true,
        admin: true,
        consultations: true,
      },
    });

    if (!scheduling || scheduling.deletedAt) {
      throw new NotFoundException(`Agendamento ${id} não encontrado`);
    }

    return scheduling;
  }

  /**
   * Atualizar agendamento
   */
  async update(
    id: string,
    dto: UpdateSchedulingDto,
  ): Promise<Scheduling> {
    const existing = await this.prisma.scheduling.findUnique({
      where: { id },
    });

    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Agendamento ${id} não encontrado`);
    }

    return this.prisma.scheduling.update({
      where: { id },
      data: dto,
    });
  }

  /**
   * Soft delete
   */
  async remove(id: string) {
    const scheduling = await this.prisma.scheduling.findUnique({
      where: { id },
    });

    if (!scheduling || scheduling.deletedAt) {
      throw new NotFoundException('Agendamento não encontrado');
    }

    await this.prisma.scheduling.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: 'CANCELADO',
      },
    });

    return {
      message: 'Agendamento cancelado com sucesso',
      id,
    };
  }

  /**
   * Listagem simples (agenda / dropdown)
   */
  async findAllSimple(params: {
    doctorId?: string;
    patientId?: string;
    take?: number;
  } = {}) {
    const where: Prisma.SchedulingWhereInput = {
      deletedAt: null,
    };

    if (params.doctorId) where.doctorId = params.doctorId;
    if (params.patientId) where.patientId = params.patientId;

    return this.prisma.scheduling.findMany({
      where,
      take: params.take || 50,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        hours: true,
        status: true,
        patient: {
          select: {
            fisrtName: true,
            lastName: true,
          },
        },
      },
    });
  }
}
