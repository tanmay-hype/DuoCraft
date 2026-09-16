import { formatPrice } from "@/lib/utils";

interface PriceTagProps {
  basePrice: number;
  salePrice: number;
}

export function PriceTag({
  basePrice,
  salePrice,
}: PriceTagProps) {
  const hasDiscount = salePrice < basePrice;

  return (
    <div className="flex items-baseline gap-2">
      <span className="text-lg font-bold text-berry">
        {formatPrice(salePrice)}
      </span>

      {hasDiscount && (
        <span className="text-sm text-ink-muted line-through">
          {formatPrice(basePrice)}
        </span>
      )}
    </div>
  );
}
