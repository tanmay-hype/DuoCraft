import Link from "next/link";
import { Gift, Home } from "lucide-react";

export default function GiftNotFound() {
  return (
    <main className="min-h-screen bg-cream px-5 py-16 text-ink">
      <div className="mx-auto flex min-h-[70vh] max-w-xl items-center justify-center">
        <section className="w-full rounded-[2rem] border border-line bg-paper p-8 text-center shadow-[var(--shadow-paper)] sm:p-12">
          <div className="mx-auto grid size-16 place-items-center rounded-full bg-rose/10 text-rose">
            <Gift className="size-7" />
          </div>

          <h1 className="serif mt-6 text-4xl font-semibold">
            This gift isn&apos;t available.
          </h1>

          <p className="mt-4 text-sm leading-6 text-ink-soft">
            The private gift link may be incorrect,
            expired, or no longer active.
          </p>

          <Link
            href="/"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3.5 text-sm font-bold text-paper transition hover:-translate-y-0.5"
          >
            <Home className="size-4" />
            Back to DuoCraft
          </Link>
        </section>
      </div>
    </main>
  );
}