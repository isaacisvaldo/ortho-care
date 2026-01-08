import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO genérico para a resposta de dados paginados.
 * Use a sintaxe de generics para tipar os dados: PaginatedDto<Course>
 */
export class PaginatedDto<T> {
  @ApiProperty({ isArray: true })
  data: T[];

  @ApiProperty({ example: 50, description: 'O número total de registros encontrados.' })
  total: number;

  @ApiProperty({ example: 1, description: 'O número da página atual.' })
  page: number;

  @ApiProperty({ example: 10, description: 'O número de itens por página.' })
  limit: number;

  @ApiProperty({ example: 5, description: 'O número total de páginas.' })
  totalPages: number;
}