const API_URL =
  process.env.INTERNAL_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type PublicGiftProduct = {
  name: string;
  slug: string;
  template_key: string;
};

export type PublicGiftPhoto = {
  asset_id: string;
  view_url: string;
  expires_in_seconds: number;
};

export type PublicGift = {
  gift_id: string;
  status: string;
  product: PublicGiftProduct;
  personalization: Record<string, unknown>;
  theme_key: string;
  photos: PublicGiftPhoto[];
};

export async function getPublicGift(
  token: string,
): Promise<PublicGift> {
  const response = await fetch(
    `${API_URL}/g/${encodeURIComponent(token)}`,
    {
      method: "GET",
      cache: "no-store",
    },
  );

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(
        "This gift could not be found.",
      );
    }

    throw new Error(
      "Unable to load this gift right now.",
    );
  }

  return response.json() as Promise<PublicGift>;
}