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
import { StockService } from './stock.service';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { FindAllDto } from 'src/common/pagination/find-all.dto';

import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../shared/auth/guards/jwt-auth.guard';

@ApiTags('Stock / Inventário')
@Controller('stocks')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  /**
   * Cria um novo item no stock/inventário
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  // @Roles(Role.ADMIN, Role.INVENTORY_MANAGER) // descomente se tiveres roles
  @ApiOperation({ summary: 'Cria um novo item de stock' })
  async create(@Body() createStockDto: CreateStockDto, @Request() req) {
    const createdBy = req.user?.sub; // ID do usuário autenticado
    return this.stockService.create(createStockDto, createdBy);
  }

  /**
   * Lista paginada de itens de stock (para tabelas administrativas)
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Lista paginada de itens de stock com filtros' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'supplierId', required: false, type: String })
  @ApiQuery({ name: 'categoryId', required: false, type: String })
  async findAll(
    @Query() query: FindAllDto & {
      supplierId?: string;
      categoryId?: string;
      minQuantity?: number;
    },
  ) {
    return this.stockService.findAll(query);
  }

  /**
   * Busca um item específico de stock
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtém detalhes de um item de stock específico' })
  async findOne(@Param('id') id: string) {
    return this.stockService.findOne(id);
  }

  /**
   * Atualiza um item de stock
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Atualiza informações de um item de stock' })
  async update(
    @Param('id') id: string,
    @Body() updateStockDto: UpdateStockDto,
    @Request() req,
  ) {
    const updatedBy = req.user?.sub;
    return this.stockService.update(id, updateStockDto);
  }

  /**
   * Remove (soft-delete) um item de stock
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Remove (arquiva) um item de stock' })
  async remove(@Param('id') id: string, @Request() req) {
    const deletedBy = req.user?.sub;
    return this.stockService.remove(id);
  }

  /**
   * Lista simplificada de itens de stock para dropdowns / selects
   * (ideal para formulários de entrada/saída de stock)
   */
  @Get('simple')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Lista leve de itens de stock para selects/dropdowns',
    description: 'Retorna apenas ID, nome e quantidade atual. Útil para formulários.',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Busca parcial pelo nome do item',
    example: 'paracetamol',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de itens disponíveis em stock',
  })
  async getStockItemsForSelect(@Query('search') search?: string) {
    return this.stockService.findAllSimple({
      search,
      take: 100, // limite máximo para evitar sobrecarga
    });
  }
}