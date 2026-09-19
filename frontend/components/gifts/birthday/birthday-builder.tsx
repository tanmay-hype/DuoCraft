"use client";

import {
  ArrowRight,
  Check,
  CircleAlert,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { updateDraft } from "@/lib/api/drafts";
import type {
  BirthdayPersonalization,
  BirthdayTheme,
  Draft,
} from "@/types/draft";

interface BirthdayBuilderProps {
  draft: Draft;
}

const THEMES: Array<{
  key: BirthdayTheme;
  name: string;
  description: string;
}> = [
  {
    key: "warm-confetti",
    name: "Warm Confetti",
    description: "Cream, berry and playful celebration.",
  },
  {
    key: "rose-celebration",
    name: "Rose Celebration",
    description: "Soft rose with a romantic paper feel.",
  },
  {
    key: "midnight-gold",
    name: "Midnight Gold",
    description: "A richer, evening celebration mood.",
  },
];

function getInitialPersonalization(
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
        : "Happy Birthday!",
    message:
      typeof stored.message === "string"
        ? stored.message
        : "",
  };
}

function getInitialTheme(
  draft: Draft,
): BirthdayTheme {
  if (
    draft.theme_key === "warm-confetti" ||
    draft.theme_key === "rose-celebration" ||
    draft.theme_key === "midnight-gold"
  ) {
    return draft.theme_key;
  }

  return "warm-confetti";
}

function isComplete(
  personalization: BirthdayPersonalization,
): boolean {
  return (
    personalization.recipient_name.trim().length > 0 &&
    personalization.sender_name.trim().length > 0 &&
    personalization.headline.trim().length > 0 &&
    personalization.message.trim().length > 0
  );
}

function MissingField({
  label,
}: {
  label: string;
}) {
  return (
    <span className="rounded-full border border-line bg-cream px-3 py-1.5 text-xs font-bold text-ink-soft">
      {label}
    </span>
  );
}

