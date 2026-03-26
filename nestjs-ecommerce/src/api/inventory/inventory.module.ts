import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inventory } from 'src/database/entities/inventory.entity';
import { InventoryController } from './controllers/inventory.controller';
import { InventoryListener } from './listeners/inventory.listener';
import { InventoryService } from './services/inventory.service';

@Module({
  imports: [TypeOrmModule.forFeature([Inventory])],
  controllers: [InventoryController],
  providers: [InventoryService, InventoryListener],
  exports: [InventoryService],
})
export class InventoryModule {}
