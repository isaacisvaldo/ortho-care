import { Module } from '@nestjs/common';
import { StockService } from './stock.service';
import { StockController } from './stock.controller';
import { JwtService } from '@nestjs/jwt';
import { CategoryService } from './category.service';

@Module({
  controllers: [StockController],
  providers: [StockService,JwtService,CategoryService],
})
export class StockModule {}
