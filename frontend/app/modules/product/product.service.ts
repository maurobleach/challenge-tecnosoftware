import { apiClient } from "~/api/client";

export type Product = {
  id: number;
  code?: string | null;
  title: string | null;
  variationType?: "NONE" | "OnlySize" | "OnlyColor" | "SizeAndColor" | null;
  description?: string | null;
  about?: string[] | null;
  details?: {
    category?: "Test" | string;
    test?: boolean;
    [key: string]: unknown;
  } | null;
  isActive: boolean;
  categoryId: number | null;
  category?: {
    id: number;
    name: string;
  } | null;
};

export type CreateProductPayload = {
  categoryId: number;
};

export type AddProductDetailsPayload = {
  title: string;
  code: string;
  variationType: "NONE" | "OnlySize" | "OnlyColor" | "SizeAndColor";
  details: Record<string, unknown>;
  about: string[];
  description: string;
};

export const productService = {
  async getProducts(token: string): Promise<Product[]> {
    return apiClient.get<Product[]>("/product", token);
  },
  async getProduct(token: string, productId: number) {
    return apiClient.get<Product>(`/product/${productId}`, token);
  },
  async createProduct(token: string, payload: CreateProductPayload) {
    return apiClient.post<Product, CreateProductPayload>(
      "/product/create",
      payload,
      token,
    );
  },
  addProductDetails(token: string, productId: number, payload: AddProductDetailsPayload) {
    return apiClient.post<{ id: number }, AddProductDetailsPayload>(
      `/product/${productId}/details`,
      payload,
      token,
    );
  },
  activateProduct(token: string, productId: number) {
    return apiClient.post<{ id: number; isActive: boolean }, Record<string, never>>(
      `/product/${productId}/activate`,
      {},
      token,
    );
  },
};
