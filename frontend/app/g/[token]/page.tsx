import { Gift, Heart, Sparkles } from "lucide-react";
import { notFound } from "next/navigation";

import { getPublicGift } from "@/lib/api/gifts";

type PublicGiftPageProps = {
  params: Promise<{
    token: string;
  }>;
};

type BirthdayPersonalization = {
  recipient_name?: string;
  sender_name?: string;
  headline?: string;
  message?: string;
};

type ThankYouPersonalization = {
  recipient_name?: string;
  sender_name?: string;
  headline?: string;
  message?: string;
};

type PhotoPuzzlePersonalization = {
  recipient_name?: string;
  sender_name?: string;
  message?: string;
  photo_asset_id?: string | null;
};

function getTextValue(
  personalization: Record<string, unknown>,
  key: string,
): string {
  const value = personalization[key];

  return typeof value === "string" ? value : "";
}

function GiftFooter({
  senderName,
}: {
  senderName: string;
}) {
  return (
    <div className="mt-10 border-t border-line pt-7 text-center">
      <p className="script text-3xl text-rose">
        made with a little love
      </p>

      {senderName ? (
        <p className="mt-3 text-sm text-ink-muted">
          From{" "}
          <span className="font-semibold text-ink">
            {senderName}
          </span>
        </p>
      ) : null}
    </div>
  );
}

function BirthdayGift({
  personalization,
  themeKey,
}: {
  personalization: BirthdayPersonalization;
  themeKey: string;
}) {
  const recipientName =
    personalization.recipient_name ||
    "Someone special";

  const headline =
    personalization.headline ||
    "Happy Birthday!";

  const message =
    personalization.message ||
    "Wishing you a beautiful day filled with all the things that make you smile.";

  const senderName =
    personalization.sender_name || "";

  const themeClass =
    themeKey === "midnight-gold"
      ? "bg-ink text-paper"
      : themeKey === "rose-celebration"
        ? "bg-rose/10 text-ink"
        : "bg-paper text-ink";

  const accentClass =
    themeKey === "midnight-gold"
      ? "text-champagne"
      : "text-rose";

  return (
    <section
      className={`relative overflow-hidden rounded-[2.5rem_1.5rem_2.8rem_1.8rem] border border-line shadow-[var(--shadow-paper)] ${themeClass}`}
    >
      <div
        aria-hidden="true"
        className="absolute -right-20 -top-20 size-64 rounded-full border border-current opacity-10"
      />

      <div
        aria-hidden="true"
        className="absolute -bottom-28 -left-20 size-80 rounded-full border border-current opacity-10"
      />

      <div className="relative px-7 py-12 sm:px-12 sm:py-16">
        <div className="mx-auto max-w-2xl text-center">
          <div className={`mb-7 ${accentClass}`}>
            <Sparkles className="mx-auto size-8" />
          </div>

          <p className="script text-3xl opacity-75 sm:text-4xl">
            a little birthday magic
          </p>

          <p className="mt-8 text-xs font-bold uppercase tracking-[0.22em] opacity-55">
            especially for
          </p>

          <h2 className="serif mt-4 text-5xl font-semibold tracking-[-0.05em] sm:text-7xl">
            {recipientName}
          </h2>

          <div
            className={`mx-auto mt-9 h-px w-20 ${
              themeKey === "midnight-gold"
                ? "bg-champagne/50"
                : "bg-rose/40"
            }`}
          />

          <h3 className="serif mx-auto mt-9 max-w-xl text-3xl font-medium leading-tight sm:text-4xl">
            {headline}
          </h3>

          <p className="mx-auto mt-8 max-w-2xl whitespace-pre-wrap text-base leading-8 opacity-80 sm:text-lg">
            {message}
          </p>

          <GiftFooter senderName={senderName} />
        </div>
      </div>
    </section>
  );
}

