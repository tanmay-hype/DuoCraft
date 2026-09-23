"use client";

import {
  Check,
  CreditCard,
  Loader2,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CatalogAddon,
  CheckoutOrder,
  createCheckoutOrder,
  createPaymentOrder,
  getAddons,
  getCheckoutOrderStatus,
  verifyPayment,
} from "@/lib/api/checkout";

type CheckoutPanelProps = {
  draftId: string;
  productName: string;
};

function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount / 100);
}

function loadRazorpay(): Promise<void> {
  if (
    typeof window !== "undefined" &&
    window.Razorpay
  ) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const scriptSelector =
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]';

    const existingScript =
      document.querySelector<HTMLScriptElement>(
        scriptSelector,
      );

    if (existingScript) {
      if (window.Razorpay) {
        resolve();
        return;
      }

      existingScript.addEventListener(
        "load",
        () => resolve(),
        { once: true },
      );

      existingScript.addEventListener(
        "error",
        () =>
          reject(
            new Error(
              "Unable to load Razorpay Checkout.",
            ),
          ),
        { once: true },
      );

      return;
    }

    const script = document.createElement("script");

    script.src =
      "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    script.onload = () => resolve();

    script.onerror = () =>
      reject(
        new Error(
          "Unable to load Razorpay Checkout.",
        ),
      );

    document.body.appendChild(script);
  });
}

