import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/config/libs/prisma/prisma.service'; // ajuste o caminho conforme teu projeto
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { FindAllDto } from 'src/common/pagination/find-all.dto';
import { PaginatedDto } from 'src/common/pagination/paginated.dto';
import { Prisma, Stock } from '@prisma/client';
// import { AuditLogService } from 'src/module/shared/auditLog/auditLog.service'; // opcional

@Injectable()
export class StockService {
  constructor(
    private readonly prisma: PrismaService,
    // private readonly auditLogService: AuditLogService, // descomente se tiveres auditoria
  ) {}

  /**
   * Cria um novo item de stock
   */
  async create(createStockDto: CreateStockDto, createdBy?: string) {
    // 1. Verifica se fornecedor e categoria existem
    const [supplier, category] = await Promise.all([
      this.prisma.supplier.findUnique({ where: { id: createStockDto.supplierId } }),
      this.prisma.category.findUnique({ where: { id: createStockDto.categoryId } }),
    ]);

    if (!supplier) {
      throw new BadRequestException('Fornecedor não encontrado');
    }
    if (!category) {
      throw new BadRequestException('Categoria não encontrada');
    }

    // 2. Verifica duplicidade de nome (opcional, mas recomendado)
    const existing = await this.prisma.stock.findFirst({
      where: {
        name: { equals: createStockDto.name, mode: 'insensitive' },
        deletedAt: null,
      },
    });

    if (existing) {
      throw new BadRequestException(`Já existe um item de stock com o nome "${createStockDto.name}"`);
    }

    // 3. Cria o stock
    const stock = await this.prisma.stock.create({
      data: {
        name: createStockDto.name,
        supplierId: createStockDto.supplierId,
        categoryId: createStockDto.categoryId,
        quantity: createStockDto.quantity || 0,
      },
      include: {
        supplier: { select: { id: true, name: true } },
        category: { select: { id: true, name: true } },
      },
    });

    // Auditoria (opcional)
    // await this.auditLogService.createLog({...});

    return {
      message: 'Item de stock criado com sucesso',
      stockId: stock.id,
    };
  }

  /**
   * Lista de stocks com paginação e filtros
   */
  async findAll(
    query: FindAllDto & {
      supplierId?: string;
      categoryId?: string;
      minQuantity?: number;
      activeOnly?: boolean;
    },
  ): Promise<PaginatedDto<Stock>> {
    const page = query.page || 1;
    const limit = query.limit || 15;
    const skip = (page - 1) * limit;

    const where: Prisma.StockWhereInput = {
      deletedAt: null,
    };

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { supplier: { name: { contains: query.search, mode: 'insensitive' } } },
        { category: { name: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    if (query.supplierId) where.supplierId = query.supplierId;
    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.minQuantity !== undefined) {
      where.quantity = { gte: query.minQuantity };
    }

    const [stocks, total] = await this.prisma.$transaction([
      this.prisma.stock.findMany({
        skip,
        take: limit,
        where,
        orderBy: [
          { name: 'asc' },
          { createdAt: 'desc' },
        ],
        include: {
          supplier: { select: { id: true, name: true } },
          category: { select: { id: true, name: true } },
        },
      }),
      this.prisma.stock.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: stocks,
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Busca um item de stock específico
   */
  async findOne(id: string): Promise<Stock> {
    const stock = await this.prisma.stock.findUnique({
      where: { id, deletedAt: null },
      include: {
        supplier: { select: { id: true, name: true, phone: true } },
        category: { select: { id: true, name: true } },
      },
    });

    if (!stock) {
      throw new NotFoundException(`Item de stock com ID ${id} não encontrado`);
    }

    return stock;
  }

  /**
   * Atualiza um item de stock
   */
  async update(id: string, updateStockDto: UpdateStockDto) {
    const existing = await this.prisma.stock.findUnique({
      where: { id },
    });

    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Item de stock ${id} não encontrado ou inativo`);
    }

 
    // Se estiver a alterar fornecedor ou categoria, verifica existência
    if (updateStockDto.supplierId && updateStockDto.supplierId !== existing.supplierId) {
      const supplierExists = await this.prisma.supplier.findUnique({
        where: { id: updateStockDto.supplierId },
      });
      if (!supplierExists) throw new BadRequestException('Fornecedor não encontrado');
    }

    if (updateStockDto.categoryId && updateStockDto.categoryId !== existing.categoryId) {
      const categoryExists = await this.prisma.category.findUnique({
        where: { id: updateStockDto.categoryId },
      });
      if (!categoryExists) throw new BadRequestException('Categoria não encontrada');
    }

    const updated = await this.prisma.stock.update({
      where: { id },
      data: updateStockDto,
      include: {
        supplier: { select: { name: true } },
        category: { select: { name: true } },
      },
    });

    return updated;
  }

  /**
   * Soft-delete de um item de stock
   */
  async remove(id: string) {
    const stock = await this.prisma.stock.findUnique({
      where: { id },
    });

    if (!stock || stock.deletedAt) {
      throw new NotFoundException(`Item de stock ${id} não encontrado ou já removido`);
    }

    await this.prisma.stock.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    return { message: 'Item de stock removido com sucesso (arquivado)', id };
  }

  // =====================================================================
  // Lista simples para dropdowns / selects (bônus)
  // =====================================================================
  async findAllSimple(
    params: { search?: string; take?: number } = {},
  ): Promise<Array<{ id: string; name: string; quantity: number }>> {
    const where: Prisma.StockWhereInput = {
      deletedAt: null,
      quantity: { gt: 0 }, // só mostra itens com stock disponível (opcional)
    };

    if (params.search?.trim()) {
      where.name = { contains: params.search.trim(), mode: 'insensitive' };
    }

    const items = await this.prisma.stock.findMany({
      where,
      take: params.take || 50,
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        quantity: true,
      },
    });

    return items;
  }
}