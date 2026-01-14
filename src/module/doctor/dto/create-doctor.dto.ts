import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';

export class CreateDoctorDto {
  @ApiProperty({
    example: 'João',
    description: 'Primeiro nome do médico',
  })
  @IsString()
  @IsNotEmpty()
  fisrtName: string;

  @ApiProperty({
    example: 'Silva',
    description: 'Último nome do médico',
  })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    example: 'joao.silva@clinic.com',
    description: 'Email do médico',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Senha@123',
    minLength: 6,
    description: 'Senha do médico (será encriptada)',
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    example: 'BI12345678LA045',
    description: 'Número de identificação',
  })
  @IsString()
  identityNumber: string;

  @ApiProperty({
    example: '+244923456789',
    description: 'Número de telefone',
  })
  @IsString()
  phone: string;

  @ApiProperty({
    example: 'b8f6d6c3-7c61-4b1b-9d94-1b5c9a5f2c11',
    format: 'uuid',
    description: 'ID do perfil associado ao médico',
  })
  @IsUUID()
  profileId: string;

  @ApiProperty({
    example: false,
    default: false,
    description: 'Indica se o médico é root',
  })
  @IsBoolean()
  isRoot?: boolean;
}
