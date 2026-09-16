import Link from "next/link";


interface LogoProps {
  href?: string;
}


export function Logo({
  href = "/",
}: LogoProps) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-2"
      aria-label="DuoCraft home"
    >
      <span
        className="
          relative
          grid size-9
          rotate-[-4deg]
          place-items-center
          rounded-[45%_55%_48%_52%]
          bg-berry
          text-paper
          transition-transform
          duration-300
          group-hover:rotate-3
        "
        aria-hidden="true"
      >
        <span className="serif text-xl leading-none">
          D
        </span>
      </span>

      <span className="serif text-[1.55rem] font-semibold tracking-[-0.04em] text-ink">
        DuoCraft
      </span>
    </Link>
  );
}