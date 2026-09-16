interface ProductBadgeProps {
  label: string;
}

export function ProductBadge({
  label,
}: ProductBadgeProps) {
  return (
    <span
      className="
        inline-flex
        rounded-full
        border border-champagne/50
        bg-champagne-soft/60
        px-3 py-1
        text-[0.68rem]
        font-bold
        uppercase
        tracking-[0.12em]
        text-berry
      "
    >
      {label}
    </span>
  );
}