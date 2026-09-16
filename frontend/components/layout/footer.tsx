import Link from "next/link";

import { Logo } from "@/components/ui/logo";


export function Footer() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="page-shell py-12">
        <div className="grid gap-10 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <Logo />

            <p className="mt-5 max-w-md text-sm leading-7 text-ink-soft">
              Small digital experiences made from the things
              only you two understand.
            </p>
          </div>

          <nav
            className="flex flex-wrap gap-x-7 gap-y-3 text-sm text-ink-soft"
            aria-label="Footer navigation"
          >
            <Link
              href="/catalog"
              className="transition-colors hover:text-berry"
            >
              Browse gifts
            </Link>

            <Link
              href="/#how-it-works"
              className="transition-colors hover:text-berry"
            >
              How it works
            </Link>
          </nav>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-line pt-6 text-xs text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} DuoCraft.
          </p>

          <p>
            Made for moments worth keeping.
          </p>
        </div>
      </div>
    </footer>
  );
}