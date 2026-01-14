import {
  Controller,
  Get,

  Query,
  UseGuards,

} from '@nestjs/common';
import { JwtAuthGuard } from '../shared/auth/guards/jwt-auth.guard';
import { ProfileService } from './profile-service.service';
import { FindAllDto } from 'src/common/pagination/find-all.dto';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';

@Controller('profiles')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  // ---------------------------------------------------
  // Lista paginada - ideal para tela administrativa
  // ---------------------------------------------------
  @Get()
 
  async findAll(@Query() query: FindAllDto) {
    return this.profileService.findAllPaginated(query);
  }

  // ---------------------------------------------------
  // Lista simples - ótimo para dropdowns, selects, formulários
  // ---------------------------------------------------
@Get('simple')

@ApiOperation({ 
  summary: 'Lista simplificada de perfis para selects/dropdowns',
  description: 'Retorna todos os perfis em formato leve, ideal para selects e autocomplete'
})
@ApiQuery({
  name: 'activeOnly',
  required: false,
  type: String,
  description: 'Filtra apenas perfis ativos (true/false). Se não enviado, retorna todos.',
  example: 'true',
})
@ApiQuery({
  name: 'search',
  required: false,
  type: String,
  description: 'Termo de busca no nome ou label do perfil',
  example: 'admin',
})
async getProfilesForSelect(
  @Query('activeOnly') activeOnly?: string,
  @Query('search') search?: string,
) {
  return this.profileService.findAllSimple({
    onlyActive: activeOnly === 'true',
    search,
    includePermissions: false,
  });
}

}