import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class CreateConsultationDto {
  @ApiProperty({ example: 'uuid-scheduling' })
  @IsString()
  schedulingId: string;

  @ApiProperty({ example: 'Paciente com febre e dor de cabeça', required: false })
  @IsOptional()
  @IsString()
  medicalHistory?: string;

  @ApiProperty({
    example: [{ name: 'Paracetamol', description: '500mg 8/8h' }],
    required: false,
  })
  @IsOptional()
  @IsArray()
  medicines?: { name: string; description: string }[];

  @ApiProperty({
    example: {
      name: 'Raio-X',
      description: 'Raio-X do tórax',
      file: 'raiox.pdf',
    },
    required: false,
  })
  @IsOptional()
  exames?: {
    name: string;
    description: string;
    file?: string;
  };

  @ApiProperty({
    example: {
      name: 'Sutura',
      description: 'Sutura simples',
      doctorId: 'uuid-doctor',
    },
    required: false,
  })
  @IsOptional()
  procedure?: {
    name: string;
    description: string;
    doctorId?: string;
  };
}
