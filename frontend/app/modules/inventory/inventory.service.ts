import { apiClient } from "~/api/client";

export type InventoryItem = {
  productId: number;
  availableStock: number;
  reservedStock: number;
};

type UpdateInventoryPayload = {
  quantity: number;
};

export const inventoryService = {
  getInventoryByProduct(token: string, productId: number) {
    return apiClient.get<InventoryItem>(`/inventory/product/${productId}`, token);
  },
  updateStock(token: string, productId: number, quantity: number) {
    return apiClient.patch<InventoryItem, UpdateInventoryPayload>(
      `/inventory/product/${productId}`,
      { quantity },
      token,
    );
  },
};
