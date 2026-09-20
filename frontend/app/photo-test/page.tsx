"use client";

import { useState } from "react";

import { PhotoUploader } from "@/components/create/photo-uploader";
import type { PhotoAsset } from "@/lib/api/photos";

export default function PhotoTestPage() {
  const [draftId, setDraftId] = useState("");
  const [asset, setAsset] = useState<PhotoAsset | null>(
    null,
  );

  return (
    <main className="min-h-screen bg-[var(--cream)] px-6 py-16">
      <div className="mx-auto max-w-2xl">
        <p className="font-script text-xl text-[var(--berry)]">
          DuoCraft
        </p>

        <h1 className="mt-2 font-serif text-4xl text-[var(--ink)]">
          Photo upload test
        </h1>

        <p className="mt-3 text-[var(--ink)]/60">
          Enter one of your existing draft IDs and upload a
          photo through the real DuoCraft pipeline.
        </p>

        <label className="mt-8 block">
          <span className="text-sm font-medium text-[var(--ink)]">
            Draft ID
          </span>

          <input
            value={draftId}
            onChange={(event) => {
              setDraftId(event.target.value.trim());
              setAsset(null);
            }}
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            className="mt-2 w-full rounded-2xl border border-[var(--ink)]/10 bg-white px-4 py-3 text-[var(--ink)] outline-none focus:border-[var(--berry)]"
          />
        </label>

        {draftId && (
          <div className="mt-8">
            <PhotoUploader
              draftId={draftId}
              onUploaded={setAsset}
            />
          </div>
        )}

        {asset && (
          <div className="mt-6 rounded-2xl bg-white/70 p-5">
            <p className="font-medium text-[var(--ink)]">
              Backend confirmation received
            </p>

            <p className="mt-2 break-all text-sm text-[var(--ink)]/60">
              Asset: {asset.id}
            </p>

            <p className="mt-1 text-sm text-[var(--ink)]/60">
              Status: {asset.status}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}