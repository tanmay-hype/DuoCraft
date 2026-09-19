"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { BirthdayBuilder } from "@/components/gifts/birthday/birthday-builder";
import { getDraft } from "@/lib/api/drafts";
import type { Draft } from "@/types/draft";

export default function CreateGiftPage() {
  const params = useParams<{ draftId: string }>();
  const draftId = params.draftId;

  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadDraft() {
      try {
        const loadedDraft = await getDraft(draftId);

        if (active) {
          setDraft(loadedDraft);
        }
      } catch (caughtError) {
        if (active) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "Unable to load your gift.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadDraft();

    return () => {
      active = false;
    };
  }, [draftId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-cream">
        <div className="page-shell py-24 text-center">
          <p className="script text-3xl text-rose">
            opening your gift...
          </p>
        </div>
      </main>
    );
  }

  if (error || !draft) {
    return (
      <main className="min-h-screen bg-cream">
        <div className="page-shell py-24">
          <div className="mx-auto max-w-xl rounded-[2rem] border border-line bg-paper p-8 text-center shadow-[var(--shadow-paper)]">
            <p className="script text-3xl text-rose">
              something went missing
            </p>

            <h1 className="serif mt-3 text-4xl font-semibold text-ink">
              We couldn&apos;t open this draft.
            </h1>

            <p className="mt-4 leading-7 text-ink-soft">
              {error ||
                "This draft may have expired or belongs to another browser."}
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (draft.template_key !== "birthday") {
    return (
      <main className="min-h-screen bg-cream">
        <div className="page-shell py-24">
          <div className="mx-auto max-w-xl rounded-[2rem] border border-line bg-paper p-8 text-center shadow-[var(--shadow-paper)]">
            <p className="script text-3xl text-rose">
              almost ready
            </p>

            <h1 className="serif mt-3 text-4xl font-semibold text-ink">
              This gift editor is coming next.
            </h1>

            <p className="mt-4 leading-7 text-ink-soft">
              The Birthday editor is available first while
              the remaining DuoCraft templates are being added.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream">
      <div className="page-shell py-10 sm:py-14">
        <BirthdayBuilder draft={draft} />
      </div>
    </main>
  );
}