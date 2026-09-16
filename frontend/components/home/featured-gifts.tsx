import { ProductGrid } from "@/components/catalog/product-grid";
import type { Product } from "@/types/product";

type FeaturedGiftsProps = {
  products: Product[];
};

export function FeaturedGifts({
  products,
}: FeaturedGiftsProps) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
      <div className="mb-10 max-w-2xl">
        <p className="mb-3 font-script text-2xl text-berry">
          A few favorites
        </p>

        <h2 className="font-serif text-3xl text-ink sm:text-4xl">
          Made for moments worth keeping.
        </h2>
      </div>

      <ProductGrid products={products} />
    </section>
  );
}