export function BirthdayBuilder({
  draft,
}: BirthdayBuilderProps) {
  const router = useRouter();

  const [personalization, setPersonalization] =
    useState<BirthdayPersonalization>(() =>
      getInitialPersonalization(draft),
    );

  const [theme, setTheme] = useState<BirthdayTheme>(() =>
    getInitialTheme(draft),
  );

  const [saveState, setSaveState] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");

  const firstRender = useRef(true);
  const saveRequest = useRef(0);

  const complete = isComplete(personalization);

  const recipientMissing =
    personalization.recipient_name.trim() === "";

  const senderMissing =
    personalization.sender_name.trim() === "";

  const headlineMissing =
    personalization.headline.trim() === "";

  const messageMissing =
    personalization.message.trim() === "";

  const canContinue =
    complete && saveState === "saved";

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    if (!complete) {
      return;
    }

    const requestId = ++saveRequest.current;

    const timeout = window.setTimeout(async () => {
      setSaveState("saving");

      try {
        await updateDraft(draft.id, {
          personalization,
          theme_key: theme,
        });

        if (requestId === saveRequest.current) {
          setSaveState("saved");
        }
      } catch {
        if (requestId === saveRequest.current) {
          setSaveState("error");
        }
      }
    }, 700);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [
    complete,
    draft.id,
    personalization,
    theme,
  ]);

  function updateField(
    field: keyof BirthdayPersonalization,
    value: string,
  ) {
    setPersonalization((current) => ({
      ...current,
      [field]: value,
    }));

    setSaveState("idle");
  }

  function updateTheme(
    nextTheme: BirthdayTheme,
  ) {
    setTheme(nextTheme);
    setSaveState("idle");
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
      <section className="rounded-[2rem_1.4rem_2.2rem_1.6rem] border border-line bg-paper p-6 shadow-[var(--shadow-paper)] sm:p-8">
        <div>
          <p className="script text-2xl text-rose">
            make it theirs
          </p>

          <h1 className="serif mt-2 text-4xl font-semibold tracking-[-0.04em] text-ink">
            Birthday gift
          </h1>

          <p className="mt-3 leading-7 text-ink-soft">
            Add the words that make this feel like it
            could only have come from you.
          </p>
        </div>

        <div className="mt-8 grid gap-6">
          <label className="grid gap-2">
            <span className="text-sm font-bold text-ink">
              Who is it for?
            </span>

            <input
              value={personalization.recipient_name}
              onChange={(event) =>
                updateField(
                  "recipient_name",
                  event.target.value,
                )
              }
              maxLength={60}
              placeholder="Their name"
              className="rounded-2xl border border-line bg-cream px-4 py-3.5 text-ink outline-none transition placeholder:text-ink-muted focus:border-berry"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-bold text-ink">
              From
            </span>

            <input
              value={personalization.sender_name}
              onChange={(event) =>
                updateField(
                  "sender_name",
                  event.target.value,
                )
              }
              maxLength={60}
              placeholder="Your name"
              className="rounded-2xl border border-line bg-cream px-4 py-3.5 text-ink outline-none transition placeholder:text-ink-muted focus:border-berry"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-bold text-ink">
              Headline
            </span>

            <input
              value={personalization.headline}
              onChange={(event) =>
                updateField(
                  "headline",
                  event.target.value,
                )
              }
              maxLength={100}
              placeholder="Happy Birthday!"
              className="rounded-2xl border border-line bg-cream px-4 py-3.5 text-ink outline-none transition placeholder:text-ink-muted focus:border-berry"
            />
          </label>

          <label className="grid gap-2">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-bold text-ink">
                Your message
              </span>

              <span className="text-xs text-ink-muted">
                {personalization.message.length}/1000
              </span>
            </div>

            <textarea
              value={personalization.message}
              onChange={(event) =>
                updateField(
                  "message",
                  event.target.value,
                )
              }
              maxLength={1000}
              rows={7}
              placeholder="Write something they'll want to read twice..."
              className="resize-y rounded-2xl border border-line bg-cream px-4 py-3.5 leading-7 text-ink outline-none transition placeholder:text-ink-muted focus:border-berry"
            />
          </label>
        </div>

        <fieldset className="mt-8">
          <legend className="text-sm font-bold text-ink">
            Choose a mood
          </legend>

          <div className="mt-3 grid gap-3">
            {THEMES.map((option) => {
              const selected =
                option.key === theme;

              return (
                <label
                  key={option.key}
                  className={`cursor-pointer rounded-2xl border p-4 transition ${
                    selected
                      ? "border-berry bg-rose/10"
                      : "border-line bg-cream hover:border-rose"
                  }`}
                >
                  <input
                    type="radio"
                    name="theme"
                    value={option.key}
                    checked={selected}
                    onChange={() =>
                      updateTheme(option.key)
                    }
                    className="sr-only"
                  />

                  <span className="block font-bold text-ink">
                    {option.name}
                  </span>

                  <span className="mt-1 block text-sm leading-6 text-ink-soft">
                    {option.description}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="mt-7 border-t border-line pt-6">
          <div className="flex items-center gap-2">
            {saveState === "saved" ? (
              <Check
                className="size-4 text-berry"
                aria-hidden="true"
              />
            ) : saveState === "error" ? (
              <CircleAlert
                className="size-4 text-berry"
                aria-hidden="true"
              />
            ) : null}

            <p
              aria-live="polite"
              className={
                saveState === "error"
                  ? "text-sm text-berry"
                  : "text-sm text-ink-muted"
              }
            >
              {!complete
                ? "Complete the fields above to continue."
                : saveState === "saving"
                  ? "Saving your gift..."
                  : saveState === "saved"
                    ? "All changes saved."
                    : saveState === "error"
                      ? "We couldn't save your changes."
                      : "Your changes will save automatically."}
            </p>
          </div>

          {!complete ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {recipientMissing ? (
                <MissingField label="Recipient" />
              ) : null}

              {senderMissing ? (
                <MissingField label="From" />
              ) : null}

              {headlineMissing ? (
                <MissingField label="Headline" />
              ) : null}

              {messageMissing ? (
                <MissingField label="Message" />
              ) : null}
            </div>
          ) : null}

          <button
            type="button"
            disabled={!canContinue}
            onClick={() =>
              router.push(
                `/create/${draft.id}/review`,
              )
            }
            className="
              mt-6
              inline-flex w-full
              items-center justify-center
              gap-2
              rounded-full
              bg-berry
              px-6 py-3.5
              text-sm font-bold
              text-paper
              transition
              hover:-translate-y-0.5
              hover:shadow-lg
              disabled:cursor-not-allowed
              disabled:opacity-40
              disabled:hover:translate-y-0
              disabled:hover:shadow-none
            "
          >
            Continue to review

            <ArrowRight
              className="size-4"
              aria-hidden="true"
            />
          </button>
        </div>
      </section>

      <BirthdayPreview
        personalization={personalization}
        theme={theme}
      />
    </div>
  );
}

interface BirthdayPreviewProps {
  personalization: BirthdayPersonalization;
  theme: BirthdayTheme;
}

function BirthdayPreview({
  personalization,
  theme,
}: BirthdayPreviewProps) {
  const themeClass =
    theme === "midnight-gold"
      ? "bg-ink text-paper"
      : theme === "rose-celebration"
        ? "bg-rose/15 text-ink"
        : "bg-paper text-ink";

  return (
    <section className="lg:sticky lg:top-8">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink-muted">
          Live preview
        </p>

        <p className="text-xs text-ink-muted">
          Updates as you type
        </p>
      </div>

      <div
        className={`relative min-h-[620px] overflow-hidden rounded-[2.5rem_1.5rem_2.8rem_1.8rem] border border-line p-8 shadow-[var(--shadow-paper)] sm:p-12 ${themeClass}`}
      >
        <div
          aria-hidden="true"
          className="absolute -right-14 -top-14 size-48 rounded-full border border-current opacity-10"
        />

        <div
          aria-hidden="true"
          className="absolute -bottom-20 -left-16 size-64 rounded-full border border-current opacity-10"
        />

        <div className="relative flex min-h-[520px] flex-col">
          <p className="script text-3xl opacity-70">
            a little birthday magic
          </p>

          <div className="my-auto py-14 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-60">
              especially for
            </p>

            <h2 className="serif mt-4 text-5xl font-semibold tracking-[-0.05em] sm:text-6xl">
              {personalization.recipient_name ||
                "Someone special"}
            </h2>

            <h3 className="serif mx-auto mt-8 max-w-lg text-3xl leading-tight">
              {personalization.headline ||
                "Happy Birthday!"}
            </h3>

            <p className="mx-auto mt-7 max-w-lg whitespace-pre-wrap leading-8 opacity-80">
              {personalization.message ||
                "Your birthday message will appear here as you write it."}
            </p>
          </div>

          <div className="text-right">
            <p className="text-sm opacity-60">
              with love,
            </p>

            <p className="script mt-1 text-3xl">
              {personalization.sender_name ||
                "You"}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}