import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/config/libs/prisma/prisma.service';
import { CreateConsultationDto } from './dto/create-consultation.dto';
import { UpdateConsultationDto } from './dto/update-consultation.dto';
import { FindAllDto } from 'src/common/pagination/find-all.dto';
import { PaginatedDto } from 'src/common/pagination/paginated.dto';
import { Prisma, Consultation } from '@prisma/client';

@Injectable()
export class ConsultationService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Criar consulta
   * 1 consulta por agendamento
   */
  async create(dto: CreateConsultationDto) {
    const scheduling = await this.prisma.scheduling.findUnique({
      where: { id: dto.schedulingId },
    });
  
    

    if (!scheduling || scheduling.deletedAt) {
      throw new BadRequestException('Agendamento inválido');
    }

    const existing = await this.prisma.consultation.findUnique({
      where: { schedulingId: dto.schedulingId },
    });

    if (existing) {
      throw new BadRequestException(
        'Já existe uma consulta para este agendamento',
      );
    }

    const consultation = await this.prisma.consultation.create({
      data: {
        schedulingId: dto.schedulingId,

        medicalHistory: dto.medicalHistory
          ? {
              create: {
                description: dto.medicalHistory,
              },
            }
          : undefined,

        medicines: dto.medicines?.length
          ? {
              create: dto.medicines.map(m => ({
                name: m.name,
                description: m.description,
              })),
            }
          : undefined,

        exames: dto.exames
          ? {
              create: {
                name: dto.exames.name,
                description: dto.exames.description,
                file: dto.exames.file,
              },
            }
          : undefined,

        procedure: dto.procedure
          ? {
              create: {
                name: dto.procedure.name,
                description: dto.procedure.description,
                doctorId: dto.procedure.doctorId,
              },
            }
          : undefined,
      },
      include: {
        medicalHistory: true,
        medicines: true,
        exames: true,
        procedure: true,
      },
    });

    return {
      message: 'Consulta criada com sucesso',
      consultationId: consultation.id,
    };
  }

  /**
   * Listagem com paginação
   */
  async findAll(
    query: FindAllDto & {
      schedulingId?: string;
      doctorId?: string;
    },
  ): Promise<PaginatedDto<Consultation>> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.ConsultationWhereInput = {
      deletedAt: null,
    };

    if (query.schedulingId) where.schedulingId = query.schedulingId;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.consultation.findMany({
        skip,
        take: limit,
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          scheduling: {
            include: {
              patient: true,
              admin: true,
            },
          },
        },
      }),
      this.prisma.consultation.count({ where }),
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
   * Buscar consulta por ID
   */
  async findOne(id: string): Promise<Consultation> {
    const consultation = await this.prisma.consultation.findUnique({
      where: { id },
      include: {
        scheduling: {
          include: {
            patient: true,
            admin: true,
          },
        },
        medicalHistory: true,
        medicines: true,
        exames: true,
        procedure: true,
      },
    });

    if (!consultation || consultation.deletedAt) {
      throw new NotFoundException('Consulta não encontrada');
    }

    return consultation;
  }

  /**
   * Atualizar consulta (histórico, meds, exames, procedimento)
   */
  async update(id: string, dto: UpdateConsultationDto) {
    const consultation = await this.prisma.consultation.findUnique({
      where: { id },
    });

    if (!consultation || consultation.deletedAt) {
      throw new NotFoundException('Consulta não encontrada');
    }

    // estratégia simples: substitui os filhos
    await this.prisma.medicines.deleteMany({
      where: { consultationId: id },
    });

    return this.prisma.consultation.update({
      where: { id },
      data: {
        medicalHistory: dto.medicalHistory
          ? {
              upsert: {
                create: { description: dto.medicalHistory },
                update: { description: dto.medicalHistory },
              },
            }
          : undefined,

        medicines: dto.medicines
          ? {
              create: dto.medicines.map(m => ({
                name: m.name,
                description: m.description,
              })),
            }
          : undefined,

        exames: dto.exames
          ? {
              upsert: {
                create: {
                  name: dto.exames.name,
                  description: dto.exames.description,
                  file: dto.exames.file,
                },
                update: {
                  name: dto.exames.name,
                  description: dto.exames.description,
                  file: dto.exames.file,
                },
              },
            }
          : undefined,

        procedure: dto.procedure
          ? {
              upsert: {
                create: {
                  name: dto.procedure.name,
                  description: dto.procedure.description,
                  doctorId: dto.procedure.doctorId,
                },
                update: {
                  name: dto.procedure.name,
                  description: dto.procedure.description,
                  doctorId: dto.procedure.doctorId,
                },
              },
            }
          : undefined,
      },
    });
  }

  /**
   * Soft delete
   */
  async remove(id: string) {
    const consultation = await this.prisma.consultation.findUnique({
      where: { id },
    });

    if (!consultation || consultation.deletedAt) {
      throw new NotFoundException('Consulta não encontrada');
    }

    await this.prisma.consultation.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    return { message: 'Consulta arquivada com sucesso', id };
  }
}
