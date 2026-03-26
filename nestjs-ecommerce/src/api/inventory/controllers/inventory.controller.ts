import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { UpdateStockDto } from '../dto/inventory.dto';
import { InventoryService } from '../services/inventory.service';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('product/:productId/initial-stock')
  createInitialStock(@Param('productId', ParseIntPipe) productId: number) {
    return this.inventoryService.createInitialStock(productId);
  }

  @Get('product/:productId')
  getByProductId(@Param('productId', ParseIntPipe) productId: number) {
    return this.inventoryService.getByProductId(productId);
  }

  @Patch('product/:productId')
  updateStock(
    @Param('productId', ParseIntPipe) productId: number,
    @Body() body: UpdateStockDto,
  ) {
    return this.inventoryService.updateStock(productId, body.quantity);
  }
}
