import { Gift, Heart } from "lucide-react";
import { notFound } from "next/navigation";

import { getPublicGift } from "@/lib/api/gifts";

type PublicGiftPageProps = {
  params: Promise<{
    token: string;
  }>;
};

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

  return (
    <main className="min-h-screen bg-cream px-5 py-10 text-ink sm:py-16">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-line bg-paper px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-rose">
            <Gift className="size-4" />
            A DuoCraft gift
          </div>

          <h1 className="serif text-4xl font-semibold sm:text-5xl">
            Made especially for you
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-ink-soft">
            Someone created this little experience
            just for you.
          </p>
        </header>

        <section className="overflow-hidden rounded-[2rem] border border-line bg-paper shadow-[var(--shadow-paper)]">
          <div className="p-7 text-center sm:p-12">
            <Heart className="mx-auto size-8 text-rose" />

            <h2 className="serif mt-5 text-3xl font-semibold">
              {gift.product.name}
            </h2>

            <p className="mt-3 text-sm text-ink-muted">
              Your personalized gift is waiting.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}