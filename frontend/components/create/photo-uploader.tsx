"use client";

import {
  ChangeEvent,
  DragEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  CheckCircle2,
  ImagePlus,
  LoaderCircle,
  RefreshCw,
  UploadCloud,
  X,
} from "lucide-react";

import {
  type PhotoAsset,
  uploadDraftPhoto,
} from "@/lib/api/photos";
import { cn } from "@/lib/utils";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

type UploadState =
  | "idle"
  | "ready"
  | "uploading"
  | "uploaded"
  | "error";

type PhotoUploaderProps = {
  draftId: string;
  label?: string;
  helperText?: string;
  onUploaded?: (asset: PhotoAsset) => void;
};

function validateFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "Choose a JPG, PNG, or WebP image.";
  }

  if (file.size > MAX_FILE_SIZE) {
    return "Your photo must be smaller than 10 MB.";
  }

  if (file.size === 0) {
    return "This photo appears to be empty.";
  }

  return null;
}

export function PhotoUploader({
  draftId,
  label = "Add a favorite photo",
  helperText = "JPG, PNG or WebP · max 10 MB",
  onUploaded,
}: PhotoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    null,
  );
  const [state, setState] =
    useState<UploadState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function clearPreview() {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl(null);
  }

  function selectFile(nextFile: File) {
    const validationError = validateFile(nextFile);

    if (validationError) {
      clearPreview();
      setFile(null);
      setState("error");
      setError(validationError);
      return;
    }

    clearPreview();

    const nextPreviewUrl = URL.createObjectURL(nextFile);

    setFile(nextFile);
    setPreviewUrl(nextPreviewUrl);
    setError(null);
    setState("ready");
  }

  function handleInputChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const nextFile = event.target.files?.[0];

    if (nextFile) {
      selectFile(nextFile);
    }

    event.target.value = "";
  }

  function handleDragOver(
    event: DragEvent<HTMLDivElement>,
  ) {
    event.preventDefault();

    if (state !== "uploading") {
      setIsDragging(true);
    }
  }

  function handleDragLeave(
    event: DragEvent<HTMLDivElement>,
  ) {
    event.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(
    event: DragEvent<HTMLDivElement>,
  ) {
    event.preventDefault();
    setIsDragging(false);

    if (state === "uploading") {
      return;
    }

    const nextFile = event.dataTransfer.files?.[0];

    if (nextFile) {
      selectFile(nextFile);
    }
  }

  async function handleUpload() {
    if (!file || state === "uploading") {
      return;
    }

    setState("uploading");
    setError(null);

    try {
      const asset = await uploadDraftPhoto(
        draftId,
        file,
      );

      setState("uploaded");
      onUploaded?.(asset);
    } catch (uploadError) {
      setState("error");

      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Unable to upload your photo.",
      );
    }
  }

  function handleRemove() {
    if (state === "uploading") {
      return;
    }

    clearPreview();
    setFile(null);
    setError(null);
    setState("idle");

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function openFilePicker() {
    if (state !== "uploading") {
      inputRef.current?.click();
    }
  }

  const hasPreview = Boolean(previewUrl);

  return (
    <section className="space-y-3">
      <div>
        <p className="font-medium text-[var(--ink)]">
          {label}
        </p>

        <p className="mt-1 text-sm text-[var(--ink)]/60">
          {helperText}
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={handleInputChange}
      />

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative overflow-hidden rounded-[28px] border",
          "transition duration-200",
          isDragging
            ? "border-[var(--berry)] bg-[var(--rose)]/25"
            : "border-[var(--ink)]/10 bg-white/55",
          state === "error" &&
            "border-red-400/50",
        )}
      >
        {!hasPreview ? (
          <button
            type="button"
            onClick={openFilePicker}
            className={cn(
              "flex min-h-72 w-full flex-col",
              "items-center justify-center px-6 py-10",
              "text-center",
              "focus-visible:outline-none",
              "focus-visible:ring-2",
              "focus-visible:ring-[var(--berry)]",
              "focus-visible:ring-inset",
            )}
          >
            <span
              className={cn(
                "mb-5 flex size-14 items-center",
                "justify-center rounded-full",
                "bg-[var(--rose)]/55",
                "text-[var(--berry)]",
              )}
            >
              {isDragging ? (
                <UploadCloud className="size-6" />
              ) : (
                <ImagePlus className="size-6" />
              )}
            </span>

            <span className="font-serif text-xl text-[var(--ink)]">
              {isDragging
                ? "Drop your photo here"
                : "Drop a photo here"}
            </span>

            <span className="mt-2 max-w-xs text-sm leading-6 text-[var(--ink)]/55">
              Or choose a photo from your device to make
              this gift feel unmistakably theirs.
            </span>

            <span
              className={cn(
                "mt-6 rounded-full",
                "bg-[var(--ink)] px-5 py-2.5",
                "text-sm font-medium text-white",
              )}
            >
              Choose photo
            </span>
          </button>
        ) : (
          <div className="p-3">
            <div
              className={cn(
                "relative aspect-[4/3] overflow-hidden",
                "rounded-[22px] bg-[var(--cream)]",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl ?? ""}
                alt="Selected photo preview"
                className="h-full w-full object-cover"
              />

              <button
                type="button"
                onClick={handleRemove}
                disabled={state === "uploading"}
                aria-label="Remove selected photo"
                className={cn(
                  "absolute right-3 top-3",
                  "flex size-9 items-center justify-center",
                  "rounded-full bg-white/90",
                  "text-[var(--ink)] shadow-sm",
                  "backdrop-blur",
                  "transition hover:bg-white",
                  "disabled:cursor-not-allowed",
                  "disabled:opacity-50",
                )}
              >
                <X className="size-4" />
              </button>

              {state === "uploading" && (
                <div
                  className={cn(
                    "absolute inset-0 flex flex-col",
                    "items-center justify-center",
                    "bg-[var(--ink)]/45 text-white",
                    "backdrop-blur-[2px]",
                  )}
                >
                  <LoaderCircle className="size-7 animate-spin" />

                  <span className="mt-3 text-sm font-medium">
                    Uploading your photo…
                  </span>
                </div>
              )}

              {state === "uploaded" && (
                <div
                  className={cn(
                    "absolute bottom-3 left-3",
                    "flex items-center gap-2",
                    "rounded-full bg-white/90",
                    "px-3 py-2 text-sm font-medium",
                    "text-[var(--ink)] shadow-sm",
                    "backdrop-blur",
                  )}
                >
                  <CheckCircle2 className="size-4 text-emerald-600" />
                  Photo added
                </div>
              )}
            </div>

            <div
              className={cn(
                "flex flex-col gap-3 px-1 pb-1 pt-4",
                "sm:flex-row sm:items-center",
                "sm:justify-between",
              )}
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-[var(--ink)]">
                  {file?.name}
                </p>

                {file && (
                  <p className="mt-0.5 text-xs text-[var(--ink)]/50">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                )}
              </div>

              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={openFilePicker}
                  disabled={state === "uploading"}
                  className={cn(
                    "inline-flex items-center gap-2",
                    "rounded-full border",
                    "border-[var(--ink)]/10",
                    "bg-white px-4 py-2",
                    "text-sm font-medium",
                    "text-[var(--ink)]",
                    "transition hover:bg-[var(--cream)]",
                    "disabled:cursor-not-allowed",
                    "disabled:opacity-50",
                  )}
                >
                  <RefreshCw className="size-3.5" />
                  Replace
                </button>

                {state !== "uploaded" && (
                  <button
                    type="button"
                    onClick={handleUpload}
                    disabled={
                      !file ||
                      state === "uploading"
                    }
                    className={cn(
                      "inline-flex items-center gap-2",
                      "rounded-full",
                      "bg-[var(--berry)] px-4 py-2",
                      "text-sm font-medium text-white",
                      "transition hover:opacity-90",
                      "disabled:cursor-not-allowed",
                      "disabled:opacity-50",
                    )}
                  >
                    {state === "uploading" ? (
                      <LoaderCircle className="size-3.5 animate-spin" />
                    ) : (
                      <UploadCloud className="size-3.5" />
                    )}

                    {state === "uploading"
                      ? "Uploading…"
                      : state === "error"
                        ? "Try again"
                        : "Add photo"}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p
          role="alert"
          className="text-sm leading-6 text-red-600"
        >
          {error}
        </p>
      )}

      {state === "uploaded" && (
        <p
          className={cn(
            "flex items-center gap-2",
            "text-sm text-[var(--ink)]/60",
          )}
        >
          <CheckCircle2 className="size-4 text-emerald-600" />
          Your photo was uploaded securely.
        </p>
      )}
    </section>
  );
}