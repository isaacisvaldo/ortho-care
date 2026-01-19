import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/config/libs/prisma/prisma.service";


@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lista categorias activas para dropdown
   */
  async findAllForDropdown() {
    return this.prisma.category.findMany({
      where: {
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        label: true,
      },
      orderBy: {
        label: "asc",
      },
    });
  }
}
