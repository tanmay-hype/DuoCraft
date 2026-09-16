import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { Logo } from "@/components/ui/logo";

export function Navbar() {
  return (
    <header className="relative z-50">
      <div className="page-shell flex h-20 items-center justify-between gap-4">
        <Logo />

        <nav
          className="hidden items-center gap-8 md:flex"
          aria-label="Main navigation"
        >
          <Link
            href="/catalog"
            className="text-sm font-medium text-ink-soft transition-colors hover:text-berry"
          >
            Gifts
          </Link>

          <Link
            href="/#how-it-works"
            className="text-sm font-medium text-ink-soft transition-colors hover:text-berry"
          >
            How it works
          </Link>

          <Link
            href="/#why-duocraft"
            className="text-sm font-medium text-ink-soft transition-colors hover:text-berry"
          >
            Why DuoCraft
          </Link>
        </nav>

        <Link
          href="/catalog"
          className="
            group
            inline-flex
            shrink-0
            items-center
            gap-2
            rounded-full
            bg-berry
            px-4
            py-2.5
            text-sm
            font-semibold
            text-paper
            transition
            duration-300
            hover:-translate-y-0.5
            hover:bg-berry-deep
            sm:px-5
          "
        >
          <span className="hidden sm:inline">
            Make a gift
          </span>

          <span className="sm:hidden">
            Gifts
          </span>

          <ArrowUpRight
            className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            aria-hidden="true"
          />
        </Link>
      </div>
    </header>
  );
}