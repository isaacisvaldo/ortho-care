import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateSupplierDto {
  @ApiProperty({ example: 'Farmácia Central' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'farmacia@email.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '923456789' })
  @IsString()
  phone: string;

  @ApiProperty({ example: 'BI12345678LA045' })
  @IsString()
  identityNumber: string;
}
