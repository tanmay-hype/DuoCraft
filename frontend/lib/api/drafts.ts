import type { Draft, DraftUpdate } from "@/types/draft";

const API_URL =
  process.env.INTERNAL_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function getErrorMessage(
  response: Response,
  fallback: string,
): Promise<string> {
  try {
    const body = (await response.json()) as {
      detail?: string;
    };

    return body.detail ?? fallback;
  } catch {
    return fallback;
  }
}

export async function createDraft(
  productId: number,
): Promise<Draft> {
  const response = await fetch(`${API_URL}/drafts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      product_id: productId,
    }),
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "Unable to start your gift.",
      ),
    );
  }

  return (await response.json()) as Draft;
}

export async function getDraft(
  draftId: string,
): Promise<Draft> {
  const response = await fetch(
    `${API_URL}/drafts/${draftId}`,
    {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "Unable to load your gift.",
      ),
    );
  }

  return (await response.json()) as Draft;
}

export async function updateDraft(
  draftId: string,
  data: DraftUpdate,
): Promise<Draft> {
  const response = await fetch(
    `${API_URL}/drafts/${draftId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    },
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "Unable to save your changes.",
      ),
    );
  }

  return (await response.json()) as Draft;
}
