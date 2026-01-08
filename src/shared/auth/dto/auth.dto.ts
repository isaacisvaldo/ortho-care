import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
   @ApiProperty({
    example: 'isaac.bunga@outlook.com',
    description: 'E-mail do usuário para autenticação.',
  })
  @IsNotEmpty({ message: 'O campo de email é obrigatório.' })
  email: string;
  @ApiProperty({ example: '123456', description: 'Senha do usuário.' })
  @IsString({ message: 'A senha deve ser uma string.' })
  @IsNotEmpty({ message: 'O campo senha é obrigatório.' })
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres.' })
  password: string;
}