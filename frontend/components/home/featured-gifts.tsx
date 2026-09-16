import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { ProductGrid } from "@/components/catalog/product-grid";
import { featuredProducts } from "@/data/products";

export function FeaturedGifts() {
  return (
    <section className="py-20 sm:py-28">
      <div className="page-shell">
        <div className="mb-12 flex flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="script text-2xl text-rose">
              a place to start
            </p>

            <h2
              className="
                serif
                mt-2
                max-w-2xl
                text-4xl
                font-semibold
                leading-[1.02]
                tracking-[-0.045em]
                sm:text-5xl
              "
            >
              Gifts for the moments
              <span className="text-berry">
                {" "}you&apos;ll remember.
              </span>
            </h2>
          </div>

          <Link
            href="/catalog"
            className="
              group
              inline-flex
              w-fit
              items-center
              gap-2
              text-sm
              font-semibold
              text-berry
            "
          >
            Browse all gifts

            <ArrowRight
              className="
                size-4
                transition-transform
                duration-300
                group-hover:translate-x-1
              "
            />
          </Link>
        </div>

        <ProductGrid products={featuredProducts} />
      </div>
    </section>
  );
}