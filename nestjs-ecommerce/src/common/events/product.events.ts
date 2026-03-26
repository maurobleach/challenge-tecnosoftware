export const ProductEvents = {
  Created: 'product.created',
  Activated: 'product.activated',
} as const;

export type ProductCreatedEvent = {
  productId: number;
};

export type ProductActivatedEvent = {
  productId: number;
};
