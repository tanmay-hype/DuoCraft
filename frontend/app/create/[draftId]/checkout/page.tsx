import Link from "next/link";
import { ArrowLeft, Gift } from "lucide-react";

import { CheckoutPanel } from "@/components/checkout/checkout-panel";

type CheckoutPageProps = {
  params: Promise<{
    draftId: string;
  }>;
};

export default async function CheckoutPage({
  params,
}: CheckoutPageProps) {
  const { draftId } = await params;

  return (
    <main className="min-h-screen bg-cream">
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 lg:py-16">
        <div className="mb-10">
          <Link
            href={`/create/${draftId}/review`}
            className="inline-flex items-center gap-2 text-sm font-bold text-ink-soft transition hover:text-rose"
          >
            <ArrowLeft className="size-4" />
            Back to your gift
          </Link>

          <div className="mt-8 flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-full bg-rose text-paper">
              <Gift className="size-5" />
            </span>

            <span className="text-xs font-bold uppercase tracking-[0.16em] text-rose">
              Final step
            </span>
          </div>

          <h1 className="serif mt-4 max-w-2xl text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            Ready to make someone&apos;s day?
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-ink-soft">
            Choose any optional extras, check your
            details, and complete your payment.
          </p>
        </div>

        <CheckoutPanel
          draftId={draftId}
          productName="Your DuoCraft gift"
        />
      </div>
    </main>
  );
}