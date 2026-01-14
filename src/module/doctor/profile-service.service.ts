import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/config/libs/prisma/prisma.service'; // ajusta o caminho conforme teu projeto
import { Prisma, Profile } from '@prisma/client';
import { FindAllDto } from 'src/common/pagination/find-all.dto';
import { PaginatedDto } from 'src/common/pagination/paginated.dto';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}


  async findAllPaginated(
    query: FindAllDto & { onlyActive?: boolean },
  ): Promise<PaginatedDto<Profile>> {
    const page = query.page || 1;
    const limit = query.limit || 15;
    const skip = (page - 1) * limit;

    const where: Prisma.ProfileWhereInput = {
       deletedAt: null,   // ← descomenta se tiveres soft-delete em Profile
    };

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { label: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

   

    const [profiles, total] = await this.prisma.$transaction([
      this.prisma.profile.findMany({
        skip,
        take: limit,
        where,
        orderBy: [
          { name: 'asc' },
          { createdAt: 'desc' },
        ],
      
      }),
      this.prisma.profile.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: profiles,
      total,
      page,
      limit,
      totalPages,
     
    };
  }

  /**
   * Lista TODOS os perfis SEM paginação
   * Ideal para selects, dropdowns, listas curtas
   */
  async findAllSimple(
    params: {
      onlyActive?: boolean;
      includePermissions?: boolean;
      search?: string;
    } = {},
  ): Promise<Profile[]> {
    const where: Prisma.ProfileWhereInput = {
       deletedAt: null,  // ← descomenta se tiver soft-delete
    };

 

    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { label: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.profile.findMany({
      where,
      orderBy: [
        { name: 'asc' },
        { createdAt: 'desc' },
      ],
      include: {
       
        permissions: params.includePermissions ?? false,
       
      },
    });
  }


}