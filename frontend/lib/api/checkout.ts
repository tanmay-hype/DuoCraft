const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type CheckoutAddon = {
  id: number;
  slug: string;
  name: string;
  price: number;
};

export type CheckoutProduct = {
  id: number;
  slug: string;
  name: string;
  template_key: string;
  base_price: number;
  sale_price: number;
  charged_price: number;
};

export type CheckoutPricingSnapshot = {
  product: CheckoutProduct;
  addons: CheckoutAddon[];
};

export type CheckoutOrder = {
  order_id: string;
  draft_id: string;
  status: string;
  currency: string;
  subtotal_amount: number;
  addon_amount: number;
  total_amount: number;
  customer_email: string | null;
  pricing_snapshot: CheckoutPricingSnapshot;
};

export type CheckoutOrderStatus = {
  order_id: string;
  draft_id: string;
  status: string;
  currency: string;
  total_amount: number;
};

export type PaymentOrder = {
  order_id: string;
  provider: string;
  provider_order_id: string;
  amount: number;
  currency: string;
  key_id: string;
};

export type PaymentVerification = {
  order_id: string;
  status: string;
  payment_id: string;
};

export type CatalogAddon = {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  price: number;
};

async function getErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as {
      detail?: string;
    };

    return body.detail ?? "Something went wrong.";
  } catch {
    return "Something went wrong.";
  }
}

export async function getAddons(): Promise<CatalogAddon[]> {
  const response = await fetch(`${API_URL}/addons`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json() as Promise<CatalogAddon[]>;
}

export async function createCheckoutOrder(
  draftId: string,
  addonIds: number[],
  customerEmail?: string,
): Promise<CheckoutOrder> {
  const response = await fetch(`${API_URL}/checkout/orders`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      draft_id: draftId,
      addon_ids: addonIds,
      customer_email: customerEmail || undefined,
    }),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json() as Promise<CheckoutOrder>;
}

export async function createPaymentOrder(
  orderId: string,
): Promise<PaymentOrder> {
  const response = await fetch(
    `${API_URL}/checkout/orders/${orderId}/payment`,
    {
      method: "POST",
      credentials: "include",
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json() as Promise<PaymentOrder>;
}

export async function verifyPayment(
  orderId: string,
  data: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  },
): Promise<PaymentVerification> {
  const response = await fetch(
    `${API_URL}/checkout/orders/${orderId}/verify-payment`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    },
  );

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json() as Promise<PaymentVerification>;
}

export async function getCheckoutOrderStatus(
  orderId: string,
): Promise<CheckoutOrderStatus> {
  const response = await fetch(
    `${API_URL}/checkout/orders/${orderId}`,
    {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json() as Promise<CheckoutOrderStatus>;
}

export type CheckoutGift = {
  order_id: string;
  gift_id: string;
  gift_url: string;
};

export async function getCheckoutGift(
  orderId: string,
): Promise<CheckoutGift> {
  const response = await fetch(
    `${API_URL}/checkout/orders/${orderId}/gift`,
    {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json() as Promise<CheckoutGift>;
}

