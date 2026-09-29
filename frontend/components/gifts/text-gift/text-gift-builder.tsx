"use client";

import {
  ArrowRight,
  Check,
  CircleAlert,
  Heart,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { updateDraft } from "@/lib/api/drafts";
import {
  generateLoveLetter,
  type LoveLetterLanguage,
  type LoveLetterLength,
  type LoveLetterTone,
} from "@/lib/api/love-letter";
import type { Draft } from "@/types/draft";

export type TextTemplateKey =
  | "proposal"
  | "apology"
  | "anniversary"
  | "love_letter"
  | "scrapbook"
  | "friendship"
  | "mothers_day";

type TextGiftPersonalization = {
  recipient_name: string;
  sender_name: string;
  headline: string;
  message: string;
};

type TextTemplateDefinition = {
  title: string;
  eyebrow: string;
  description: string;
  recipientLabel: string;
  senderLabel: string;
  headlineLabel: string;
  messageLabel: string;
  recipientPlaceholder: string;
  senderPlaceholder: string;
  headlinePlaceholder: string;
  messagePlaceholder: string;
  previewEyebrow: string;
  previewFallback: string;
  themes: Array<{
    key: string;
    name: string;
    description: string;
  }>;
};

export const TEXT_TEMPLATE_DEFINITIONS: Record<
  TextTemplateKey,
  TextTemplateDefinition
> = {
  proposal: {
    title: "The Big Question",
    eyebrow: "make the moment unforgettable",
    description: "Build a private little moment around the question that changes everything.",
    recipientLabel: "Who is the question for?",
    senderLabel: "From",
    headlineLabel: "Your question",
    messageLabel: "The words before it",
    recipientPlaceholder: "Their name",
    senderPlaceholder: "Your name",
    headlinePlaceholder: "Will you marry me?",
    messagePlaceholder: "Tell them what brought you to this moment...",
    previewEyebrow: "one question, a thousand feelings",
    previewFallback: "The question will appear here.",
    themes: [
      { key: "candlelight-question", name: "Candlelight Question", description: "Soft, cinematic and full of anticipation." },
      { key: "bold-question", name: "Bold Question", description: "A little more daring for a big feeling." },
      { key: "quiet-moment", name: "Quiet Moment", description: "Intimate paper and an honest heart." },
    ],
  },
  apology: {
    title: "Can We Start Again?",
    eyebrow: "say the difficult thing gently",
    description: "Make room for honesty, accountability and the hope of a softer next chapter.",
    recipientLabel: "Who are you writing to?",
    senderLabel: "From",
    headlineLabel: "The heart of it",
    messageLabel: "Your apology",
    recipientPlaceholder: "Their name",
    senderPlaceholder: "Your name",
    headlinePlaceholder: "I am sorry",
    messagePlaceholder: "Say what you mean, without rushing past it...",
    previewEyebrow: "a little room for honesty",
    previewFallback: "Your honest words will appear here.",
    themes: [
      { key: "soft-reset", name: "Soft Reset", description: "Warm paper for a gentle beginning." },
      { key: "honest-heart", name: "Honest Heart", description: "Simple, direct and quietly sincere." },
      { key: "fresh-start", name: "Fresh Start", description: "A hopeful mood for what comes next." },
    ],
  },
  anniversary: {
    title: "Still Us",
    eyebrow: "celebrate the chapters",
    description: "Gather the feeling of your shared history into a note made for the two of you.",
    recipientLabel: "Who is it for?",
    senderLabel: "From",
    headlineLabel: "Your chapter title",
    messageLabel: "Your anniversary message",
    recipientPlaceholder: "Their name",
    senderPlaceholder: "Your name",
    headlinePlaceholder: "Still choosing you",
    messagePlaceholder: "Remember the ordinary moments that became everything...",
    previewEyebrow: "another year of us",
    previewFallback: "Your shared story will appear here.",
    themes: [
      { key: "golden-chapters", name: "Golden Chapters", description: "Warm and celebratory with a keepsake feel." },
      { key: "rose-years", name: "Rose Years", description: "Soft romance for a love that keeps growing." },
      { key: "midnight-us", name: "Midnight Us", description: "A richer, more cinematic anniversary mood." },
    ],
  },
  love_letter: {
    title: "Dear You",
    eyebrow: "write what you usually leave unsaid",
    description: "Turn the things you feel every day into a letter they can return to whenever they need it.",
    recipientLabel: "Who is the letter for?",
    senderLabel: "Signed",
    headlineLabel: "A line to begin",
    messageLabel: "Your love letter",
    recipientPlaceholder: "Their name",
    senderPlaceholder: "Your name",
    headlinePlaceholder: "There is something I want you to know",
    messagePlaceholder: "Write the words that deserve more than a text message...",
    previewEyebrow: "dear you",
    previewFallback: "Your letter will unfold here.",
    themes: [
      { key: "ink-and-paper", name: "Ink and Paper", description: "Classic, intimate and handwritten in spirit." },
      { key: "late-night-letter", name: "Late Night Letter", description: "A quiet mood for the words that arrive after dark." },
      { key: "rose-envelope", name: "Rose Envelope", description: "Tender color for an openly romantic note." },
    ],
  },
  scrapbook: {
    title: "Little Book of Us",
    eyebrow: "make a keepsake from the little things",
    description: "Tell the story of your favorite ordinary moments, one page-sized memory at a time.",
    recipientLabel: "Who is it for?",
    senderLabel: "Made by",
    headlineLabel: "The book title",
    messageLabel: "Your memory note",
    recipientPlaceholder: "Their name",
    senderPlaceholder: "Your name",
    headlinePlaceholder: "The little book of us",
    messagePlaceholder: "Describe the moments you never want to forget...",
    previewEyebrow: "a few pages from our story",
    previewFallback: "Your keepsake note will appear here.",
    themes: [
      { key: "paper-memories", name: "Paper Memories", description: "Warm, tactile and made for nostalgia." },
      { key: "polaroid-days", name: "Polaroid Days", description: "Playful framing for your favorite snapshots." },
      { key: "keepsake-box", name: "Keepsake Box", description: "A gentle heirloom mood for meaningful memories." },
    ],
  },
  friendship: {
    title: "Glad It is You",
    eyebrow: "celebrate your favorite person to do nothing with",
    description: "Give the friend who always gets it a small, bright reminder of how much they mean.",
    recipientLabel: "Who is your person?",
    senderLabel: "From",
    headlineLabel: "The inside title",
    messageLabel: "Your friendship note",
    recipientPlaceholder: "Their name",
    senderPlaceholder: "Your name",
    headlinePlaceholder: "Life is better with you in it",
    messagePlaceholder: "Add the joke, memory or truth they need to hear...",
    previewEyebrow: "for my favorite kind of chaos",
    previewFallback: "Your friendship note will appear here.",
    themes: [
      { key: "sunny-chaos", name: "Sunny Chaos", description: "Bright, warm and impossible not to smile at." },
      { key: "inside-jokes", name: "Inside Jokes", description: "A playful mood for a friendship with history." },
      { key: "golden-hour", name: "Golden Hour", description: "Soft and grateful without getting too serious." },
    ],
  },
  mothers_day: {
    title: "For Mum, With Love",
    eyebrow: "make her feel held",
    description: "Gather the gratitude, memories and love that deserve more space than a quick message.",
    recipientLabel: "Who are you celebrating?",
    senderLabel: "With love from",
    headlineLabel: "Your opening line",
    messageLabel: "Your message for her",
    recipientPlaceholder: "Mum's name",
    senderPlaceholder: "Your name",
    headlinePlaceholder: "Everything good in me began with you",
    messagePlaceholder: "Tell her what you notice, remember and carry with you...",
    previewEyebrow: "for the woman who made a home of love",
    previewFallback: "Your message for her will appear here.",
    themes: [
      { key: "garden-love", name: "Garden Love", description: "Botanical warmth for a tender celebration." },
      { key: "soft-heirloom", name: "Soft Heirloom", description: "A gentle keepsake feeling with lasting warmth." },
      { key: "warm-kitchen", name: "Warm Kitchen", description: "Familiar, intimate and full of home." },
    ],
  },
};

function getDefinition(templateKey: TextTemplateKey) {
  return TEXT_TEMPLATE_DEFINITIONS[templateKey];
}

function getInitialPersonalization(
  draft: Draft,
): TextGiftPersonalization {
  const stored = draft.personalization;

  return {
    recipient_name: typeof stored.recipient_name === "string" ? stored.recipient_name : "",
    sender_name: typeof stored.sender_name === "string" ? stored.sender_name : "",
    headline: typeof stored.headline === "string" ? stored.headline : "",
    message: typeof stored.message === "string" ? stored.message : "",
  };
}

function isComplete(personalization: TextGiftPersonalization) {
  return Object.values(personalization).every(
    (value) => value.trim().length > 0,
  );
}

function isReadyToSave(
  personalization: TextGiftPersonalization,
  templateKey: TextTemplateKey,
) {
  if (!isComplete(personalization)) {
    return false;
  }

  return (
    templateKey !== "love_letter" ||
    personalization.message.trim().split(/\s+/).length >= 400
  );
}

export function TextGiftBuilder({
  draft,
  templateKey,
}: {
  draft: Draft;
  templateKey: TextTemplateKey;
}) {
  const router = useRouter();
  const definition = getDefinition(templateKey);
  const [personalization, setPersonalization] = useState(
    () => getInitialPersonalization(draft),
  );
  const [theme, setTheme] = useState(
    () => definition.themes.some((item) => item.key === draft.theme_key)
      ? draft.theme_key ?? definition.themes[0].key
      : definition.themes[0].key,
  );
  const [saveState, setSaveState] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [relationship, setRelationship] = useState("");
  const [memories, setMemories] = useState("");
  const [tone, setTone] = useState<LoveLetterTone>("tender");
  const [language, setLanguage] =
    useState<LoveLetterLanguage>("english");
  const [letterLength, setLetterLength] =
    useState<LoveLetterLength>("medium");
  const [generating, setGenerating] = useState(false);
  const [generationError, setGenerationError] = useState("");
  const [remainingRequests, setRemainingRequests] =
    useState<number | null>(null);
  const firstRender = useRef(true);
  const saveRequest = useRef(0);
  const complete = isReadyToSave(personalization, templateKey);

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

    return () => window.clearTimeout(timeout);
  }, [complete, draft.id, personalization, theme]);

  function updateField(
    field: keyof TextGiftPersonalization,
    value: string,
  ) {
    setPersonalization((current) => ({ ...current, [field]: value }));
    setSaveState("idle");
  }

  async function generateLetter() {
    if (
      templateKey !== "love_letter" ||
      !relationship.trim() ||
      !memories.trim() ||
      generating
    ) {
      return;
    }

    setGenerating(true);
    setGenerationError("");

    try {
      const generated = await generateLoveLetter(draft.id, {
        recipient_name: personalization.recipient_name,
        relationship: relationship.trim(),
        memories: memories.trim(),
        language,
        tone,
        length: letterLength,
      });

      setPersonalization((current) => ({
        ...current,
        headline: generated.headline,
        message: generated.message,
      }));
      setRemainingRequests(generated.remaining_requests);
      setSaveState("idle");
    } catch (error) {
      setGenerationError(
        error instanceof Error
          ? error.message
          : "Unable to generate your Love Letter.",
      );
    } finally {
      setGenerating(false);
    }
  }

  const previewClass = theme.includes("midnight") || theme === "inside-jokes"
    ? "bg-ink text-paper"
    : theme.includes("rose") || theme.includes("garden")
      ? "bg-rose/10 text-ink"
      : "bg-paper text-ink";

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
      <section className="rounded-[2rem_1.4rem_2.2rem_1.6rem] border border-line bg-paper p-6 shadow-[var(--shadow-paper)] sm:p-8">
        <p className="script text-2xl text-rose">{definition.eyebrow}</p>
        <h1 className="serif mt-2 text-4xl font-semibold tracking-[-0.04em] text-ink">
          {definition.title}
        </h1>
        <p className="mt-3 leading-7 text-ink-soft">{definition.description}</p>

        {templateKey === "love_letter" ? (
          <div className="mt-7 rounded-3xl border border-rose/20 bg-rose/5 p-5">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-1 size-5 shrink-0 text-rose" />
              <div>
                <h2 className="font-bold text-ink">Start with a few details</h2>
                <p className="mt-1 text-sm leading-6 text-ink-soft">
                  DuoCraft can draft a starting point. You can edit every word before checkout.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-4">
              <label className="grid gap-2">
                <span className="text-sm font-bold text-ink">Your relationship</span>
                <input
                  value={relationship}
                  onChange={(event) => setRelationship(event.target.value)}
                  maxLength={80}
                  placeholder="Partner, spouse, long-distance love..."
                  className="rounded-2xl border border-line bg-paper px-4 py-3 text-ink outline-none transition placeholder:text-ink-muted focus:border-berry"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-bold text-ink">Memories and details</span>
                <textarea
                  value={memories}
                  onChange={(event) => setMemories(event.target.value)}
                  maxLength={1200}
                  rows={4}
                  placeholder="A place, a small habit, the moment you knew..."
                  className="resize-y rounded-2xl border border-line bg-paper px-4 py-3 leading-7 text-ink outline-none transition placeholder:text-ink-muted focus:border-berry"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-sm font-bold text-ink">Tone</span>
                  <select
                    value={tone}
                    onChange={(event) => setTone(event.target.value as LoveLetterTone)}
                    className="rounded-2xl border border-line bg-paper px-4 py-3 text-ink outline-none focus:border-berry"
                  >
                    <option value="tender">Tender</option>
                    <option value="playful">Playful</option>
                    <option value="poetic">Poetic</option>
                    <option value="sincere">Sincere</option>
                  </select>
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-bold text-ink">Language</span>
                  <select
                    value={language}
                    onChange={(event) => setLanguage(event.target.value as LoveLetterLanguage)}
                    className="rounded-2xl border border-line bg-paper px-4 py-3 text-ink outline-none focus:border-berry"
                  >
                    <option value="english">English</option>
                    <option value="hindi">Hindi</option>
                  </select>
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-bold text-ink">Length</span>
                  <select
                    value={letterLength}
                    onChange={(event) => setLetterLength(event.target.value as LoveLetterLength)}
                    className="rounded-2xl border border-line bg-paper px-4 py-3 text-ink outline-none focus:border-berry"
                  >
                    <option value="short">400+ words</option>
                    <option value="medium">550+ words</option>
                    <option value="long">700+ words</option>
                  </select>
                </label>
              </div>

              <button
                type="button"
                onClick={() => void generateLetter()}
                disabled={generating || !relationship.trim() || !memories.trim()}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-berry px-5 py-3 text-sm font-bold text-paper transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Sparkles className="size-4" />
                {generating ? "Writing a starting point..." : "Generate a starting point"}
              </button>

              {remainingRequests !== null ? (
                <p className="text-xs text-ink-muted">
                  {remainingRequests} generation{remainingRequests === 1 ? "" : "s"} remaining this hour.
                </p>
              ) : null}

              {generationError ? (
                <p className="rounded-2xl border border-berry/20 bg-paper px-4 py-3 text-sm leading-6 text-berry" role="alert">
                  {generationError}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="mt-8 grid gap-6">
          <Field label={definition.recipientLabel} value={personalization.recipient_name} placeholder={definition.recipientPlaceholder} onChange={(value) => updateField("recipient_name", value)} />
          <Field label={definition.senderLabel} value={personalization.sender_name} placeholder={definition.senderPlaceholder} onChange={(value) => updateField("sender_name", value)} />
          <Field label={definition.headlineLabel} value={personalization.headline} placeholder={definition.headlinePlaceholder} onChange={(value) => updateField("headline", value)} />
          <label className="grid gap-2">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-bold text-ink">{definition.messageLabel}</span>
              <span className="text-xs text-ink-muted">{personalization.message.length}/8000</span>
            </div>
            <textarea
              value={personalization.message}
              onChange={(event) => updateField("message", event.target.value)}
              maxLength={templateKey === "love_letter" ? 8000 : 1000}
              rows={7}
              placeholder={definition.messagePlaceholder}
              className="resize-y rounded-2xl border border-line bg-cream px-4 py-3.5 leading-7 text-ink outline-none transition placeholder:text-ink-muted focus:border-berry"
            />
          </label>
        </div>

        <fieldset className="mt-8">
          <legend className="text-sm font-bold text-ink">Choose a mood</legend>
          <div className="mt-3 grid gap-3">
            {definition.themes.map((option) => (
              <label
                key={option.key}
                className={`cursor-pointer rounded-2xl border p-4 transition ${option.key === theme ? "border-berry bg-rose/10" : "border-line bg-cream hover:border-rose"}`}
              >
                <input
                  type="radio"
                  name={`${templateKey}-theme`}
                  value={option.key}
                  checked={option.key === theme}
                  onChange={() => {
                    setTheme(option.key);
                    setSaveState("idle");
                  }}
                  className="sr-only"
                />
                <span className="block font-bold text-ink">{option.name}</span>
                <span className="mt-1 block text-sm leading-6 text-ink-soft">{option.description}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-7 border-t border-line pt-6">
          <div className="flex items-center gap-2">
            {saveState === "saved" ? <Check className="size-4 text-berry" /> : saveState === "error" ? <CircleAlert className="size-4 text-berry" /> : null}
            <p aria-live="polite" className={saveState === "error" ? "text-sm text-berry" : "text-sm text-ink-muted"}>
              {!complete ? "Complete the fields above to continue." : saveState === "saving" ? "Saving your gift..." : saveState === "saved" ? "All changes saved." : saveState === "error" ? "We couldn't save your changes." : "Your changes will save automatically."}
            </p>
          </div>
          <button
            type="button"
            disabled={!complete || saveState !== "saved"}
            onClick={() => router.push(`/create/${draft.id}/review`)}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-berry px-6 py-3.5 text-sm font-bold text-paper transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-40"
          >
            Continue to review
            <ArrowRight className="size-4" />
          </button>
        </div>
      </section>

      <section className="lg:sticky lg:top-8">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink-muted">Live preview</p>
          <p className="text-xs text-ink-muted">Updates as you type</p>
        </div>
        <div className={`relative min-h-[620px] overflow-hidden rounded-[2.5rem_1.5rem_2.8rem_1.8rem] border border-line p-8 shadow-[var(--shadow-paper)] sm:p-12 ${previewClass}`}>
          <Heart className="absolute right-8 top-8 size-9 text-rose opacity-40" />
          <div className="relative flex min-h-[520px] flex-col">
            <p className="script text-3xl text-rose">{definition.previewEyebrow}</p>
            <div className="my-auto py-14 text-center">
              <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-60">especially for</p>
              <h2 className="serif mt-4 text-5xl font-semibold tracking-[-0.05em] sm:text-6xl">{personalization.recipient_name || "Someone special"}</h2>
              <Sparkles className="mx-auto mt-7 size-6 text-rose opacity-60" />
              <h3 className="serif mx-auto mt-6 max-w-lg text-3xl leading-tight">{personalization.headline || definition.previewFallback}</h3>
              <p className="mx-auto mt-7 max-w-lg whitespace-pre-wrap leading-8 opacity-80">{personalization.message || definition.previewFallback}</p>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-60">with love,</p>
              <p className="script mt-1 text-3xl">{personalization.sender_name || "You"}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Field({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-bold text-ink">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        maxLength={100}
        placeholder={placeholder}
        className="rounded-2xl border border-line bg-cream px-4 py-3.5 text-ink outline-none transition placeholder:text-ink-muted focus:border-berry"
      />
    </label>
  );
}