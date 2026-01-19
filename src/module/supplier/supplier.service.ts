import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/config/libs/prisma/prisma.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { FindAllDto } from 'src/common/pagination/find-all.dto';
import { PaginatedDto } from 'src/common/pagination/paginated.dto';
import { Prisma, Supplier } from '@prisma/client';

@Injectable()
export class SupplierService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Cria fornecedor
   */
  async create(createSupplierDto: CreateSupplierDto) {
    const existing = await this.prisma.supplier.findFirst({
      where: {
        OR: [
          { email: createSupplierDto.email },
          { phone: createSupplierDto.phone },
          { identityNumber: createSupplierDto.identityNumber },
        ],
      },
    });

    if (existing) {
      throw new BadRequestException(
        'Já existe um fornecedor com este email, telefone ou número de identidade',
      );
    }

    const supplier = await this.prisma.supplier.create({
      data: {
        name: createSupplierDto.name,
        email: createSupplierDto.email,
        phone: createSupplierDto.phone,
        identityNumber: createSupplierDto.identityNumber,
        isActive: true,
      },
    });

    return {
      message: 'Fornecedor criado com sucesso',
      supplierId: supplier.id,
    };
  }

  /**
   * Listagem com paginação
   */
  async findAll(
    query: FindAllDto & { activeOnly?: boolean },
  ): Promise<PaginatedDto<Supplier>> {
    const page = query.page || 1;
    const limit = query.limit || 15;
    const skip = (page - 1) * limit;

    const where: Prisma.SupplierWhereInput = {
      deletedAt: null,
    };

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { phone: { contains: query.search } },
        { identityNumber: { contains: query.search } },
      ];
    }

    if (query.activeOnly !== undefined) {
      where.isActive = query.activeOnly;
    }

    const [suppliers, total] = await this.prisma.$transaction([
      this.prisma.supplier.findMany({
        skip,
        take: limit,
        where,
        orderBy: { name: 'asc' },
      }),
      this.prisma.supplier.count({ where }),
    ]);

    return {
      data: suppliers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Busca fornecedor por ID
   */
  async findOne(id: string): Promise<Supplier> {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id },
      include: {
        stocks: true,
      },
    });

    if (!supplier || supplier.deletedAt) {
      throw new NotFoundException(`Fornecedor ${id} não encontrado`);
    }

    return supplier;
  }

  /**
   * Atualiza fornecedor
   */
  async update(id: string, dto: UpdateSupplierDto): Promise<Supplier> {
    const existing = await this.prisma.supplier.findUnique({ where: { id } });

    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Fornecedor ${id} não encontrado`);
    }

    if (dto.email && dto.email !== existing.email) {
      const emailExists = await this.prisma.supplier.findUnique({
        where: { email: dto.email },
      });
      if (emailExists) throw new BadRequestException('Email já em uso');
    }

    if (dto.phone && dto.phone !== existing.phone) {
      const phoneExists = await this.prisma.supplier.findUnique({
        where: { phone: dto.phone },
      });
      if (phoneExists) throw new BadRequestException('Telefone já em uso');
    }

    if (
      dto.identityNumber &&
      dto.identityNumber !== existing.identityNumber
    ) {
      const idExists = await this.prisma.supplier.findUnique({
        where: { identityNumber: dto.identityNumber },
      });
      if (idExists)
        throw new BadRequestException(
          'Número de identidade já em uso',
        );
    }

    return this.prisma.supplier.update({
      where: { id },
      data: dto,
    });
  }

  /**
   * Soft delete
   */
  async remove(id: string) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id },
    });

    if (!supplier || supplier.deletedAt) {
      throw new NotFoundException('Fornecedor não encontrado');
    }

    await this.prisma.supplier.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });

    return {
      message: 'Fornecedor removido com sucesso',
      id,
    };
  }

  /**
   * Listagem simples para dropdown
   */
 async findAllSimple(
  params: {
    search?: string;
    onlyActive?: boolean;
    take?: number;
  } = {},
) {
  const where: Prisma.SupplierWhereInput = {
    deletedAt: null,
  };

  if (params.onlyActive !== undefined) {
    where.isActive = params.onlyActive;
  }

  if (params.search?.trim()) {
    where.OR = [
      {
        name: {
          contains: params.search.trim(),
          mode: 'insensitive',
        },
      },
    ];
  }

  return this.prisma.supplier.findMany({
    where,
    take: params.take ?? 50,
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
    },
  });
}

}
