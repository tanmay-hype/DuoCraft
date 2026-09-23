"use client";

import {
  Check,
  Copy,
  ExternalLink,
  Gift,
  Heart,
  Loader2,
  Sparkles,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  getCheckoutGift,
  getCheckoutOrderStatus,
} from "@/lib/api/checkout";

type GiftState =
  | "loading"
  | "ready"
  | "error";

const MAX_ATTEMPTS = 20;
const RETRY_DELAY_MS = 1500;

export default function GiftPaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const orderId =
    searchParams.get("orderId");

  const [giftUrl, setGiftUrl] =
    useState<string | null>(null);

  const [giftState, setGiftState] =
    useState<GiftState>("loading");

  const [error, setError] =
    useState<string | null>(null);

  const [copied, setCopied] =
    useState(false);

  const loadGift = useCallback(
    async () => {
      if (!orderId) {
        setGiftState("error");
        setError(
          "We could not identify your order.",
        );
        return;
      }

      setGiftState("loading");
      setError(null);

      try {
        for (
          let attempt = 0;
          attempt < MAX_ATTEMPTS;
          attempt += 1
        ) {
          const order =
            await getCheckoutOrderStatus(
              orderId,
            );

          if (order.status !== "paid") {
            throw new Error(
              "Your payment is still being confirmed.",
            );
          }

          try {
            const gift =
              await getCheckoutGift(
                orderId,
              );

            setGiftUrl(gift.gift_url);
            setGiftState("ready");
            return;
          } catch (giftError) {
            if (
              attempt ===
              MAX_ATTEMPTS - 1
            ) {
              throw giftError;
            }
          }

          await new Promise<void>(
            (resolve) => {
              window.setTimeout(
                resolve,
                RETRY_DELAY_MS,
              );
            },
          );
        }
      } catch (err) {
        setGiftState("error");

        setError(
          err instanceof Error
            ? err.message
            : "Your payment was successful, but we could not prepare the gift link yet.",
        );
      }
    },
    [orderId],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadGift();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [loadGift]);

  async function copyGiftLink() {
    if (!giftUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        giftUrl,
      );

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setError(
        "Unable to copy the gift link. Please copy it from your browser instead.",
      );
    }
  }

  function openGift() {
    if (!giftUrl) {
      return;
    }

    window.location.href = giftUrl;
  }

  const isLoading =
    giftState === "loading";

  return (
    <main className="min-h-screen bg-[#fbf1ea] px-5 py-12 text-[#342622]">
      <div className="mx-auto flex min-h-[75vh] max-w-3xl items-center justify-center">
        <section className="relative w-full overflow-hidden rounded-[2rem] border border-[#e7cfc3] bg-[#fffaf6] px-6 py-12 text-center shadow-[0_30px_80px_rgba(91,48,37,0.10)] sm:px-12">
          <div className="absolute -left-12 -top-12 h-32 w-32 rounded-full bg-[#e9b9b0]/30 blur-2xl" />

          <div className="absolute -bottom-16 -right-12 h-40 w-40 rounded-full bg-[#d7b36a]/20 blur-3xl" />

          <div className="relative">
            <div className="mx-auto mb-7 flex h-20 w-20 items-center justify-center rounded-full bg-[#8f3f50] text-white shadow-lg">
              {isLoading ? (
                <Loader2
                  size={34}
                  strokeWidth={2.5}
                  className="animate-spin"
                />
              ) : (
                <Check
                  size={34}
                  strokeWidth={2.5}
                />
              )}
            </div>

            <div className="mb-3 flex items-center justify-center gap-2 text-sm font-medium uppercase tracking-[0.18em] text-[#9a6b58]">
              <Sparkles size={15} />

              {isLoading
                ? "Preparing your gift"
                : "Payment confirmed"}

              <Sparkles size={15} />
            </div>

            <h1 className="font-serif text-4xl leading-tight text-[#342622] sm:text-5xl">
              {isLoading
                ? "Almost there."
                : "Your gift is ready."}
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-[#725e56] sm:text-lg">
              {isLoading
                ? "Your payment has been confirmed. We’re creating the private link for your personalized gift."
                : "Your DuoCraft gift has been created successfully. It’s private and ready for you to share."}
            </p>

            {isLoading ? (
              <div className="mx-auto mt-9 max-w-lg rounded-2xl border border-[#ead8ce] bg-white/70 p-5">
                <div className="flex items-center justify-center gap-3 text-sm font-medium text-[#725e56]">
                  <Loader2
                    size={17}
                    className="animate-spin text-[#8f3f50]"
                  />
                  Securely preparing your private gift link...
                </div>
              </div>
            ) : null}

            {giftState === "ready" &&
            giftUrl ? (
              <>
                <div className="mx-auto mt-9 grid max-w-lg gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-[#ead8ce] bg-white/70 p-5 text-left">
                    <Gift
                      size={21}
                      className="mb-3 text-[#8f3f50]"
                    />

                    <p className="font-medium text-[#342622]">
                      Gift created
                    </p>

                    <p className="mt-1 text-sm leading-6 text-[#806c64]">
                      Your personalized experience is securely saved.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#ead8ce] bg-white/70 p-5 text-left">
                    <Heart
                      size={21}
                      className="mb-3 text-[#8f3f50]"
                    />

                    <p className="font-medium text-[#342622]">
                      Ready to share
                    </p>

                    <p className="mt-1 text-sm leading-6 text-[#806c64]">
                      Anyone with your private link can experience the gift.
                    </p>
                  </div>
                </div>

                <div className="mx-auto mt-9 max-w-lg">
                  <button
                    type="button"
                    onClick={openGift}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#8f3f50] px-7 py-4 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[#783544]"
                  >
                    View Your Gift
                    <ExternalLink
                      size={17}
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      void copyGiftLink()
                    }
                    className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#d9c0b4] bg-white px-7 py-3.5 text-sm font-semibold text-[#5f4038] transition hover:-translate-y-0.5 hover:border-[#8f3f50] hover:text-[#8f3f50]"
                  >
                    {copied ? (
                      <>
                        <Check size={17} />
                        Link copied
                      </>
                    ) : (
                      <>
                        <Copy size={17} />
                        Copy private gift link
                      </>
                    )}
                  </button>
                </div>

                <p className="mx-auto mt-5 max-w-md text-xs leading-5 text-[#806c64]">
                  Keep this link safe. It is the private address to your gift.
                </p>
              </>
            ) : null}

            {giftState === "error" ? (
              <>
                <div className="mx-auto mt-9 max-w-lg rounded-2xl border border-[#ead8ce] bg-white/70 p-5">
                  <p className="font-medium text-[#342622]">
                    Your payment is safe.
                  </p>

                  <p className="mt-2 text-sm leading-6 text-[#806c64]">
                    {error ??
                      "We could not prepare your gift link right now."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    void loadGift()
                  }
                  className="mt-6 inline-flex items-center justify-center rounded-full bg-[#8f3f50] px-7 py-3.5 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[#783544]"
                >
                  Try again
                </button>
              </>
            ) : null}

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/catalog")
              }
              className="mt-10 inline-flex items-center justify-center rounded-full border border-[#d9c0b4] bg-transparent px-7 py-3.5 text-sm font-semibold text-[#5f4038] transition hover:-translate-y-0.5 hover:border-[#8f3f50] hover:text-[#8f3f50]"
            >
              Create another gift
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}