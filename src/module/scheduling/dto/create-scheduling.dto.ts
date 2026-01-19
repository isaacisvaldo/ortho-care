import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSchedulingDto {
  @ApiProperty({ example: '08:30 - 09:00' })
  @IsString()
  hours: string;

  @ApiProperty({ example: 'uuid-patient' })
  @IsString()
  patientId: string;

  @ApiProperty({ example: 'uuid-doctor' })
  @IsString()
  doctorId: string;

  @ApiProperty({ example: 'CONSULTA' })
  @IsString()
  type: string;

  @ApiProperty({ example: 'AGENDADO' })
  @IsString()
  status: string;

  @ApiProperty({ example: 'Paciente com dor de cabeça' })
  @IsString()
  observation: string;

  @ApiProperty({ example: '923456789' })
  @IsString()
  phone: string;
}
