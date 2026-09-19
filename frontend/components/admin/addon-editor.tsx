"use client";

import { useActionState } from "react";

import {
  type AddonActionState,
  updateAddonAction,
} from "@/app/admin/actions";
import type { AdminAddon } from "@/types/admin";

interface AddonEditorProps {
  addon: AdminAddon;
}

const initialState: AddonActionState = {
  success: false,
  message: "",
};

export function AddonEditor({
  addon,
}: AddonEditorProps) {
  const [state, formAction, pending] = useActionState(
    updateAddonAction,
    initialState,
  );

  return (
    <form
      action={formAction}
      className="rounded-[1.8rem_1.2rem_2rem_1.4rem] border border-line bg-paper p-6 shadow-[var(--shadow-paper)]"
    >
      <input
        type="hidden"
        name="addonId"
        value={addon.id}
      />

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-rose">
            {addon.slug}
          </p>

          <h3 className="serif mt-2 text-2xl font-semibold text-ink">
            {addon.name}
          </h3>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${
            addon.is_active
              ? "bg-rose/10 text-berry"
              : "bg-ink/5 text-ink-muted"
          }`}
        >
          {addon.is_active ? "Active" : "Hidden"}
        </span>
      </div>

      <div className="mt-7 grid gap-5">
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-ink">
            Name
          </span>

          <input
            name="name"
            defaultValue={addon.name}
            required
            className="rounded-xl border border-line bg-cream px-4 py-3 text-ink outline-none transition focus:border-berry"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-semibold text-ink">
            Description
          </span>

          <textarea
            name="description"
            defaultValue={addon.description}
            required
            rows={3}
            className="resize-y rounded-xl border border-line bg-cream px-4 py-3 text-ink outline-none transition focus:border-berry"
          />
        </label>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-ink">
              Price (₹)
            </span>

            <input
              type="number"
              name="price"
              min="0"
              step="1"
              defaultValue={addon.price / 100}
              required
              className="rounded-xl border border-line bg-cream px-4 py-3 text-ink outline-none transition focus:border-berry"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-ink">
              Display order
            </span>

            <input
              type="number"
              name="displayOrder"
              min="0"
              step="1"
              defaultValue={addon.display_order}
              required
              className="rounded-xl border border-line bg-cream px-4 py-3 text-ink outline-none transition focus:border-berry"
            />
          </label>
        </div>

        <label className="flex items-center gap-2 text-sm font-semibold text-ink">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={addon.is_active}
            className="size-4 accent-[var(--color-berry)]"
          />
          Active
        </label>
      </div>

      <div className="mt-7 flex items-center justify-between gap-4 border-t border-line pt-5">
        <p
          aria-live="polite"
          className={
            state.success
              ? "text-sm text-berry"
              : "text-sm text-ink-muted"
          }
        >
          {state.message}
        </p>

        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-berry px-5 py-2.5 text-sm font-bold text-paper transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Saving..." : "Save changes"}
        </button>
      </div>
    </form>
  );
}