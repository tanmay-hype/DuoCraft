"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Heart, Sparkles } from "lucide-react";
import Link from "next/link";

export function Hero() {
  const reduceMotion = useReducedMotion();

  const initial = reduceMotion
    ? false
    : {
        opacity: 0,
        y: 24,
      };

  return (
    <section className="relative overflow-hidden pb-20 pt-12 sm:pb-28 sm:pt-20">
      <div
        className="absolute left-[-7rem] top-20 size-64 rounded-full bg-rose-soft/15 blur-2xl"
        aria-hidden="true"
      />

      <div
        className="absolute right-[-5rem] top-0 size-72 rounded-full bg-champagne-soft/20 blur-3xl"
        aria-hidden="true"
      />

      <div className="page-shell relative">
        <div className="grid items-center gap-16 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <motion.p
              initial={initial}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="script text-2xl text-rose sm:text-3xl"
            >
              made for one person, not everyone
            </motion.p>

            <motion.h1
              initial={initial}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: reduceMotion ? 0 : 0.08,
              }}
              className="serif mt-4 max-w-4xl text-5xl font-semibold leading-[0.95] tracking-[-0.055em] text-ink sm:text-7xl lg:text-[5.4rem]"
            >
              Some feelings deserve{" "}
              <span className="text-berry">
                more than a message.
              </span>
            </motion.h1>

            <motion.p
              initial={initial}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: reduceMotion ? 0 : 0.16,
              }}
              className="mt-8 max-w-xl text-base leading-8 text-ink-soft sm:text-lg"
            >
              Turn your words, photos, and little shared
              memories into a digital gift they can open
              anywhere.
            </motion.p>

            <motion.div
              initial={initial}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: reduceMotion ? 0 : 0.24,
              }}
              className="mt-9 flex flex-wrap items-center gap-4"
            >
              <Link
                href="/catalog"
                className="group inline-flex items-center gap-2 rounded-full bg-berry px-7 py-3.5 font-semibold text-paper transition duration-300 hover:-translate-y-0.5 hover:bg-berry-deep"
              >
                Find their gift

                <ArrowRight
                  className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Link>

              <a
                href="#how-it-works"
                className="rounded-full border border-line-strong px-6 py-3.5 text-sm font-semibold text-ink-soft transition hover:border-berry/40 hover:text-berry"
              >
                See how it works
              </a>
            </motion.div>

            <motion.div
              initial={initial}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: reduceMotion ? 0 : 0.32,
              }}
              className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm text-ink-muted"
            >
              <span>Personalized by you</span>
              <span aria-hidden="true">•</span>
              <span>No account needed</span>
              <span aria-hidden="true">•</span>
              <span>Private gift link</span>
            </motion.div>
          </div>

          <HeroComposition
            reduceMotion={reduceMotion ?? false}
          />
        </div>
      </div>
    </section>
  );
}

interface HeroCompositionProps {
  reduceMotion: boolean;
}

function HeroComposition({
  reduceMotion,
}: HeroCompositionProps) {
  return (
    <motion.div
      initial={
        reduceMotion
          ? false
          : {
              opacity: 0,
              scale: 0.96,
              rotate: 2,
            }
      }
      animate={{
        opacity: 1,
        scale: 1,
        rotate: 0,
      }}
      transition={{
        duration: 0.8,
        delay: reduceMotion ? 0 : 0.18,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="relative mx-auto min-h-[460px] w-full max-w-[520px] sm:min-h-[540px]"
      aria-hidden="true"
    >
      <div className="absolute left-[5%] top-[8%] w-[76%] rotate-[-5deg] rounded-[2rem_1.2rem_2.3rem_1.5rem] border border-line bg-paper p-7 shadow-[var(--shadow-paper)] sm:p-9">
        <div className="flex items-center justify-between">
          <span className="script text-2xl text-rose">
            for you
          </span>

          <Heart
            className="size-5 text-berry"
            strokeWidth={1.6}
          />
        </div>

        <p className="serif mt-10 text-3xl leading-tight text-ink sm:text-4xl">
          You somehow make ordinary days feel worth
          remembering.
        </p>

        <div className="mt-10 h-px bg-line" />

        <p className="mt-5 text-sm leading-6 text-ink-muted">
          A little something made from all the things
          I never want us to forget.
        </p>
      </div>

      <div className="absolute bottom-[6%] right-[2%] w-[58%] rotate-[7deg] rounded-[1.2rem_2rem_1.5rem_2.2rem] border border-line bg-paper-deep p-5 shadow-[var(--shadow-paper)] sm:p-6">
        <div className="grid aspect-[4/3] place-items-center rounded-[1rem_1.5rem_1.2rem_1.7rem] bg-rose-soft/25">
          <Sparkles
            className="size-10 text-berry/70"
            strokeWidth={1.3}
          />
        </div>

        <p className="script mt-4 text-center text-2xl text-berry">
          our little world
        </p>
      </div>

      <div className="absolute right-[5%] top-[4%] grid size-16 rotate-12 place-items-center rounded-[42%_58%_46%_54%] bg-champagne-soft text-berry shadow-sm">
        <Heart
          className="size-6"
          strokeWidth={1.5}
        />
      </div>
    </motion.div>
  );
}