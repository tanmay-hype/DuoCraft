const API_URL =
  process.env.INTERNAL_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type LoveLetterTone =
  | "tender"
  | "playful"
  | "poetic"
  | "sincere";

export type LoveLetterLanguage = "english" | "hindi";

export type LoveLetterLength =
  | "short"
  | "medium"
  | "long";

export type LoveLetterGeneration = {
  recipient_name: string;
  relationship: string;
  memories: string;
  language: LoveLetterLanguage;
  tone: LoveLetterTone;
  length: LoveLetterLength;
};

export type GeneratedLoveLetter = {
  headline: string;
  message: string;
  model: string;
  remaining_requests: number;
  provider: "gemini" | "ollama";
};

export async function generateLoveLetter(
  draftId: string,
  data: LoveLetterGeneration,
): Promise<GeneratedLoveLetter> {
  const response = await fetch(
    `${API_URL}/drafts/${draftId}/love-letter/generate`,
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
    let detail = "Unable to generate your Love Letter.";

    try {
      const body = (await response.json()) as {
        detail?: string;
      };

      if (body.detail) {
        detail = body.detail;
      }
    } catch {
      // Keep the user-facing fallback when the API has no JSON error body.
    }

    throw new Error(detail);
  }

  return (await response.json()) as GeneratedLoveLetter;
}