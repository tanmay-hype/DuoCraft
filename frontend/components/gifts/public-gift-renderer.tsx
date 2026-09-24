"use client";

import type { PublicGift } from "@/lib/api/gifts";

import { PhotoPuzzleBoard } from "@/components/gifts/photo-puzzle/photo-puzzle-board";
import { Gift } from "lucide-react";

type PublicGiftRendererProps = {
  gift: PublicGift;
};

function getString(
  value: unknown,
): string {
  return typeof value === "string"
    ? value
    : "";
}

export function PublicGiftRenderer({
  gift,
}: PublicGiftRendererProps) {
  const personalization =
    gift.personalization;

  switch (gift.product.template_key) {
    case "photo_puzzle": {
      const photo =
        gift.photos[0];

      if (!photo) {
        return (
          <FallbackGift
            title={gift.product.name}
            message="This gift is being prepared."
          />
        );
      }

      const recipientName =
        getString(
          personalization.recipient_name,
        );

      const senderName =
        getString(
          personalization.sender_name,
        );

      const message =
        getString(
          personalization.message,
        );

      return (
        <PhotoPuzzleGift
          photoUrl={photo.view_url}
          recipientName={recipientName}
          senderName={senderName}
          message={message}
        />
      );
    }

    case "birthday":
      return (
        <BirthdayGift
          personalization={
            personalization
          }
          themeKey={gift.theme_key}
        />
      );

    case "thank_you":
      return (
        <ThankYouGift
          personalization={
            personalization
          }
          themeKey={gift.theme_key}
        />
      );

    default:
      return (
        <FallbackGift
          title={gift.product.name}
          message="This personalized gift is ready to be experienced."
        />
      );
  }
}

function PhotoPuzzleGift({
  photoUrl,
  recipientName,
  senderName,
  message,
}: {
  photoUrl: string;
  recipientName: string;
  senderName: string;
  message: string;
}) {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-rose">
          For {recipientName}
        </p>

        <h2 className="serif mt-3 text-4xl font-semibold text-ink">
          A little puzzle, made with love.
        </h2>

        <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-ink-soft">
          {message}
        </p>
      </div>

      <PhotoPuzzleBoard
        imageUrl={photoUrl}
        recipientName={recipientName}
      />

      <div className="rounded-2xl border border-line bg-cream p-6 text-center">
        <p className="text-sm text-ink-soft">
          Made especially for you by
        </p>

        <p className="serif mt-2 text-2xl font-semibold text-ink">
          {senderName}
        </p>
      </div>
    </div>
  );
}

function BirthdayGift({
  personalization,
  themeKey,
}: {
  personalization: Record<string, unknown>;
  themeKey: string;
}) {
  const recipientName =
    getString(
      personalization.recipient_name,
    );

  const senderName =
    getString(
      personalization.sender_name,
    );

  const headline =
    getString(
      personalization.headline,
    );

  const message =
    getString(
      personalization.message,
    );

  return (
    <div className="rounded-[2rem] bg-cream p-8 text-center sm:p-12">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-rose">
        {themeKey.replaceAll("-", " ")}
      </p>

      <h2 className="serif mt-5 text-4xl font-semibold">
        {headline}
      </h2>

      <p className="mt-5 text-lg leading-8 text-ink-soft">
        {message}
      </p>

      <div className="mt-8">
        <p className="text-sm text-ink-muted">
          For
        </p>

        <p className="serif mt-1 text-2xl font-semibold">
          {recipientName}
        </p>

        <p className="mt-4 text-sm text-ink-muted">
          With love from {senderName}
        </p>
      </div>
    </div>
  );
}

function ThankYouGift({
  personalization,
  themeKey,
}: {
  personalization: Record<string, unknown>;
  themeKey: string;
}) {
  const recipientName =
    getString(
      personalization.recipient_name,
    );

  const senderName =
    getString(
      personalization.sender_name,
    );

  const headline =
    getString(
      personalization.headline,
    );

  const message =
    getString(
      personalization.message,
    );

  return (
    <div className="rounded-[2rem] bg-cream p-8 text-center sm:p-12">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-rose">
        {themeKey.replaceAll("-", " ")}
      </p>

      <h2 className="serif mt-5 text-4xl font-semibold">
        {headline}
      </h2>

      <p className="mt-5 text-lg leading-8 text-ink-soft">
        {message}
      </p>

      <div className="mt-8">
        <p className="text-sm text-ink-muted">
          For {recipientName}
        </p>

        <p className="serif mt-2 text-2xl font-semibold">
          From {senderName}
        </p>
      </div>
    </div>
  );
}

function FallbackGift({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <div className="rounded-[2rem] bg-cream p-10 text-center">
      <Gift className="mx-auto size-9 text-rose" />

      <h2 className="serif mt-5 text-3xl font-semibold">
        {title}
      </h2>

      <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-ink-soft">
        {message}
      </p>
    </div>
  );
}