import type { Metadata } from "next";

import { ProductEditor } from "@/components/admin/product-editor";
import { getAdminProducts } from "@/lib/api/admin-catalog";

export const metadata: Metadata = {
  title: "Catalog Admin",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminPage() {
  const products = await getAdminProducts();

  return (
    <main className="min-h-screen bg-cream">
      <section className="page-shell py-14 sm:py-20">
        <div className="max-w-3xl">
          <p className="script text-2xl text-rose sm:text-3xl">
            behind the counter
          </p>

          <h1 className="serif mt-3 text-5xl font-semibold tracking-[-0.05em] text-ink sm:text-6xl">
            Catalog admin
          </h1>

          <p className="mt-5 max-w-xl leading-7 text-ink-soft">
            Manage storefront copy, pricing,
            visibility, featured gifts, and ordering.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {products.map((product) => (
            <ProductEditor
              key={product.id}
              product={product}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
