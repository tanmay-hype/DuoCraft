export type ProductCategory =
  | "romance"
  | "celebration"
  | "gratitude"
  | "friendship"
  | "family"
  | "memories";

export type Product = {
  id: number;
  slug: string;
  name: string;
  category: ProductCategory;
  description: string;
  basePrice: number;
  salePrice: number;
  badge: string | null;
  templateKey: string;
  featured: boolean;
  displayOrder: number;
};

export type ProductApiResponse = {
  id: number;
  slug: string;
  name: string;
  category: ProductCategory;
  description: string;
  base_price: number;
  sale_price: number;
  badge: string | null;
  template_key: string;
  is_featured: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
};