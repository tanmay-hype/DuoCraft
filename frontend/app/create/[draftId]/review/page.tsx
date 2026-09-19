"use client";

import {
  ArrowLeft,
  Check,
  LockKeyhole,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { getDraft } from "@/lib/api/drafts";
import type {
  BirthdayPersonalization,
  Draft,
} from "@/types/draft";

function getBirthdayPersonalization(
  draft: Draft,
): BirthdayPersonalization {
  const stored = draft.personalization;

  return {
    recipient_name:
      typeof stored.recipient_name === "string"
        ? stored.recipient_name
        : "",
    sender_name:
      typeof stored.sender_name === "string"
        ? stored.sender_name
        : "",
    headline:
      typeof stored.headline === "string"
        ? stored.headline
        : "",
    message:
      typeof stored.message === "string"
        ? stored.message
        : "",
  };
}

export default function ReviewGiftPage() {
  const params = useParams<{ draftId: string }>();
  const draftId = params.draftId;

  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadDraft() {
      try {
        const loadedDraft = await getDraft(draftId);

        if (active) {
          setDraft(loadedDraft);
        }
      } catch (caughtError) {
        if (active) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "Unable to load your gift.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadDraft();

    return () => {
      active = false;
    };
  }, [draftId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-cream">
        <div className="page-shell py-24 text-center">
          <p className="script text-3xl text-rose">
            preparing your gift...
          </p>
        </div>
      </main>
    );
  }

  if (error || !draft) {
    return (
      <main className="min-h-screen bg-cream">
        <div className="page-shell py-24">
          <div className="mx-auto max-w-xl rounded-[2rem] border border-line bg-paper p-8 text-center shadow-[var(--shadow-paper)]">
            <h1 className="serif text-4xl font-semibold text-ink">
              We couldn&apos;t open this gift.
            </h1>

            <p className="mt-4 text-ink-soft">
              {error || "This draft is no longer available."}
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (draft.template_key !== "birthday") {
    return (
      <main className="min-h-screen bg-cream">
        <div className="page-shell py-24 text-center">
          <h1 className="serif text-4xl font-semibold text-ink">
            Review is not available for this gift yet.
          </h1>
        </div>
      </main>
    );
  }

  const personalization =
    getBirthdayPersonalization(draft);

  const complete =
    personalization.recipient_name.trim() !== "" &&
    personalization.sender_name.trim() !== "" &&
    personalization.headline.trim() !== "" &&
    personalization.message.trim() !== "";

  if (!complete) {
    return (
      <main className="min-h-screen bg-cream">
        <div className="page-shell py-24">
          <div className="mx-auto max-w-xl rounded-[2rem] border border-line bg-paper p-8 text-center shadow-[var(--shadow-paper)]">
            <p className="script text-3xl text-rose">
              one little thing
            </p>

            <h1 className="serif mt-3 text-4xl font-semibold text-ink">
              Your gift needs a few more words.
            </h1>

            <p className="mt-4 leading-7 text-ink-soft">
              Finish all the Birthday fields before reviewing
              your gift.
            </p>

            <Link
              href={`/create/${draft.id}`}
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-berry px-6 py-3 text-sm font-bold text-paper transition hover:-translate-y-0.5"
            >
              <ArrowLeft className="size-4" />
              Finish personalizing
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream">
      <div className="page-shell py-10 sm:py-14">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link
              href={`/create/${draft.id}`}
              className="inline-flex items-center gap-2 text-sm font-bold text-ink-soft transition hover:text-berry"
            >
              <ArrowLeft className="size-4" />
              Back to edit
            </Link>

            <div className="flex items-center gap-2 text-sm text-ink-muted">
              <LockKeyhole className="size-4" />
              Private draft
            </div>
          </div>

          <div className="mt-10 text-center">
            <p className="script text-3xl text-rose">
              one last look
            </p>

            <h1 className="serif mt-3 text-5xl font-semibold tracking-[-0.05em] text-ink sm:text-6xl">
              Ready to make their day?
            </h1>

            <p className="mx-auto mt-5 max-w-xl leading-7 text-ink-soft">
              Check the details below. You can still go back
              and change anything.
            </p>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <section className="relative overflow-hidden rounded-[2.5rem_1.6rem_2.8rem_1.8rem] border border-line bg-paper p-8 shadow-[var(--shadow-paper)] sm:p-12">
              <Sparkles
                className="absolute right-8 top-8 size-6 text-rose opacity-60"
                strokeWidth={1.5}
              />

              <p className="script text-3xl text-rose">
                a little birthday magic
              </p>

              <div className="py-16 text-center">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-ink-muted">
                  especially for
                </p>

                <h2 className="serif mt-4 text-5xl font-semibold tracking-[-0.05em] text-ink">
                  {personalization.recipient_name}
                </h2>

                <h3 className="serif mx-auto mt-8 max-w-lg text-3xl leading-tight text-ink">
                  {personalization.headline}
                </h3>

                <p className="mx-auto mt-7 max-w-lg whitespace-pre-wrap leading-8 text-ink-soft">
                  {personalization.message}
                </p>
              </div>

              <div className="text-right">
                <p className="text-sm text-ink-muted">
                  with love,
                </p>

                <p className="script mt-1 text-3xl text-ink">
                  {personalization.sender_name}
                </p>
              </div>
            </section>

            <aside className="rounded-[2rem] border border-line bg-paper p-7 shadow-[var(--shadow-paper)]">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-rose">
                Your gift
              </p>

              <h2 className="serif mt-3 text-3xl font-semibold text-ink">
                Birthday Gift
              </h2>

              <div className="mt-7 grid gap-4 border-y border-line py-6">
                <ReviewItem
                  label="For"
                  value={personalization.recipient_name}
                />

                <ReviewItem
                  label="From"
                  value={personalization.sender_name}
                />

                <ReviewItem
                  label="Theme"
                  value={formatTheme(draft.theme_key)}
                />
              </div>

              <div className="mt-6 flex items-start gap-3 rounded-2xl bg-cream p-4">
                <div className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-berry text-paper">
                  <Check className="size-3.5" />
                </div>

                <p className="text-sm leading-6 text-ink-soft">
                  Your personalization is saved and ready for
                  the next step.
                </p>
              </div>

              <button
                type="button"
                disabled
                className="mt-7 w-full cursor-not-allowed rounded-full bg-berry px-6 py-3.5 text-sm font-bold text-paper opacity-50"
              >
                Checkout coming in Phase 5
              </button>

              <p className="mt-3 text-center text-xs leading-5 text-ink-muted">
                Payment is intentionally disabled until the
                verified checkout flow is implemented.
              </p>
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}

function ReviewItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-6">
      <span className="text-sm text-ink-muted">
        {label}
      </span>

      <span className="text-right text-sm font-bold text-ink">
        {value}
      </span>
    </div>
  );
}

function formatTheme(
  theme: string | null,
): string {
  switch (theme) {
    case "rose-celebration":
      return "Rose Celebration";
    case "midnight-gold":
      return "Midnight Gold";
    default:
      return "Warm Confetti";
  }
}
