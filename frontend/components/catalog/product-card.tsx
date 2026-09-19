"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  CakeSlice,
  Flower2,
  Heart,
  Images,
  Puzzle,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

import { PriceTag } from "@/components/catalog/price-tag";
import { ProductBadge } from "@/components/catalog/product-badge";
import { PersonalizeButton } from "@/components/gifts/personalize-button";
import type { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
  index?: number;
}

const iconMap = {
  proposal: Sparkles,
  birthday: CakeSlice,
  apology: Flower2,
  anniversary: Heart,
  love_letter: Heart,
  photo_puzzle: Puzzle,
  scrapbook: Images,
  thank_you: Flower2,
  friendship: Sparkles,
  mothers_day: Heart,
};

const cardRotations = [
  "-rotate-[0.7deg]",
  "rotate-[0.5deg]",
  "-rotate-[0.3deg]",
  "rotate-[0.8deg]",
];

export function ProductCard({
  product,
  index = 0,
}: ProductCardProps) {
  const reduceMotion = useReducedMotion();

  const Icon =
    iconMap[product.templateKey as keyof typeof iconMap] ??
    Sparkles;

  const rotation =
    cardRotations[index % cardRotations.length];

  return (
    <motion.article
      initial={
        reduceMotion
          ? false
          : {
              opacity: 0,
              y: 24,
            }
      }
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        amount: 0.15,
      }}
      transition={{
        duration: 0.55,
        delay: reduceMotion
          ? 0
          : Math.min(index * 0.06, 0.3),
        ease: [0.22, 1, 0.36, 1],
      }}
      className={rotation}
    >
      <div
        className="
          group
          relative
          flex min-h-[390px]
          flex-col
          overflow-hidden
          rounded-[1.8rem_1.2rem_2rem_1.4rem]
          border border-line
          bg-paper
          p-6
          shadow-[var(--shadow-paper)]
          transition
          duration-300
          hover:-translate-y-1.5
          hover:border-line-strong
          sm:p-7
        "
      >
        <div
          className="
            absolute
            -right-12 -top-12
            size-36
            rounded-full
            bg-rose-soft/20
            transition-transform
            duration-500
            group-hover:scale-125
          "
          aria-hidden="true"
        />

        <div
          className="
            absolute
            -bottom-16 -left-10
            size-32
            rounded-full
            bg-champagne-soft/25
          "
          aria-hidden="true"
        />

        <div className="relative flex items-start justify-between gap-4">
          <div
            className="
              grid size-12
              place-items-center
              rounded-[40%_60%_45%_55%]
              bg-rose/10
              text-berry
              transition
              duration-300
              group-hover:rotate-6
              group-hover:bg-rose/15
            "
          >
            <Icon
              className="size-5"
              strokeWidth={1.7}
              aria-hidden="true"
            />
          </div>

          {product.badge ? (
            <ProductBadge label={product.badge} />
          ) : null}
        </div>

        <div className="relative mt-12 flex flex-1 flex-col">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-rose">
            {product.category}
          </p>

          <Link
            href={`/catalog/${product.slug}`}
            className="group/title"
          >
            <h2 className="serif text-3xl font-semibold leading-[1.05] tracking-[-0.035em] text-ink transition group-hover/title:text-berry">
              {product.name}
            </h2>
          </Link>

          <p className="mt-4 max-w-sm text-sm leading-7 text-ink-soft">
            {product.description}
          </p>

          <div className="mt-auto pt-8">
            <PriceTag
              basePrice={product.basePrice}
              salePrice={product.salePrice}
            />

            <div className="mt-6 flex items-center gap-3">
              <PersonalizeButton
                productId={product.id}
                className="flex-1"
              />

              <Link
                href={`/catalog/${product.slug}`}
                aria-label={`View details for ${product.name}`}
                className="
                  grid size-11
                  shrink-0
                  place-items-center
                  rounded-full
                  border border-line
                  text-berry
                  transition
                  duration-300
                  hover:border-berry
                  hover:bg-berry
                  hover:text-paper
                "
              >
                <ArrowUpRight
                  className="
                    size-4
                    transition-transform
                    duration-300
                    group-hover:translate-x-0.5
                    group-hover:-translate-y-0.5
                  "
                  aria-hidden="true"
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}