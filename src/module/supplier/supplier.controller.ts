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
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { SupplierService } from './supplier.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { FindAllDto } from 'src/common/pagination/find-all.dto';

@ApiTags('Suppliers')
@Controller('suppliers')
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  /**
   * Criar fornecedor
   */
  @Post()
  @ApiOperation({ summary: 'Criar novo fornecedor' })
  create(@Body() createSupplierDto: CreateSupplierDto) {
    return this.supplierService.create(createSupplierDto);
  }

  /**
   * Listagem com paginação
   */
  @Get()
  @ApiOperation({ summary: 'Listar fornecedores (com paginação)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 15 })
  @ApiQuery({ name: 'search', required: false, example: 'farmácia' })
  @ApiQuery({ name: 'activeOnly', required: false, example: true })
  findAll(
    @Query() query: FindAllDto & { activeOnly?: boolean },
  ) {
    return this.supplierService.findAll(query);
  }

  /**
   * Listagem simples (dropdown)
   */
  @Get('dropdown')
  @ApiOperation({ summary: 'Listar fornecedores para dropdown' })
  @ApiQuery({ name: 'search', required: false, example: 'farmácia' })
  @ApiQuery({ name: 'onlyActive', required: false, example: true })
  findAllDropdown(
    @Query('search') search?: string,
    @Query('onlyActive') onlyActive?: boolean,
  ) {
    return this.supplierService.findAllSimple({
      search,
      onlyActive,
    });
  }

  /**
   * Buscar fornecedor por ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Buscar fornecedor por ID' })
  findOne(@Param('id') id: string) {
    return this.supplierService.findOne(id);
  }

  /**
   * Atualizar fornecedor
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar fornecedor' })
  update(
    @Param('id') id: string,
    @Body() updateSupplierDto: UpdateSupplierDto,
  ) {
    return this.supplierService.update(id, updateSupplierDto);
  }

  /**
   * Remover fornecedor (soft delete)
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Remover fornecedor (soft delete)' })
  remove(@Param('id') id: string) {
    return this.supplierService.remove(id);
  }
}
