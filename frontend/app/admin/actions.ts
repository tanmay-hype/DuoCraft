"use server";

import { revalidatePath } from "next/cache";

import { updateAdminProduct } from "@/lib/api/admin-catalog";

export type ProductActionState = {
  success: boolean;
  message: string;
};

export async function updateProductAction(
  _previousState: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  const productId = Number(formData.get("productId"));
  const basePriceRupees = Number(
    formData.get("basePrice"),
  );
  const salePriceRupees = Number(
    formData.get("salePrice"),
  );
  const displayOrder = Number(
    formData.get("displayOrder"),
  );

  if (!Number.isInteger(productId) || productId <= 0) {
    return {
      success: false,
      message: "Invalid product.",
    };
  }

  if (
    !Number.isFinite(basePriceRupees) ||
    basePriceRupees < 0 ||
    !Number.isFinite(salePriceRupees) ||
    salePriceRupees < 0
  ) {
    return {
      success: false,
      message: "Prices must be valid non-negative numbers.",
    };
  }

  if (
    !Number.isInteger(displayOrder) ||
    displayOrder < 0
  ) {
    return {
      success: false,
      message: "Display order must be a non-negative integer.",
    };
  }

  const name = String(
    formData.get("name") ?? "",
  ).trim();

  const category = String(
    formData.get("category") ?? "",
  ).trim();

  const description = String(
    formData.get("description") ?? "",
  ).trim();

  const badgeValue = String(
    formData.get("badge") ?? "",
  ).trim();

  if (!name || !category || !description) {
    return {
      success: false,
      message:
        "Name, category, and description are required.",
    };
  }

  try {
    await updateAdminProduct(productId, {
      name,
      category,
      description,

      // Admin UI accepts rupees.
      // Backend/database remain authoritative in paise.
      base_price: Math.round(basePriceRupees * 100),
      sale_price: Math.round(salePriceRupees * 100),

      badge: badgeValue || null,

      is_featured:
        formData.get("isFeatured") === "on",

      is_active:
        formData.get("isActive") === "on",

      display_order: displayOrder,
    });

    revalidatePath("/");
    revalidatePath("/catalog");
    revalidatePath("/admin");

    return {
      success: true,
      message: "Product saved.",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to update product.",
    };
  }
}