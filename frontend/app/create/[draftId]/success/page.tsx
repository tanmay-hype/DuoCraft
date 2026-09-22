"use client";

import { useRouter } from "next/navigation";
import { Check, Gift, Heart, Sparkles } from "lucide-react";

export default function GiftPaymentSuccessPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#fbf1ea] px-5 py-12 text-[#342622]">
      <div className="mx-auto flex min-h-[75vh] max-w-3xl items-center justify-center">
        <section className="relative w-full overflow-hidden rounded-[2rem] border border-[#e7cfc3] bg-[#fffaf6] px-6 py-12 text-center shadow-[0_30px_80px_rgba(91,48,37,0.10)] sm:px-12">
          <div className="absolute -left-12 -top-12 h-32 w-32 rounded-full bg-[#e9b9b0]/30 blur-2xl" />
          <div className="absolute -bottom-16 -right-12 h-40 w-40 rounded-full bg-[#d7b36a]/20 blur-3xl" />

          <div className="relative">
            <div className="mx-auto mb-7 flex h-20 w-20 items-center justify-center rounded-full bg-[#8f3f50] text-white shadow-lg">
              <Check size={34} strokeWidth={2.5} />
            </div>

            <div className="mb-3 flex items-center justify-center gap-2 text-sm font-medium uppercase tracking-[0.18em] text-[#9a6b58]">
              <Sparkles size={15} />
              Payment confirmed
              <Sparkles size={15} />
            </div>

            <h1 className="font-serif text-4xl leading-tight text-[#342622] sm:text-5xl">
              Your gift is ready.
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-[#725e56] sm:text-lg">
              Your DuoCraft gift has been created successfully. We&apos;ll
              keep it safe and private while you decide when to share it.
            </p>

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
                  Made with care
                </p>
                <p className="mt-1 text-sm leading-6 text-[#806c64]">
                  Your recipient will see the experience you created.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => router.push("/catalog")}
              className="mt-10 inline-flex items-center justify-center rounded-full bg-[#8f3f50] px-7 py-3.5 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[#783544]"
            >
              Create another gift
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}