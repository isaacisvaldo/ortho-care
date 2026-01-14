import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsString,
  IsOptional,
} from 'class-validator';

export class CreatePatientDto {
  @ApiProperty({
    example: 'Maria',
    description: 'Primeiro nome do paciente',
  })
  @IsString()
  @IsNotEmpty()
  fisrtName: string;

  @ApiProperty({
    example: 'Fernandes',
    description: 'Último nome do paciente',
  })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    example: '1995-08-21',
    description: 'Data de nascimento do paciente (YYYY-MM-DD)',
  })
  @IsString()
  @IsNotEmpty()
  birthDay: string;

  @ApiProperty({
    example: 'maria.fernandes@email.com',
    description: 'Email do paciente',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'BI98765432LA045',
    description: 'Número de identificação do paciente',
  })
  @IsString()
  identityNumber: string;

  @ApiProperty({
    example: '+244934567890',
    description: 'Número de telefone do paciente',
  })
  @IsString()
  phone: string;

  @ApiProperty({
    example: true,
    default: true,
    description: 'Indica se o paciente está ativo',
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
