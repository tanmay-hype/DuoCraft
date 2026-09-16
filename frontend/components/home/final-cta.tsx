import { ArrowUpRight, Heart } from "lucide-react";
import Link from "next/link";

export function FinalCta() {
  return (
    <section className="pb-10 pt-20 sm:pb-16 sm:pt-28">
      <div className="page-shell">
        <div className="relative overflow-hidden py-16 text-center sm:py-24">
          <Heart
            className="
              absolute
              left-[8%]
              top-[20%]
              size-8
              -rotate-12
              text-rose-soft/50
            "
            strokeWidth={1.3}
            aria-hidden="true"
          />

          <Heart
            className="
              absolute
              bottom-[18%]
              right-[10%]
              size-5
              rotate-12
              text-champagne
            "
            strokeWidth={1.3}
            aria-hidden="true"
          />

          <p className="script text-3xl text-rose">
            you already know who it&apos;s for
          </p>

          <h2
            className="
              serif
              mx-auto
              mt-4
              max-w-3xl
              text-5xl
              font-semibold
              leading-[0.98]
              tracking-[-0.05em]
              sm:text-6xl
            "
          >
            Make them something
            <span className="text-berry">
              {" "}only you could make.
            </span>
          </h2>

          <p className="mx-auto mt-7 max-w-lg leading-7 text-ink-soft">
            Start with a template, then turn it into
            something that feels unmistakably yours.
          </p>

          <Link
            href="/catalog"
            className="
              group
              mt-9
              inline-flex
              items-center
              gap-2
              rounded-full
              bg-berry
              px-7 py-3.5
              font-semibold
              text-paper
              transition
              duration-300
              hover:-translate-y-0.5
              hover:bg-berry-deep
            "
          >
            Make a gift

            <ArrowUpRight
              className="
                size-4
                transition-transform
                duration-300
                group-hover:translate-x-0.5
                group-hover:-translate-y-0.5
              "
            />
          </Link>
        </div>
      </div>
    </section>
  );
}