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

export type AdminAddon = {
  id: number;
  slug: string;
  name: string;
  description: string;
  price: number;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
};

export type AdminAddonUpdate = {
  name?: string;
  description?: string;
  price?: number;
  is_active?: boolean;
  display_order?: number;
};