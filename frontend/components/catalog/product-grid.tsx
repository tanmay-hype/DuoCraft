import { ProductCard } from "@/components/catalog/product-card";
import type { Product } from "@/types/product";

interface ProductGridProps {
  products: Product[];
}

export function ProductGrid({
  products,
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="rounded-[2rem] border border-dashed border-line-strong bg-paper/50 px-6 py-16 text-center">
        <p className="serif text-2xl text-ink">
          Nothing here yet.
        </p>

        <p className="mt-2 text-sm text-ink-muted">
          Try another kind of moment.
        </p>
      </div>
    );
  }

  return (
    <div
      className="
        grid
        grid-cols-1
        gap-x-5
        gap-y-7
        sm:grid-cols-2
        lg:grid-cols-3
        lg:gap-x-6
        lg:gap-y-9
      "
    >
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          index={index}
        />
      ))}
    </div>
  );
}