export function CheckoutPanel({
  draftId,
  productName,
}: CheckoutPanelProps) {
  const router = useRouter();

  const [addons, setAddons] =
    useState<CatalogAddon[]>([]);

  const [selectedAddonIds, setSelectedAddonIds] =
    useState<number[]>([]);

  const [email, setEmail] = useState("");

  const [order, setOrder] =
    useState<CheckoutOrder | null>(null);

  const [loadingAddons, setLoadingAddons] =
    useState(true);

  const [loadingPayment, setLoadingPayment] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const selectedAddons = useMemo(
    () =>
      addons.filter((addon) =>
        selectedAddonIds.includes(addon.id),
      ),
    [addons, selectedAddonIds],
  );

  useEffect(() => {
    let cancelled = false;

    async function loadAddons() {
      try {
        const result = await getAddons();

        if (!cancelled) {
          setAddons(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load add-ons.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingAddons(false);
        }
      }
    }

    void loadAddons();

    return () => {
      cancelled = true;
    };
  }, []);

  function toggleAddon(addonId: number) {
    setSelectedAddonIds((current) =>
      current.includes(addonId)
        ? current.filter((id) => id !== addonId)
        : [...current, addonId],
    );

    setOrder(null);
    setError(null);
  }

  async function waitForPaymentConfirmation(
    orderId: string,
  ): Promise<boolean> {
    const maxAttempts = 20;
    const intervalMs = 1500;

    for (
      let attempt = 0;
      attempt < maxAttempts;
      attempt += 1
    ) {
      const currentOrder =
        await getCheckoutOrderStatus(orderId);

      if (currentOrder.status === "paid") {
        return true;
      }

      if (
        currentOrder.status === "failed" ||
        currentOrder.status === "cancelled"
      ) {
        return false;
      }

      await new Promise<void>((resolve) => {
        window.setTimeout(
          resolve,
          intervalMs,
        );
      });
    }

    return false;
  }

  async function beginPayment() {
    setError(null);
    setLoadingPayment(true);

    try {
      const checkoutOrder =
        await createCheckoutOrder(
          draftId,
          selectedAddonIds,
          email.trim() || undefined,
        );

      setOrder(checkoutOrder);

      await loadRazorpay();

      const paymentOrder =
        await createPaymentOrder(
          checkoutOrder.order_id,
        );

      if (!window.Razorpay) {
        throw new Error(
          "Razorpay Checkout is unavailable.",
        );
      }

      const razorpay =
        new window.Razorpay({
          key: paymentOrder.key_id,
          amount: paymentOrder.amount,
          currency: paymentOrder.currency,
          name: "DuoCraft",
          description: productName,
          order_id:
            paymentOrder.provider_order_id,
          prefill: email.trim()
            ? {
                email: email.trim(),
              }
            : undefined,
          theme: {
            color: "#9b4d61",
          },
          modal: {
            ondismiss: () => {
              setLoadingPayment(false);
            },
          },
          handler: async (response) => {
            try {
              await verifyPayment(
                checkoutOrder.order_id,
                response,
              );

              const confirmed =
                await waitForPaymentConfirmation(
                  checkoutOrder.order_id,
                );

              if (!confirmed) {
                throw new Error(
                  "Payment was received, but confirmation is still processing. Please check your email for confirmation or contact support if you do not receive a confirmation within a few minutes.",
                );
              }

              router.push(
                `/create/${draftId}/success?orderId=${encodeURIComponent(
                  checkoutOrder.order_id,
                )}`,
              );
            } catch (err) {
              setError(
                err instanceof Error
                  ? err.message
                  : "Payment verification failed.",
              );

              setLoadingPayment(false);
            }
          },
        });

      razorpay.on(
        "payment.failed",
        () => {
          setError(
            "Payment was not completed. You can try again.",
          );

          setLoadingPayment(false);
        },
      );

      razorpay.open();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to start payment.",
      );

      setLoadingPayment(false);
    }
  }

  const serverTotal =
    order?.total_amount ?? null;

  return (
    <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-[2rem] border border-line bg-paper p-6 shadow-[var(--shadow-paper)] sm:p-8">
        <div className="mb-7">
          <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-rose">
            <Sparkles className="size-4" />
            Make it yours
          </div>

          <h2 className="serif text-3xl font-semibold text-ink">
            Add a little extra
          </h2>

          <p className="mt-2 max-w-xl text-sm leading-6 text-ink-soft">
            Your gift is already beautiful.
            These optional touches make it
            even more personal.
          </p>
        </div>

        <div className="space-y-3">
          {loadingAddons ? (
            <div className="rounded-2xl border border-line bg-cream p-5 text-sm text-ink-muted">
              Loading optional extras...
            </div>
          ) : addons.length === 0 ? (
            <div className="rounded-2xl border border-line bg-cream p-5 text-sm text-ink-muted">
              No extras are available right now.
            </div>
          ) : (
            addons.map((addon) => {
              const selected =
                selectedAddonIds.includes(addon.id);

              return (
                <button
                  key={addon.id}
                  type="button"
                  onClick={() =>
                    toggleAddon(addon.id)
                  }
                  className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left transition ${
                    selected
                      ? "border-rose bg-rose/5"
                      : "border-line bg-cream hover:border-rose/50"
                  }`}
                >
                  <span className="flex items-start gap-3">
                    <span
                      className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border ${
                        selected
                          ? "border-rose bg-rose text-paper"
                          : "border-line bg-paper"
                      }`}
                    >
                      {selected ? (
                        <Check className="size-3" />
                      ) : null}
                    </span>

                    <span>
                      <span className="block font-bold text-ink">
                        {addon.name}
                      </span>

                      {addon.description ? (
                        <span className="mt-1 block text-xs leading-5 text-ink-muted">
                          {addon.description}
                        </span>
                      ) : null}
                    </span>
                  </span>

                  <span className="ml-4 shrink-0 font-bold text-ink">
                    +{formatPrice(addon.price)}
                  </span>
                </button>
              );
            })
          )}
        </div>

        <div className="mt-8 border-t border-line pt-7">
          <label
            htmlFor="checkout-email"
            className="mb-2 flex items-center gap-2 text-sm font-bold text-ink"
          >
            <Mail className="size-4 text-rose" />
            Email for your receipt
            <span className="font-normal text-ink-muted">
              (optional)
            </span>
          </label>

          <input
            id="checkout-email"
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setOrder(null);
              setError(null);
            }}
            placeholder="you@example.com"
            autoComplete="email"
            className="w-full rounded-xl border border-line bg-cream px-4 py-3 text-sm text-ink outline-none transition placeholder:text-ink-muted focus:border-rose focus:ring-2 focus:ring-rose/10"
          />

          <p className="mt-2 text-xs leading-5 text-ink-muted">
            We only use this for your order
            receipt and important payment updates.
          </p>
        </div>
      </div>

      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-[2rem] bg-ink p-6 text-paper shadow-[var(--shadow-paper)] sm:p-8">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-champagne">
            <CreditCard className="size-4" />
            Order summary
          </div>

          <h3 className="serif mt-4 text-2xl font-semibold">
            {productName}
          </h3>

          <div className="my-7 space-y-4 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-paper/60">
                Gift
              </span>

              <span className="font-semibold">
                {order
                  ? formatPrice(
                      order.subtotal_amount,
                    )
                  : "Calculated at checkout"}
              </span>
            </div>

            {selectedAddons.map((addon) => (
              <div
                key={addon.id}
                className="flex justify-between gap-4"
              >
                <span className="text-paper/60">
                  {addon.name}
                </span>

                <span className="font-semibold">
                  {formatPrice(addon.price)}
                </span>
              </div>
            ))}

            <div className="border-t border-paper/15 pt-4">
              <div className="flex items-end justify-between gap-4">
                <span className="text-paper/70">
                  Total
                </span>

                <span className="serif text-3xl font-semibold">
                  {serverTotal !== null
                    ? formatPrice(serverTotal)
                    : "—"}
                </span>
              </div>
            </div>
          </div>

          {error ? (
            <div className="mb-4 rounded-xl border border-red-300/30 bg-red-400/10 px-4 py-3 text-sm leading-5 text-red-100">
              {error}
            </div>
          ) : null}

          <button
            type="button"
            onClick={() =>
              void beginPayment()
            }
            disabled={
              loadingPayment ||
              loadingAddons
            }
            className="flex w-full items-center justify-center gap-2 rounded-full bg-paper px-5 py-4 text-sm font-bold text-ink transition hover:-translate-y-0.5 hover:bg-cream disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loadingPayment ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Opening secure checkout...
              </>
            ) : (
              <>
                <ShieldCheck className="size-4" />
                Continue to secure payment
              </>
            )}
          </button>

          <p className="mt-4 text-center text-xs leading-5 text-paper/45">
            Your payment is securely processed by
            Razorpay. DuoCraft never sees your card
            or UPI credentials.
          </p>
        </div>
      </div>
    </section>
  );
}