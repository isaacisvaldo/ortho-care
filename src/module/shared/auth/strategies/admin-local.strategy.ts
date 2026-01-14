import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';


@Injectable()

export class AdminLocalStrategy extends PassportStrategy(Strategy, 'local-admin') {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  // O Passport usa esta função para validar as credenciais.
  async validate(email: string, password: string): Promise<any> {
    // Chama o AuthService para validar o usuário como um ADMIN
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Credenciais de Administrador inválidas.');
    }
    return user;
  }
}
