"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useMemo, useState } from "react";

import { ProductGrid } from "@/components/catalog/product-grid";
import type {
  Product,
  ProductCategory,
} from "@/types/product";

interface CatalogBrowserProps {
  products: Product[];
}

type FilterValue = "all" | ProductCategory;

interface Filter {
  label: string;
  value: FilterValue;
}

const filters: Filter[] = [
  { label: "All gifts", value: "all" },
  { label: "Romance", value: "romance" },
  { label: "Celebration", value: "celebration" },
  { label: "Memories", value: "memories" },
  { label: "Gratitude", value: "gratitude" },
  { label: "Friendship", value: "friendship" },
  { label: "Family", value: "family" },
];

export function CatalogBrowser({
  products,
}: CatalogBrowserProps) {
  const [activeFilter, setActiveFilter] =
    useState<FilterValue>("all");

  const reduceMotion = useReducedMotion();

  const filteredProducts = useMemo(() => {
    if (activeFilter === "all") {
      return products;
    }

    return products.filter(
      (product) => product.category === activeFilter,
    );
  }, [activeFilter, products]);

  return (
    <div>
      <div className="mb-10">
        <div
          className="
            flex
            gap-2
            overflow-x-auto
            pb-3
            [scrollbar-width:none]
            [&::-webkit-scrollbar]:hidden
            sm:flex-wrap
            sm:overflow-visible
            sm:pb-0
          "
          role="group"
          aria-label="Filter gifts by category"
        >
          {filters.map((filter) => {
            const isActive =
              activeFilter === filter.value;

            return (
              <button
                key={filter.value}
                type="button"
                onClick={() =>
                  setActiveFilter(filter.value)
                }
                aria-pressed={isActive}
                className={`
                  relative
                  shrink-0
                  overflow-hidden
                  rounded-full
                  border
                  px-4
                  py-2.5
                  text-sm
                  font-semibold
                  transition-colors
                  duration-300
                  ${
                    isActive
                      ? "border-berry text-paper"
                      : "border-line-strong bg-paper/60 text-ink-soft hover:border-berry/40 hover:text-berry"
                  }
                `}
              >
                {isActive && (
                  <motion.span
                    layoutId="catalog-filter"
                    className="absolute inset-0 bg-berry"
                    transition={
                      reduceMotion
                        ? { duration: 0 }
                        : {
                            type: "spring",
                            stiffness: 400,
                            damping: 32,
                          }
                    }
                  />
                )}

                <span className="relative z-10">
                  {filter.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-7 flex items-center justify-between">
        <p
          className="text-sm text-ink-muted"
          aria-live="polite"
        >
          {filteredProducts.length}{" "}
          {filteredProducts.length === 1
            ? "gift"
            : "gifts"}
        </p>

        {activeFilter !== "all" && (
          <button
            type="button"
            onClick={() => setActiveFilter("all")}
            className="text-sm font-semibold text-berry transition-opacity hover:opacity-70"
          >
            Clear filter
          </button>
        )}
      </div>

      <ProductGrid products={filteredProducts} />
    </div>
  );
}