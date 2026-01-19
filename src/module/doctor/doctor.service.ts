import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';

import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { FindAllDto } from 'src/common/pagination/find-all.dto';
import { PaginatedDto } from 'src/common/pagination/paginated.dto';
import { PrismaService } from 'src/config/libs/prisma/prisma.service';
import { Admin, Prisma } from '@prisma/client';


@Injectable()
export class DoctorService {
  constructor(
    private readonly prisma: PrismaService,
 
  ) {}

  /**
   * Cria um novo médico
   */
  async create(createDoctorDto: CreateDoctorDto) {
    /*1. Verifica se quem está criando tem permissão (exemplo: admin ou root)
    const creator = await this.prisma.admin.findUnique({
      where: { id: creatorId },
    });

    if (!creator) {
      throw new ForbiddenException('Usuário não encontrado');
    }

    if (!creator.isRoot && !creator.isActive) {
      throw new ForbiddenException('Sem permissão para criar médicos');
    }

      */
    // 2. Verifica duplicidade de campos únicos
    const existing = await this.prisma.admin.findFirst({
      where: {
        OR: [
          { email: createDoctorDto.email },
          { identityNumber: createDoctorDto.identityNumber },
         
        ],
      },
    });

    if (existing) {
      throw new BadRequestException(
        'Já existe médico com este email, número de identidade ou CRM',
      );
    }

    // 3. Cria o médico
    const doctor = await this.prisma.admin.create({
      data: {
        fisrtName: createDoctorDto.fisrtName,
        lastName: createDoctorDto.lastName,
        email: createDoctorDto.email,
        passwordHash: '', // ← Normalmente não cria senha aqui para médico (ou usa fluxo separado)
        identityNumber: createDoctorDto.identityNumber,
       
        phone: createDoctorDto.phone,
        profileId:createDoctorDto.profileId,
       
    
        isActive: true,
       
      },
      include: {
        profile: true,
      },
    });

  
    return {
      message: 'Médico criado com sucesso',
      doctorId: doctor.id,
    };
  }

  /**
   * Lista todos os médicos com paginação e filtro
   */
  async findAll(
    query: FindAllDto & { specialtyId?: string; activeOnly?: boolean },
  ): Promise<PaginatedDto<Admin>> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.AdminWhereInput = {
      deletedAt: null,
    };

    if (query.search) {
      where.OR = [
        { fisrtName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
     
      ];
    }


    if (query.activeOnly) {
      where.isActive = true;
    }

    const [doctors, total] = await this.prisma.$transaction([
      this.prisma.admin.findMany({
        skip,
        take: limit,
        where,
        orderBy: [{ lastName: 'asc' }, { fisrtName: 'asc' }],
        include: {
          especialityAdmins: {
             include:{
              especiality:{
                select:{
                  id:true,
                  name:true
                }
              }
             }
          },
        },
      }),
      this.prisma.admin.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: doctors,
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Busca um médico específico
   */
  async findOne(id: string): Promise<Admin> {
    const doctor = await this.prisma.admin.findUnique({
      where: { id, deletedAt: null },
      include: {
        especialityAdmins: {
          include:{
            especiality:true

          }
        },
      
      },
    });

    if (!doctor) {
      throw new NotFoundException(`Médico com ID ${id} não encontrado`);
    }

    return doctor;
  }

  /**
   * Atualiza dados do médico
   */
  async update(
    id: string,
    updateDoctorDto: UpdateDoctorDto,
    updaterId: string,
  ): Promise<Admin> {
    const existing = await this.prisma.admin.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Médico ${id} não encontrado`);
    }

    const updateData: Prisma.AdminUpdateInput = {};

    // Campos que podem ser atualizados
    const allowedFields = [
      'firstName',
      'lastName',
      'email',
      'phone',
     
      'specialtyId',
      'isActive',
     
    ];

    for (const field of allowedFields) {
      if (updateDoctorDto[field] !== undefined) {
        updateData[field] = updateDoctorDto[field];
      }
    }

    const updated = await this.prisma.admin.update({
      where: { id },
      data: updateData,
      include: { especialityAdmins: {include:{especiality:true}} },
    });

 

    return updated;
  }

  /**
   * Soft-delete (marca como deletado)
   */
  async remove(id: string, deleterId?: string) {
    const doctor = await this.prisma.admin.findUnique({
      where: { id },
    });

    if (!doctor) {
      throw new NotFoundException(`Médico ${id} não encontrado`);
    }

    if (doctor.deletedAt) {
      throw new BadRequestException('Médico já está inativo/excluído');
    }

    const deleted = await this.prisma.admin.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });

   

    return { message: 'Médico removido com sucesso', id };
  }
  /**
 * Lista simplificada de médicos para dropdowns/selects
 * Retorna apenas id, nome completo e (opcionalmente) especialidade/telefone
 */
async findAllSimple(params: {
  search?: string;
  onlyActive?: boolean;
  take?: number;
} = {}): Promise<Array<{ id: string; fullName: string; specialty?: string; phone?: string }>> {
  const where: Prisma.AdminWhereInput = {
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

  const doctors = await this.prisma.admin.findMany({
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
      phone: true,
      // Se quiser mostrar especialidade (recomendado)
      especialityAdmins: {
        take: 1,
        select: {
          especiality: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  return doctors.map(doc => ({
    id: doc.id,
    fullName: `${doc.fisrtName} ${doc.lastName}`.trim(),
    phone: doc.phone,
    specialty: doc.especialityAdmins?.[0]?.especiality?.name || undefined,
  }));
}
}