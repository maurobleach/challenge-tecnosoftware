import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { EventsService } from 'src/common/events/events.service';
import { ProductCreatedEvent, ProductEvents } from 'src/common/events/product.events';
import { InventoryService } from '../services/inventory.service';

@Injectable()
export class InventoryListener implements OnModuleInit, OnModuleDestroy {
  constructor(
    private readonly inventoryService: InventoryService,
    private readonly eventsService: EventsService,
  ) {}

  private readonly onProductCreated = async (payload: ProductCreatedEvent) => {
    await this.inventoryService.createInitialStock(payload.productId);
  };

  onModuleInit() {
    this.eventsService.on(ProductEvents.Created, this.onProductCreated);
  }

  onModuleDestroy() {
    this.eventsService.off(ProductEvents.Created, this.onProductCreated);
  }
}
