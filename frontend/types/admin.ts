import type { ProductApiResponse } from "@/types/product";

export type AdminProduct = ProductApiResponse & {
  is_active: boolean;
};

export type AdminProductUpdate = {
  name?: string;
  category?: string;
  description?: string;
  base_price?: number;
  sale_price?: number;
  badge?: string | null;
  is_featured?: boolean;
  is_active?: boolean;
  display_order?: number;
};