import type { Metadata } from "next";

import { CatalogBrowser } from "@/components/catalog/catalog-browser";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { products } from "@/data/products";

export const metadata: Metadata = {
  title: "Digital Gifts",
  description:
    "Browse personalized digital gifts for birthdays, anniversaries, friendships, love, gratitude, and more.",
};

export default function CatalogPage() {
  return (
    <>
      <Navbar />

      <main>
        <section className="page-shell pb-20 pt-14 sm:pb-28 sm:pt-20">
          <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-3xl">
              <p className="script text-2xl text-rose sm:text-3xl">
                pick the feeling first
              </p>

              <h1
                className="
                  serif
                  mt-3
                  text-5xl
                  font-semibold
                  leading-[0.96]
                  tracking-[-0.05em]
                  text-ink
                  sm:text-6xl
                  lg:text-7xl
                "
              >
                What are you trying
                <span className="block text-berry">
                  to say?
                </span>
              </h1>

              <p className="mt-7 max-w-xl text-base leading-8 text-ink-soft sm:text-lg">
                Choose a starting point. You&apos;ll make
                the words, photos, names, and little
                details completely yours.
              </p>
            </div>

            <div
              className="
                hidden
                max-w-[230px]
                rotate-2
                rounded-[1.3rem_1.8rem_1.2rem_2rem]
                border border-line
                bg-paper
                p-5
                shadow-[var(--shadow-paper)]
                lg:block
              "
            >
              <p className="script text-xl text-rose">
                tiny reminder
              </p>

              <p className="serif mt-2 text-lg leading-snug text-ink">
                The best one is the one that sounds like
                you.
              </p>
            </div>
          </div>

          <div className="mt-16 sm:mt-20">
            <div className="mb-8">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-rose">
                The collection
              </p>

              <h2 className="serif mt-2 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
                Made for different kinds of moments.
              </h2>
            </div>

            <CatalogBrowser products={products} />
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}