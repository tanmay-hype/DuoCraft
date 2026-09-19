"use client";

import {
  ArrowRight,
  Check,
  CircleAlert,
  Flower2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { updateDraft } from "@/lib/api/drafts";
import type {
  Draft,
  ThankYouPersonalization,
  ThankYouTheme,
} from "@/types/draft";

interface ThankYouBuilderProps {
  draft: Draft;
}

const THEMES: Array<{
  key: ThankYouTheme;
  name: string;
  description: string;
}> = [
  {
    key: "pressed-flowers",
    name: "Pressed Flowers",
    description: "Soft florals with a keepsake-card feeling.",
  },
  {
    key: "warm-paper",
    name: "Warm Paper",
    description: "Simple, intimate and quietly handwritten.",
  },
  {
    key: "garden-note",
    name: "Garden Note",
    description: "Fresh botanical details with a gentle mood.",
  },
];

function getInitialPersonalization(
  draft: Draft,
): ThankYouPersonalization {
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
        : "Thank you, truly.",
    message:
      typeof stored.message === "string"
        ? stored.message
        : "",
  };
}

function getInitialTheme(
  draft: Draft,
): ThankYouTheme {
  if (
    draft.theme_key === "pressed-flowers" ||
    draft.theme_key === "warm-paper" ||
    draft.theme_key === "garden-note"
  ) {
    return draft.theme_key;
  }

  return "pressed-flowers";
}

function isComplete(
  personalization: ThankYouPersonalization,
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

export function ThankYouBuilder({
  draft,
}: ThankYouBuilderProps) {
  const router = useRouter();

  const [personalization, setPersonalization] =
    useState<ThankYouPersonalization>(() =>
      getInitialPersonalization(draft),
    );

  const [theme, setTheme] = useState<ThankYouTheme>(() =>
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
    field: keyof ThankYouPersonalization,
    value: string,
  ) {
    setPersonalization((current) => ({
      ...current,
      [field]: value,
    }));

    setSaveState("idle");
  }

  function updateTheme(
    nextTheme: ThankYouTheme,
  ) {
    setTheme(nextTheme);
    setSaveState("idle");
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
      <section className="rounded-[2rem_1.4rem_2.2rem_1.6rem] border border-line bg-paper p-6 shadow-[var(--shadow-paper)] sm:p-8">
        <div>
          <p className="script text-2xl text-rose">
            say it beautifully
          </p>

          <h1 className="serif mt-2 text-4xl font-semibold tracking-[-0.04em] text-ink">
            Thank You gift
          </h1>

          <p className="mt-3 leading-7 text-ink-soft">
            Turn a simple thank you into something they can
            keep and come back to.
          </p>
        </div>

        <div className="mt-8 grid gap-6">
          <label className="grid gap-2">
            <span className="text-sm font-bold text-ink">
              Who are you thanking?
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
              placeholder="Thank you, truly."
              className="rounded-2xl border border-line bg-cream px-4 py-3.5 text-ink outline-none transition placeholder:text-ink-muted focus:border-berry"
            />
          </label>

          <label className="grid gap-2">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-bold text-ink">
                What do you want to thank them for?
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
              placeholder="Tell them what their kindness meant to you..."
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
              const selected = option.key === theme;

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

      <ThankYouPreview
        personalization={personalization}
        theme={theme}
      />
    </div>
  );
}

interface ThankYouPreviewProps {
  personalization: ThankYouPersonalization;
  theme: ThankYouTheme;
}

function ThankYouPreview({
  personalization,
  theme,
}: ThankYouPreviewProps) {
  const themeClass =
    theme === "garden-note"
      ? "bg-rose/10 text-ink"
      : theme === "warm-paper"
        ? "bg-cream text-ink"
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
        className={`relative min-h-[620px] overflow-hidden rounded-[1.8rem_2.7rem_1.7rem_2.4rem] border border-line p-8 shadow-[var(--shadow-paper)] sm:p-12 ${themeClass}`}
      >
        <Flower2
          aria-hidden="true"
          strokeWidth={1.2}
          className="absolute right-8 top-8 size-16 text-rose opacity-30"
        />

        <Flower2
          aria-hidden="true"
          strokeWidth={1.2}
          className="absolute -bottom-3 -left-3 size-24 rotate-12 text-rose opacity-20"
        />

        <div className="relative flex min-h-[520px] flex-col">
          <p className="script text-3xl text-rose">
            with a grateful heart
          </p>

          <div className="my-auto py-14">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-ink-muted">
              dear
            </p>

            <h2 className="serif mt-3 text-5xl font-semibold tracking-[-0.05em]">
              {personalization.recipient_name ||
                "Someone wonderful"}
            </h2>

            <h3 className="serif mt-9 max-w-lg text-3xl leading-tight">
              {personalization.headline ||
                "Thank you, truly."}
            </h3>

            <p className="mt-7 max-w-lg whitespace-pre-wrap leading-8 text-ink-soft">
              {personalization.message ||
                "Your thank-you message will appear here as you write it."}
            </p>
          </div>

          <div>
            <p className="text-sm text-ink-muted">
              gratefully,
            </p>

            <p className="script mt-1 text-3xl">
              {personalization.sender_name || "You"}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
