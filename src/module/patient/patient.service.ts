import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/config/libs/prisma/prisma.service'; 
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { FindAllDto } from 'src/common/pagination/find-all.dto';
import { PaginatedDto } from 'src/common/pagination/paginated.dto';
import { Prisma, Patient } from '@prisma/client';

@Injectable()
export class PatientService {
  constructor(
    private readonly prisma: PrismaService,

  ) {}

  /**
   * Cria um novo paciente
   */
  async create(createPatientDto: CreatePatientDto, createdBy?: string) {
    // 1. Verifica duplicidade de campos únicos
    const existing = await this.prisma.patient.findFirst({
      where: {
        OR: [
          { email: createPatientDto.email },
          { identityNumber: createPatientDto.identityNumber },
          { phone: createPatientDto.phone },
        ],
      },
    });

    if (existing) {
      throw new BadRequestException(
        'Já existe um paciente com este email, número de identidade ou telefone',
      );
    }

    // 2. Cria o paciente
    const patient = await this.prisma.patient.create({
      data: {
        fisrtName: createPatientDto.fisrtName, // note o typo no schema (fisrtName)
        lastName: createPatientDto.lastName,
        birthDay: createPatientDto.birthDay, // formato string (recomendo mudar para DateTime no futuro)
        email: createPatientDto.email,
        identityNumber: createPatientDto.identityNumber,
        phone: createPatientDto.phone,
        isActive: true,
        // createdBy: createdBy, // ← se quiser rastrear quem criou
      },
    });

   

    return {
      message: 'Paciente criado com sucesso',
      patientId: patient.id,
    };
  }

  /**
   * Lista pacientes com paginação e filtros
   */
  async findAll(
    query: FindAllDto & {
      activeOnly?: boolean;
    },
  ): Promise<PaginatedDto<Patient>> {
    const page = query.page || 1;
    const limit = query.limit || 15;
    const skip = (page - 1) * limit;

    const where: Prisma.PatientWhereInput = {
      deletedAt: null,
    };

    if (query.search) {
      where.OR = [
        { fisrtName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { phone: { contains: query.search } },
        { identityNumber: { contains: query.search } },
      ];
    }

    if (query.activeOnly !== undefined) {
      where.isActive = query.activeOnly;
    }

    const [patients, total] = await this.prisma.$transaction([
      this.prisma.patient.findMany({
        skip,
        take: limit,
        where,
        orderBy: [{ lastName: 'asc' }, { fisrtName: 'asc' }],
      }),
      this.prisma.patient.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: patients,
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Busca um paciente específico
   */
  async findOne(id: string): Promise<Patient> {
    const patient = await this.prisma.patient.findUnique({
      where: { id, deletedAt: null },
      include: {
        schedulings: {
          take: 5,
          orderBy: { createdAt: 'desc' },
       
        },
      },
    });

    if (!patient) {
      throw new NotFoundException(`Paciente com ID ${id} não encontrado`);
    }

    return patient;
  }

  /**
   * Atualiza dados do paciente
   */
  async update(
    id: string,
    updatePatientDto: UpdatePatientDto,
    updatedBy?: string,
  ): Promise<Patient> {
    const existing = await this.prisma.patient.findUnique({
      where: { id },
    });

    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Paciente ${id} não encontrado ou inativo`);
    }

    // Verifica duplicidade se estiver tentando alterar campos únicos
    if (
      updatePatientDto.email &&
      updatePatientDto.email !== existing.email
    ) {
      const emailExists = await this.prisma.patient.findUnique({
        where: { email: updatePatientDto.email },
      });
      if (emailExists) throw new BadRequestException('Email já em uso');
    }

    if (
      updatePatientDto.phone &&
      updatePatientDto.phone !== existing.phone
    ) {
      const phoneExists = await this.prisma.patient.findUnique({
        where: { phone: updatePatientDto.phone },
      });
      if (phoneExists) throw new BadRequestException('Telefone já em uso');
    }

    const updateData: Prisma.PatientUpdateInput = {
      fisrtName: updatePatientDto.fisrtName,
      lastName: updatePatientDto.lastName,
      birthDay: updatePatientDto.birthDay,
      email: updatePatientDto.email,
      phone: updatePatientDto.phone,
      identityNumber: updatePatientDto.identityNumber,
      isActive: updatePatientDto.isActive,
    };

    const updated = await this.prisma.patient.update({
      where: { id },
      data: updateData,
    });

    // Auditoria (opcional)
    // await this.auditLogService.createLog({...});

    return updated;
  }

  /**
   * Soft-delete de paciente
   */
  async remove(id: string, deletedBy?: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { id },
    });

    if (!patient || patient.deletedAt) {
      throw new NotFoundException(`Paciente ${id} não encontrado ou já removido`);
    }

    await this.prisma.patient.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });

    // Auditoria (opcional)
    // await this.auditLogService.createLog({...});

    return { message: 'Paciente removido com sucesso (arquivado)', id };
  }
  /**
 * Lista simplificada de pacientes para dropdowns/selects
 * Retorna apenas campos essenciais
 */
async findAllSimple(params: {
  search?: string;
  onlyActive?: boolean;
  take?: number;
} = {}): Promise<Array<{ id: string; fullName: string; phone?: string }>> {
  const where: Prisma.PatientWhereInput = {
    deletedAt: null,
  };

  if (params.onlyActive !== undefined) {
    where.isActive = params.onlyActive;
  }

  if (params.search?.trim()) {
    const searchTerm = params.search.trim();
    where.OR = [
      { fisrtName: { contains: searchTerm, mode: 'insensitive' } },
      { lastName: { contains: searchTerm, mode: 'insensitive' } },
    ];
  }

  const patients = await this.prisma.patient.findMany({
    where,
    take: params.take || 50, // limite de segurança
    orderBy: [
      { lastName: 'asc' },
      { fisrtName: 'asc' },
    ],
    select: {
      id: true,
      fisrtName: true,
      lastName: true,
      phone: true, // opcional - pode remover se não precisar
    },
  });

  // Formata para o frontend (campo fullName é mais prático em selects)
  return patients.map(p => ({
    id: p.id,
    fullName: `${p.fisrtName} ${p.lastName}`.trim(),
    phone: p.phone,
  }));
}
}