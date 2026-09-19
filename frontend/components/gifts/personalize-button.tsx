"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { createDraft } from "@/lib/api/drafts";

interface PersonalizeButtonProps {
  productId: number;
  className?: string;
}

export function PersonalizeButton({
  productId,
  className = "",
}: PersonalizeButtonProps) {
  const router = useRouter();

  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleClick() {
    if (pending) {
      return;
    }

    setPending(true);
    setError("");

    try {
      const draft = await createDraft(productId);

      router.push(`/create/${draft.id}`);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to start your gift.",
      );

      setPending(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className={`rounded-full bg-berry px-6 py-3 text-sm font-bold text-paper transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      >
        {pending ? "Opening your gift..." : "Personalize"}
      </button>

      {error ? (
        <p
          className="mt-2 text-sm text-berry"
          role="alert"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
