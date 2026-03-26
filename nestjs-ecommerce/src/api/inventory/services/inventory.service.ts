import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Inventory } from 'src/database/entities/inventory.entity';
import { Repository } from 'typeorm';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
  ) {}

  async createInitialStock(productId: number): Promise<Inventory> {
    let inventory = await this.inventoryRepository.findOne({
      where: { productId },
    });

    if (!inventory) {
      inventory = this.inventoryRepository.create({
        productId,
        availableStock: 1,
        reservedStock: 0,
      });
      await this.inventoryRepository.save(inventory);
    }

    return inventory;
  }

  async getByProductId(productId: number): Promise<Inventory> {
    const inventory = await this.inventoryRepository.findOne({
      where: { productId },
    });
    if (inventory) return inventory;

    return this.inventoryRepository.create({
      productId,
      availableStock: 0,
      reservedStock: 0,
    });
  }

  async updateStock(productId: number, quantity: number): Promise<Inventory> {
    if (!Number.isInteger(quantity) || quantity < 0) {
      throw new BadRequestException('Quantity must be a non-negative integer');
    }

    let inventory = await this.inventoryRepository.findOne({
      where: { productId },
    });
    if (!inventory) {
      inventory = this.inventoryRepository.create({
        productId,
        availableStock: 0,
        reservedStock: 0,
      });
    }
    inventory.availableStock = quantity;
    await this.inventoryRepository.save(inventory);

    return this.getByProductId(productId);
  }

  async deleteByProductId(productId: number): Promise<void> {
    await this.inventoryRepository.delete({ productId });
  }
}
