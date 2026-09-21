"use client";

import {
  ArrowLeft,
  Check,
  Flower2,
  ImageIcon,
  LockKeyhole,
  Puzzle,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { PhotoPuzzleBoard } from "@/components/gifts/photo-puzzle/photo-puzzle-board";
import { getDraft } from "@/lib/api/drafts";
import {
  getDraftPhotos,
  getPhotoViewUrl,
  type PhotoAsset,
} from "@/lib/api/photos";
import type {
  BirthdayPersonalization,
  Draft,
  PhotoPuzzlePersonalization,
  ThankYouPersonalization,
} from "@/types/draft";

type TextReviewPersonalization =
  | BirthdayPersonalization
  | ThankYouPersonalization;

function getTextPersonalization(
  draft: Draft,
): TextReviewPersonalization {
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

function getPhotoPuzzlePersonalization(
  draft: Draft,
): PhotoPuzzlePersonalization {
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
    message:
      typeof stored.message === "string"
        ? stored.message
        : "",
    photo_asset_id:
      typeof stored.photo_asset_id === "string"
        ? stored.photo_asset_id
        : null,
  };
}

function isTextPersonalizationComplete(
  personalization: TextReviewPersonalization,
): boolean {
  return (
    personalization.recipient_name.trim().length > 0 &&
    personalization.sender_name.trim().length > 0 &&
    personalization.headline.trim().length > 0 &&
    personalization.message.trim().length > 0
  );
}

function isPhotoPuzzleComplete(
  personalization: PhotoPuzzlePersonalization,
): boolean {
  return (
    personalization.recipient_name.trim().length > 0 &&
    personalization.sender_name.trim().length > 0 &&
    personalization.message.trim().length > 0 &&
    personalization.photo_asset_id !== null
  );
}

export default function ReviewGiftPage() {
  const params = useParams<{ draftId: string }>();
  const draftId = params.draftId;

  const [draft, setDraft] = useState<Draft | null>(null);
  const [photo, setPhoto] = useState<PhotoAsset | null>(null);
  const [photoViewUrl, setPhotoViewUrl] =
    useState<string | null>(null);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadDraft() {
      try {
        const loadedDraft = await getDraft(draftId);

        if (!active) {
          return;
        }

        setDraft(loadedDraft);

        if (loadedDraft.template_key === "photo_puzzle") {
          const personalization =
            getPhotoPuzzlePersonalization(loadedDraft);

          setPhotoLoading(true);
          setPhotoError("");

          const photos = await getDraftPhotos(draftId);

          if (!active) {
            return;
          }

          const selectedPhoto =
            photos.find(
              (asset) =>
                asset.id ===
                  personalization.photo_asset_id &&
                asset.status === "uploaded",
            ) ?? null;

          setPhoto(selectedPhoto);

          if (!selectedPhoto) {
            setPhotoViewUrl(null);
            setPhotoError(
              "The uploaded photo could not be found.",
            );
            setPhotoLoading(false);
            return;
          }

          try {
            const result = await getPhotoViewUrl(
              draftId,
              selectedPhoto.id,
            );

            if (!active) {
              return;
            }

            setPhotoViewUrl(result.view_url);
          } catch (caughtError) {
            if (!active) {
              return;
            }

            setPhotoViewUrl(null);
            setPhotoError(
              caughtError instanceof Error
                ? caughtError.message
                : "Unable to load the photo preview.",
            );
          } finally {
            if (active) {
              setPhotoLoading(false);
            }
          }
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
          <StatusCard
            script="something went missing"
            title="We couldn't open this gift."
            description={
              error ||
              "This draft may have expired or belongs to another browser."
            }
          />
        </div>
      </main>
    );
  }

  const supportedTemplate =
    draft.template_key === "birthday" ||
    draft.template_key === "thank_you" ||
    draft.template_key === "photo_puzzle";

  if (!supportedTemplate) {
    return (
      <main className="min-h-screen bg-cream">
        <div className="page-shell py-24">
          <StatusCard
            script="almost ready"
            title="Review is not available for this gift yet."
            description="Birthday, Thank You, and Photo Puzzle review are available while the remaining templates are being added."
            draftId={draft.id}
            actionLabel="Back to editor"
          />
        </div>
      </main>
    );
  }

  if (draft.template_key === "photo_puzzle") {
    const personalization =
      getPhotoPuzzlePersonalization(draft);

    const complete =
      isPhotoPuzzleComplete(personalization) &&
      photo !== null &&
      photo.status === "uploaded";

    if (!complete) {
      return (
        <main className="min-h-screen bg-cream">
          <div className="page-shell py-24">
            <StatusCard
              script="one little thing"
              title="Your Photo Puzzle isn't complete yet."
              description="Add the required words and make sure your photo has finished uploading before reviewing your gift."
              draftId={draft.id}
              actionLabel="Finish personalizing"
            />
          </div>
        </main>
      );
    }

    return (
      <ReviewLayout
        draft={draft}
        giftName="Photo Puzzle"
        heading="Ready to piece together the surprise?"
        personalization={personalization}
      >
        <PhotoPuzzleReviewPreview
          personalization={personalization}
          photo={photo}
          photoViewUrl={photoViewUrl}
          photoLoading={photoLoading}
          photoError={photoError}
        />
      </ReviewLayout>
    );
  }

  const personalization = getTextPersonalization(draft);

  const complete =
    isTextPersonalizationComplete(personalization);

  if (!complete) {
    return (
      <main className="min-h-screen bg-cream">
        <div className="page-shell py-24">
          <StatusCard
            script="one little thing"
            title="Your gift needs a few more words."
            description="Finish all the required fields before reviewing your gift."
            draftId={draft.id}
            actionLabel="Finish personalizing"
          />
        </div>
      </main>
    );
  }

  if (draft.template_key === "birthday") {
    return (
      <ReviewLayout
        draft={draft}
        giftName="Birthday Gift"
        heading="Ready to make their day?"
        personalization={personalization}
      >
        <BirthdayReviewPreview
          personalization={personalization}
        />
      </ReviewLayout>
    );
  }

  return (
    <ReviewLayout
      draft={draft}
      giftName="Thank You Gift"
      heading="Ready to send some gratitude?"
      personalization={personalization}
    >
      <ThankYouReviewPreview
        personalization={personalization}
      />
    </ReviewLayout>
  );
}

function ReviewLayout({
  draft,
  giftName,
  heading,
  personalization,
  children,
}: {
  draft: Draft;
  giftName: string;
  heading: string;
  personalization:
    | TextReviewPersonalization
    | PhotoPuzzlePersonalization;
  children: React.ReactNode;
}) {
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
              {heading}
            </h1>

            <p className="mx-auto mt-5 max-w-xl leading-7 text-ink-soft">
              Check the details below. You can still go back
              and change anything.
            </p>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            {children}

            <aside className="rounded-[2rem] border border-line bg-paper p-7 shadow-[var(--shadow-paper)]">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-rose">
                Your gift
              </p>

              <h2 className="serif mt-3 text-3xl font-semibold text-ink">
                {giftName}
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
                  value={formatTheme(
                    draft.template_key,
                    draft.theme_key,
                  )}
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

function BirthdayReviewPreview({
  personalization,
}: {
  personalization: TextReviewPersonalization;
}) {
  return (
    <section className="relative overflow-hidden rounded-[2.5rem_1.6rem_2.8rem_1.8rem] border border-line bg-paper p-8 shadow-[var(--shadow-paper)] sm:p-12">
      <Sparkles
        className="absolute right-8 top-8 size-6 text-rose opacity-60"
        strokeWidth={1.5}
        aria-hidden="true"
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
  );
}

function ThankYouReviewPreview({
  personalization,
}: {
  personalization: TextReviewPersonalization;
}) {
  return (
    <section className="relative overflow-hidden rounded-[1.8rem_2.7rem_1.7rem_2.4rem] border border-line bg-paper p-8 shadow-[var(--shadow-paper)] sm:p-12">
      <Flower2
        className="absolute right-8 top-8 size-16 text-rose opacity-30"
        strokeWidth={1.2}
        aria-hidden="true"
      />

      <Flower2
        className="absolute -bottom-3 -left-3 size-24 rotate-12 text-rose opacity-20"
        strokeWidth={1.2}
        aria-hidden="true"
      />

      <p className="script text-3xl text-rose">
        with a grateful heart
      </p>

      <div className="py-16">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-ink-muted">
          dear
        </p>

        <h2 className="serif mt-3 text-5xl font-semibold tracking-[-0.05em] text-ink">
          {personalization.recipient_name}
        </h2>

        <h3 className="serif mt-9 max-w-lg text-3xl leading-tight text-ink">
          {personalization.headline}
        </h3>

        <p className="mt-7 max-w-lg whitespace-pre-wrap leading-8 text-ink-soft">
          {personalization.message}
        </p>
      </div>

      <div>
        <p className="text-sm text-ink-muted">
          gratefully,
        </p>

        <p className="script mt-1 text-3xl text-ink">
          {personalization.sender_name}
        </p>
      </div>
    </section>
  );
}

function PhotoPuzzleReviewPreview({
  personalization,
  photo,
  photoViewUrl,
  photoLoading,
  photoError,
}: {
  personalization: PhotoPuzzlePersonalization;
  photo: PhotoAsset;
  photoViewUrl: string | null;
  photoLoading: boolean;
  photoError: string;
}) {
  return (
    <section className="relative overflow-hidden rounded-[2.3rem_1.5rem_2.5rem_1.8rem] border border-line bg-paper p-8 shadow-[var(--shadow-paper)] sm:p-12">
      <Puzzle
        className="absolute right-8 top-8 size-16 rotate-12 text-rose opacity-25"
        strokeWidth={1.2}
        aria-hidden="true"
      />

      <p className="script text-3xl text-rose">
        piece by piece
      </p>

      <div className="py-10">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-ink-muted">
          a memory for
        </p>

        <h2 className="serif mt-3 text-5xl font-semibold tracking-[-0.05em] text-ink">
          {personalization.recipient_name}
        </h2>

        <div className="mt-8">
          {photoLoading ? (
            <div className="flex aspect-square w-full items-center justify-center rounded-[1.75rem] border border-dashed border-line bg-cream p-8 text-center">
              <div>
                <ImageIcon className="mx-auto size-10 animate-pulse text-rose/60" />

                <p className="mt-4 font-bold text-ink">
                  Preparing your puzzle...
                </p>

                <p className="mt-2 text-sm leading-6 text-ink-soft">
                  Loading your private photo preview.
                </p>
              </div>
            </div>
          ) : photoViewUrl ? (
            <div className="rounded-[1.75rem] bg-cream p-4 sm:p-5">
              <PhotoPuzzleBoard
                imageUrl={photoViewUrl}
                recipientName={
                  personalization.recipient_name
                }
                interactive
              />
            </div>
          ) : (
            <div className="flex min-h-56 items-center justify-center rounded-[1.75rem] border border-dashed border-rose/40 bg-cream p-8 text-center">
              <div>
                <ImageIcon className="mx-auto size-10 text-rose" />

                <p className="mt-4 font-bold text-ink">
                  Your photo is uploaded
                </p>

                <p className="mt-2 text-sm leading-6 text-ink-soft">
                  We couldn&apos;t load the private preview yet.
                </p>

                {photoError ? (
                  <p className="mt-3 text-xs leading-5 text-berry">
                    {photoError}
                  </p>
                ) : null}
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 border-t border-line pt-7">
          <p className="whitespace-pre-wrap leading-8 text-ink-soft">
            {personalization.message}
          </p>
        </div>
      </div>

      <div>
        <p className="text-sm text-ink-muted">
          made for you by,
        </p>

        <p className="script mt-1 text-3xl text-ink">
          {personalization.sender_name}
        </p>
      </div>

      <div className="mt-7 flex items-center gap-2 rounded-2xl bg-rose/10 px-4 py-3 text-xs font-medium text-ink-soft">
        <Check className="size-4 text-rose" />
        <span>
          {photo.original_filename} · photo upload verified
        </span>
      </div>
    </section>
  );
}

function StatusCard({
  script,
  title,
  description,
  draftId,
  actionLabel,
}: {
  script: string;
  title: string;
  description: string;
  draftId?: string;
  actionLabel?: string;
}) {
  return (
    <div className="mx-auto max-w-xl rounded-[2rem] border border-line bg-paper p-8 text-center shadow-[var(--shadow-paper)]">
      <p className="script text-3xl text-rose">
        {script}
      </p>

      <h1 className="serif mt-3 text-4xl font-semibold text-ink">
        {title}
      </h1>

      <p className="mt-4 leading-7 text-ink-soft">
        {description}
      </p>

      {draftId && actionLabel ? (
        <Link
          href={`/create/${draftId}`}
          className="mt-7 inline-flex items-center gap-2 rounded-full bg-berry px-6 py-3 text-sm font-bold text-paper transition hover:-translate-y-0.5"
        >
          <ArrowLeft className="size-4" />
          {actionLabel}
        </Link>
      ) : null}
    </div>
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
  templateKey: string,
  theme: string | null,
): string {
  if (templateKey === "birthday") {
    switch (theme) {
      case "rose-celebration":
        return "Rose Celebration";

      case "midnight-gold":
        return "Midnight Gold";

      default:
        return "Warm Confetti";
    }
  }

  if (templateKey === "thank_you") {
    switch (theme) {
      case "warm-paper":
        return "Warm Paper";

      case "garden-note":
        return "Garden Note";

      default:
        return "Pressed Flowers";
    }
  }

  if (templateKey === "photo_puzzle") {
    switch (theme) {
      case "romantic-pieces":
        return "Romantic Pieces";

      case "playful-pieces":
        return "Playful Pieces";

      default:
        return "Classic Pieces";
    }
  }

  return "Default";
}