import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { PrismaService } from 'src/config/libs/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  /**
   * Valida as credenciais do usuário.
   * Aqui você pode definir apenas um tipo de usuário (por exemplo, Admin).
   */
  async validateUser(email: string, password: string): Promise<any> {

    console.log(email);
    
    const user = await this.prisma.admin.findUnique({ where: { email } });
    console.log(user);
    
    if (!user) return null;

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) return null;

    const { passwordHash, ...result } = user;
    return result;
  }

  /**
   * Gera o token JWT para o usuário validado.
   */
  async login(user: any) {
    const payload = { 
      email: user.email, 
      sub: user.id,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }
}
