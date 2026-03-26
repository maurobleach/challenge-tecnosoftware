import { apiClient } from "~/api/client";

export type Category = {
  id: number;
  name: string;
  products: unknown[];
  createdAt: string;
  updatedAt: string;
};

export const categoryService = {
  getCategories(token?: string | null) {
    return apiClient.get<Category[]>("/category", token);
  },
};
