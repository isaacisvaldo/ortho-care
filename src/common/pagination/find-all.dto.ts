import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber, Min, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class FindAllDto {
  @ApiPropertyOptional({ description: 'Página atual para a paginação (inicia em 1).', minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number) // ✅ Importante: converte a string da query para number
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Número de itens por página.', minimum: 1, default: 10 })
  @IsOptional()
  @Type(() => Number) // ✅ Importante: converte a string da query para number
  @IsNumber()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Termo de pesquisa para filtros de texto.' })
  @IsOptional()
  @IsString()
  search?: string;
}
