import { Controller, Post, Body, Res, BadRequestException } from '@nestjs/common';
import { type Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/auth.dto';

@ApiTags('Autenticação')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Autentica um usuário e retorna um cookie JWT.' })
  @ApiResponse({ status: 201, description: 'Login bem-sucedido. Retorna cookie JWT.' })
  async login(@Body() credentials: LoginDto, @Res({ passthrough: true }) res: Response) {
    // Valida o usuário (apenas um nível)
    const user = await this.authService.validateUser(credentials.email, credentials.password);
    if (!user) throw new BadRequestException('Credenciais inválidas');

    const { access_token, user: userData } = await this.authService.login(user);

    // Define cookie
    res.cookie('access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 15, // 15 minutos
    });

    return { message: 'Login bem-sucedido', user: userData };
  }

  @Post('logout')
  @ApiOperation({ summary: 'Remove o cookie de autenticação JWT.' })
  @ApiResponse({ status: 200, description: 'Logout realizado com sucesso.' })
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token');
    return { message: 'Logout realizado com sucesso' };
  }
}
