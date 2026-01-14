import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateStockDto {
  @ApiProperty({
    example: 'Paracetamol 500mg',
    description: 'Nome do item em stock',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'c9a7b8e4-3d5e-4f7a-9c2a-1d8f5a6e9b11',
    format: 'uuid',
    description: 'ID do fornecedor',
  })
  @IsUUID()
  supplierId: string;

  @ApiProperty({
    example: 'a2b4c6d8-9f0e-4a3b-8c7d-1e2f3a4b5c6d',
    format: 'uuid',
    description: 'ID da categoria',
  })
  @IsUUID()
  categoryId: string;

  @ApiProperty({
    example: 150,
    description: 'Quantidade disponível em stock',
  })
  @IsNumber()
  @Min(0)
  quantity: number;
}
