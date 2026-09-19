import "server-only";

import type {
  AdminAddon,
  AdminAddonUpdate,
  AdminProduct,
  AdminProductUpdate,
} from "@/types/admin";

const API_URL =
  process.env.API_URL ??
  "http://localhost:8000";

function getAdminApiKey(): string {
  const key = process.env.ADMIN_API_KEY;

  if (!key) {
    throw new Error(
      "ADMIN_API_KEY is not configured.",
    );
  }

  return key;
}

function adminHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    "X-Admin-Key": getAdminApiKey(),
  };
}

export async function getAdminProducts(): Promise<
  AdminProduct[]
> {
  const response = await fetch(
    `${API_URL}/admin/products`,
    {
      headers: adminHeaders(),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch admin products: ${response.status}`,
    );
  }

  return (await response.json()) as AdminProduct[];
}

export async function updateAdminProduct(
  productId: number,
  data: AdminProductUpdate,
): Promise<AdminProduct> {
  const response = await fetch(
    `${API_URL}/admin/products/${productId}`,
    {
      method: "PATCH",
      headers: adminHeaders(),
      body: JSON.stringify(data),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    let detail = "Failed to update product.";

    try {
      const body = (await response.json()) as {
        detail?: string;
      };

      if (body.detail) {
        detail = body.detail;
      }
    } catch {
      // Keep the generic message.
    }

    throw new Error(detail);
  }

  return (await response.json()) as AdminProduct;
}

export async function getAdminAddons(): Promise<
  AdminAddon[]
> {
  const response = await fetch(
    `${API_URL}/admin/addons`,
    {
      headers: adminHeaders(),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch admin add-ons: ${response.status}`,
    );
  }

  return (await response.json()) as AdminAddon[];
}

export async function updateAdminAddon(
  addonId: number,
  data: AdminAddonUpdate,
): Promise<AdminAddon> {
  const response = await fetch(
    `${API_URL}/admin/addons/${addonId}`,
    {
      method: "PATCH",
      headers: adminHeaders(),
      body: JSON.stringify(data),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    let detail = "Failed to update add-on.";

    try {
      const body = (await response.json()) as {
        detail?: string;
      };

      if (body.detail) {
        detail = body.detail;
      }
    } catch {
      // Keep generic message.
    }

    throw new Error(detail);
  }

  return (await response.json()) as AdminAddon;
}