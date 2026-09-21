"use client";

import {
  Check,
  ChevronRight,
  ImageIcon,
  Puzzle,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { PhotoUploader } from "@/components/create/photo-uploader";
import { getDraftPhotos, type PhotoAsset } from "@/lib/api/photos";
import { updateDraft } from "@/lib/api/drafts";
import type {
  Draft,
  PhotoPuzzlePersonalization,
  PhotoPuzzleTheme,
} from "@/types/draft";

type PhotoPuzzleBuilderProps = {
  draft: Draft;
};

type SaveState = "idle" | "saving" | "saved" | "error";

const themes: Array<{
  key: PhotoPuzzleTheme;
  name: string;
  description: string;
}> = [
  {
    key: "classic-pieces",
    name: "Classic Pieces",
    description: "Warm paper with a timeless puzzle feel.",
  },
  {
    key: "romantic-pieces",
    name: "Romantic Pieces",
    description: "Soft rose details for a sweeter reveal.",
  },
  {
    key: "playful-pieces",
    name: "Playful Pieces",
    description: "Cheerful details with a lighter personality.",
  },
];

const emptyPersonalization: PhotoPuzzlePersonalization = {
  recipient_name: "",
  sender_name: "",
  message: "",
  photo_asset_id: null,
};

function readPersonalization(
  draft: Draft,
): PhotoPuzzlePersonalization {
  const source = draft.personalization;

  return {
    recipient_name:
      typeof source.recipient_name === "string"
        ? source.recipient_name
        : "",
    sender_name:
      typeof source.sender_name === "string"
        ? source.sender_name
        : "",
    message:
      typeof source.message === "string" ? source.message : "",
    photo_asset_id:
      typeof source.photo_asset_id === "string"
        ? source.photo_asset_id
        : null,
  };
}

export function PhotoPuzzleBuilder({
  draft,
}: PhotoPuzzleBuilderProps) {
  const router = useRouter();

  const [personalization, setPersonalization] =
    useState<PhotoPuzzlePersonalization>(() => {
      const loaded = readPersonalization(draft);

      return {
        ...emptyPersonalization,
        ...loaded,
      };
    });

  const [theme, setTheme] = useState<PhotoPuzzleTheme>(() => {
    const currentTheme = draft.theme_key;

    if (
      currentTheme === "classic-pieces" ||
      currentTheme === "romantic-pieces" ||
      currentTheme === "playful-pieces"
    ) {
      return currentTheme;
    }

    return "classic-pieces";
  });

  const [uploadedPhoto, setUploadedPhoto] =
    useState<PhotoAsset | null>(null);
  const [photosLoading, setPhotosLoading] = useState(true);
  const [saveState, setSaveState] =
    useState<SaveState>("idle");
  const [saveError, setSaveError] = useState("");

  const firstSave = useRef(true);

  useEffect(() => {
    let active = true;

    async function loadPhotos() {
      try {
        const photos = await getDraftPhotos(draft.id);

        if (!active) {
          return;
        }

        const selectedPhoto =
          photos.find(
            (photo) =>
              photo.id === personalization.photo_asset_id &&
              photo.status === "uploaded",
          ) ??
          photos.find((photo) => photo.status === "uploaded") ??
          null;

        setUploadedPhoto(selectedPhoto);

        if (
          selectedPhoto &&
          personalization.photo_asset_id !== selectedPhoto.id
        ) {
          setPersonalization((current) => ({
            ...current,
            photo_asset_id: selectedPhoto.id,
          }));
        }
      } catch {
        if (active) {
          setUploadedPhoto(null);
        }
      } finally {
        if (active) {
          setPhotosLoading(false);
        }
      }
    }

    void loadPhotos();

    return () => {
      active = false;
    };
  }, [draft.id, personalization.photo_asset_id]);

  useEffect(() => {
    if (firstSave.current) {
      firstSave.current = false;
      return;
    }

    setSaveState("saving");
    setSaveError("");

    const timeout = window.setTimeout(async () => {
      try {
        await updateDraft(draft.id, {
          personalization: {
            recipient_name: personalization.recipient_name,
            sender_name: personalization.sender_name,
            message: personalization.message,
            photo_asset_id: personalization.photo_asset_id,
          },
          theme_key: theme,
        });

        setSaveState("saved");
      } catch (error) {
        setSaveState("error");
        setSaveError(
          error instanceof Error
            ? error.message
            : "Unable to save your changes.",
        );
      }
    }, 700);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [draft.id, personalization, theme]);

  const complete = useMemo(
    () =>
      personalization.recipient_name.trim().length > 0 &&
      personalization.sender_name.trim().length > 0 &&
      personalization.message.trim().length > 0 &&
      personalization.photo_asset_id !== null &&
      uploadedPhoto?.status === "uploaded",
    [personalization, uploadedPhoto],
  );

  function updateField(
    field: "recipient_name" | "sender_name" | "message",
    value: string,
  ) {
    setPersonalization((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handlePhotoUploaded(photo: PhotoAsset) {
    setUploadedPhoto(photo);

    setPersonalization((current) => ({
      ...current,
      photo_asset_id: photo.id,
    }));
  }

  async function continueToReview() {
    if (!complete || saveState === "saving") {
      return;
    }

    try {
      setSaveState("saving");

      await updateDraft(draft.id, {
        personalization: {
          recipient_name: personalization.recipient_name,
          sender_name: personalization.sender_name,
          message: personalization.message,
          photo_asset_id: personalization.photo_asset_id,
        },
        theme_key: theme,
      });

      setSaveState("saved");
      router.push(`/create/${draft.id}/review`);
    } catch (error) {
      setSaveState("error");
      setSaveError(
        error instanceof Error
          ? error.message
          : "Unable to save your changes.",
      );
    }
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="script text-3xl text-rose">
            turn a memory into a little mystery
          </p>

          <h1 className="serif mt-2 text-4xl font-semibold text-ink sm:text-5xl">
            Create your Photo Puzzle
          </h1>

          <p className="mt-3 max-w-2xl leading-7 text-ink-soft">
            Add a favorite photo, write a note, and turn the
            memory into a playful digital reveal.
          </p>
        </div>

        <div className="text-sm text-ink-soft">
          {saveState === "saving" && "Saving..."}

          {saveState === "saved" && (
            <span className="inline-flex items-center gap-2">
              <Check className="h-4 w-4" />
              Saved
            </span>
          )}

          {saveState === "error" && (
            <span className="text-berry">Save failed</span>
          )}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.8fr)]">
        <section className="space-y-6">
          <div className="rounded-[2rem] border border-line bg-paper p-6 shadow-[var(--shadow-paper)] sm:p-8">
            <div className="mb-6 flex items-start gap-3">
              <div className="rounded-2xl bg-rose/10 p-3 text-rose">
                <ImageIcon className="h-5 w-5" />
              </div>

              <div>
                <h2 className="serif text-2xl font-semibold text-ink">
                  Choose the memory
                </h2>

                <p className="mt-1 text-sm leading-6 text-ink-soft">
                  Use a clear JPG, PNG, or WebP image up to
                  10 MB.
                </p>
              </div>
            </div>

            {photosLoading ? (
              <div className="rounded-[1.5rem] border border-dashed border-line p-8 text-center text-sm text-ink-soft">
                Looking for your uploaded photo...
              </div>
            ) : (
              <PhotoUploader
                draftId={draft.id}
                label={
                  uploadedPhoto
                    ? "Replace your photo"
                    : "Upload your photo"
                }
                helperText="This will become the image behind your puzzle."
                onUploaded={handlePhotoUploaded}
              />
            )}

            {uploadedPhoto && (
              <div className="mt-4 flex items-center gap-2 rounded-2xl bg-rose/10 px-4 py-3 text-sm text-ink">
                <Check className="h-4 w-4 text-rose" />
                Photo uploaded and attached to this draft.
              </div>
            )}
          </div>

          <div className="rounded-[2rem] border border-line bg-paper p-6 shadow-[var(--shadow-paper)] sm:p-8">
            <div className="mb-6 flex items-start gap-3">
              <div className="rounded-2xl bg-rose/10 p-3 text-rose">
                <Sparkles className="h-5 w-5" />
              </div>

              <div>
                <h2 className="serif text-2xl font-semibold text-ink">
                  Add your words
                </h2>

                <p className="mt-1 text-sm leading-6 text-ink-soft">
                  These appear around the puzzle experience.
                </p>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-ink">
                  For
                </span>

                <input
                  type="text"
                  maxLength={60}
                  value={personalization.recipient_name}
                  onChange={(event) =>
                    updateField(
                      "recipient_name",
                      event.target.value,
                    )
                  }
                  placeholder="Recipient's name"
                  className="w-full rounded-2xl border border-line bg-cream px-4 py-3 text-ink outline-none transition focus:border-rose"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-ink">
                  From
                </span>

                <input
                  type="text"
                  maxLength={60}
                  value={personalization.sender_name}
                  onChange={(event) =>
                    updateField(
                      "sender_name",
                      event.target.value,
                    )
                  }
                  placeholder="Your name"
                  className="w-full rounded-2xl border border-line bg-cream px-4 py-3 text-ink outline-none transition focus:border-rose"
                />
              </label>
            </div>

            <label className="mt-5 block">
              <span className="mb-2 block text-sm font-medium text-ink">
                Your message
              </span>

              <textarea
                rows={5}
                maxLength={500}
                value={personalization.message}
                onChange={(event) =>
                  updateField("message", event.target.value)
                }
                placeholder="A little note they'll see with the puzzle..."
                className="w-full resize-none rounded-2xl border border-line bg-cream px-4 py-3 text-ink outline-none transition focus:border-rose"
              />

              <span className="mt-2 block text-right text-xs text-ink-soft">
                {personalization.message.length}/500
              </span>
            </label>
          </div>

          <div className="rounded-[2rem] border border-line bg-paper p-6 shadow-[var(--shadow-paper)] sm:p-8">
            <h2 className="serif text-2xl font-semibold text-ink">
              Pick a puzzle style
            </h2>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {themes.map((option) => {
                const selected = theme === option.key;

                return (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setTheme(option.key)}
                    className={`rounded-2xl border p-4 text-left transition ${
                      selected
                        ? "border-rose bg-rose/10"
                        : "border-line bg-cream hover:border-rose/50"
                    }`}
                  >
                    <span className="font-medium text-ink">
                      {option.name}
                    </span>

                    <span className="mt-1 block text-xs leading-5 text-ink-soft">
                      {option.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {saveError && (
            <p className="rounded-2xl border border-berry/20 bg-berry/5 px-4 py-3 text-sm text-berry">
              {saveError}
            </p>
          )}

          <button
            type="button"
            disabled={!complete || saveState === "saving"}
            onClick={() => void continueToReview()}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-berry px-6 py-4 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
          >
            Continue to review
            <ChevronRight className="h-4 w-4" />
          </button>

          {!complete && (
            <p className="text-sm text-ink-soft">
              Add the recipient, sender, message, and an
              uploaded photo to continue.
            </p>
          )}
        </section>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="overflow-hidden rounded-[2rem] border border-line bg-paper shadow-[var(--shadow-paper)]">
            <div className="border-b border-line px-6 py-4">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-soft">
                Live preview
              </span>
            </div>

            <div className="p-6 sm:p-8">
              <div
                className={`relative min-h-[520px] overflow-hidden rounded-[1.75rem] border border-line p-7 ${
                  theme === "romantic-pieces"
                    ? "bg-rose/10"
                    : theme === "playful-pieces"
                      ? "bg-champagne/30"
                      : "bg-cream"
                }`}
              >
                <div className="absolute right-5 top-5 rotate-12 text-rose/30">
                  <Puzzle className="h-14 w-14" />
                </div>

                <div className="relative flex min-h-[460px] flex-col">
                  <p className="script text-3xl text-rose">
                    a memory for
                  </p>

                  <h2 className="serif mt-1 max-w-[80%] text-4xl font-semibold text-ink">
                    {personalization.recipient_name ||
                      "someone special"}
                  </h2>

                  <div className="my-8 flex min-h-52 flex-1 items-center justify-center rounded-[1.5rem] border border-dashed border-rose/40 bg-paper/60 p-6 text-center">
                    {uploadedPhoto ? (
                      <div>
                        <Puzzle className="mx-auto h-12 w-12 text-rose" />

                        <p className="mt-3 font-medium text-ink">
                          Your photo is ready to become a
                          puzzle.
                        </p>

                        <p className="mt-1 text-xs text-ink-soft">
                          {
                            uploadedPhoto.original_filename
                          }
                        </p>
                      </div>
                    ) : (
                      <div>
                        <ImageIcon className="mx-auto h-10 w-10 text-rose/60" />

                        <p className="mt-3 text-sm text-ink-soft">
                          Your photo will appear here.
                        </p>
                      </div>
                    )}
                  </div>

                  <p className="whitespace-pre-wrap leading-7 text-ink">
                    {personalization.message ||
                      "Your message will appear here as they uncover the memory."}
                  </p>

                  <p className="mt-6 text-sm text-ink-soft">
                    —{" "}
                    {personalization.sender_name ||
                      "from you"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}