function ThankYouGift({
  personalization,
  themeKey,
}: {
  personalization: ThankYouPersonalization;
  themeKey: string;
}) {
  const recipientName =
    personalization.recipient_name ||
    "Someone special";

  const headline =
    personalization.headline ||
    "Thank you, truly.";

  const message =
    personalization.message ||
    "Some people deserve more than a simple thank you.";

  const senderName =
    personalization.sender_name || "";

  const themeClass =
    themeKey === "warm-paper"
      ? "bg-paper text-ink"
      : themeKey === "garden-note"
        ? "bg-[#f4eee2] text-ink"
        : "bg-rose/10 text-ink";

  return (
    <section
      className={`relative overflow-hidden rounded-[2.5rem_1.5rem_2.8rem_1.8rem] border border-line shadow-[var(--shadow-paper)] ${themeClass}`}
    >
      <div
        aria-hidden="true"
        className="absolute -right-16 -top-16 size-52 rounded-full border border-rose/20"
      />

      <div
        aria-hidden="true"
        className="absolute -bottom-20 -left-16 size-64 rounded-full border border-rose/15"
      />

      <div className="relative px-7 py-12 sm:px-12 sm:py-16">
        <div className="mx-auto max-w-2xl text-center">
          <Heart className="mx-auto size-9 text-rose" />

          <p className="script mt-7 text-3xl text-rose sm:text-4xl">
            from the heart
          </p>

          <p className="mt-8 text-xs font-bold uppercase tracking-[0.22em] text-ink-muted">
            for
          </p>

          <h2 className="serif mt-4 text-5xl font-semibold tracking-[-0.05em] sm:text-7xl">
            {recipientName}
          </h2>

          <h3 className="serif mx-auto mt-9 max-w-xl text-3xl font-medium leading-tight sm:text-4xl">
            {headline}
          </h3>

          <p className="mx-auto mt-8 max-w-2xl whitespace-pre-wrap text-base leading-8 text-ink-soft sm:text-lg">
            {message}
          </p>

          <GiftFooter senderName={senderName} />
        </div>
      </div>
    </section>
  );
}

function PhotoPuzzleGift({
  personalization,
  photoUrl,
}: {
  personalization: PhotoPuzzlePersonalization;
  photoUrl?: string;
}) {
  const recipientName =
    personalization.recipient_name ||
    "Someone special";

  const message =
    personalization.message ||
    "A little memory, piece by piece.";

  const senderName =
    personalization.sender_name || "";

  return (
    <section className="overflow-hidden rounded-[2.5rem_1.5rem_2.8rem_1.8rem] border border-line bg-paper shadow-[var(--shadow-paper)]">
      <div className="p-7 sm:p-12">
        <div className="text-center">
          <p className="script text-3xl text-rose sm:text-4xl">
            piece by piece
          </p>

          <h2 className="serif mt-4 text-5xl font-semibold tracking-[-0.05em] sm:text-6xl">
            {recipientName}
          </h2>

          <p className="mx-auto mt-6 max-w-xl whitespace-pre-wrap text-base leading-8 text-ink-soft">
            {message}
          </p>
        </div>

        {photoUrl ? (
          <div className="mx-auto mt-10 max-w-xl overflow-hidden rounded-[2rem] border border-line bg-cream p-3 shadow-[var(--shadow-paper)]">
            <img
              src={photoUrl}
              alt={`A photo gift for ${recipientName}`}
              className="h-auto w-full rounded-[1.5rem] object-cover"
            />
          </div>
        ) : null}

        <GiftFooter senderName={senderName} />
      </div>
    </section>
  );
}

export default async function PublicGiftPage({
  params,
}: PublicGiftPageProps) {
  const { token } = await params;

  let gift;

  try {
    gift = await getPublicGift(token);
  } catch {
    notFound();
  }

  const personalization = gift.personalization;

  const templateKey = gift.product.template_key;

  const recipientName = getTextValue(
    personalization,
    "recipient_name",
  );

  return (
    <main className="min-h-screen bg-cream px-5 py-10 text-ink sm:py-16">
      <div className="mx-auto max-w-5xl">
        <header className="mb-10 text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-paper px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-rose">
            <Gift className="size-4" />
            A DuoCraft gift
          </div>

          <h1 className="serif text-5xl font-semibold tracking-[-0.05em] sm:text-6xl">
            Made especially for you
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-ink-soft">
            Someone created this little experience
            just for you.
          </p>

          {recipientName ? (
            <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-ink-muted">
              A surprise for {recipientName}
            </p>
          ) : null}
        </header>

        {templateKey === "birthday" ? (
          <BirthdayGift
            personalization={personalization}
            themeKey={gift.theme_key}
          />
        ) : templateKey === "thank_you" ? (
          <ThankYouGift
            personalization={personalization}
            themeKey={gift.theme_key}
          />
        ) : templateKey === "photo_puzzle" ? (
          <PhotoPuzzleGift
            personalization={personalization}
            photoUrl={gift.photos[0]?.view_url}
          />
        ) : (
          <section className="rounded-[2rem] border border-line bg-paper p-10 text-center shadow-[var(--shadow-paper)] sm:p-16">
            <Heart className="mx-auto size-9 text-rose" />

            <h2 className="serif mt-6 text-4xl font-semibold">
              {gift.product.name}
            </h2>

            <p className="mx-auto mt-4 max-w-xl whitespace-pre-wrap leading-8 text-ink-soft">
              {getTextValue(
                personalization,
                "message",
              ) ||
                "Your personalized gift is ready to be enjoyed."}
            </p>

            <GiftFooter
              senderName={getTextValue(
                personalization,
                "sender_name",
              )}
            />
          </section>
        )}

        <footer className="mt-10 text-center">
          <p className="text-xs text-ink-muted">
            Created privately with DuoCraft
          </p>
        </footer>
      </div>
    </main>
  );
}