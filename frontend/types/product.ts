export type ProductCategory =
  | "romance"
  | "celebration"
  | "gratitude"
  | "friendship"
  | "family"
  | "memories";

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: ProductCategory;
  description: string;
  basePrice: number;
  salePrice: number;
  badge?: string;
  templateKey: string;
  featured?: boolean;
}
