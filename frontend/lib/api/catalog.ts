import type {
  Product,
  ProductApiResponse,
} from "@/types/product";

const API_URL =
  process.env.INTERNAL_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8000";

function mapProduct(
  product: ProductApiResponse,
): Product {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    category: product.category,
    description: product.description,
    basePrice: product.base_price,
    salePrice: product.sale_price,
    badge: product.badge,
    templateKey: product.template_key,
    featured: product.is_featured,
    displayOrder: product.display_order,
  };
}

export async function getProducts(): Promise<Product[]> {
  const response = await fetch(
    `${API_URL}/products`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch products: ${response.status}`,
    );
  }

  const products =
    (await response.json()) as ProductApiResponse[];

  return products.map(mapProduct);
}

export async function getProduct(
  slug: string,
): Promise<Product | null> {
  const response = await fetch(
    `${API_URL}/products/${encodeURIComponent(slug)}`,
    {
      cache: "no-store",
    },
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(
      `Failed to fetch product: ${response.status}`,
    );
  }

  const product =
    (await response.json()) as ProductApiResponse;

  return mapProduct(product);
}

export async function getFeaturedProducts(): Promise<
  Product[]
> {
  const response = await fetch(
    `${API_URL}/products?featured=true`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch featured products: ${response.status}`,
    );
  }

  const products =
    (await response.json()) as ProductApiResponse[];

  return products.map(mapProduct);
}