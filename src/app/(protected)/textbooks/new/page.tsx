import { createClient } from "@/lib/supabase/server";
import { createListing } from "@/actions/listings";
import { ListingForm } from "@/components/listings/listing-form";

export default async function NewTextbookPage() {
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("display_order");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Find the textbooks category ID
  const textbookCategory = categories?.find((c) => c.slug === "textbooks");

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      <h1 className="mb-6 text-2xl font-bold text-white">
        sell a textbook
      </h1>
      <div className="border border-neutral-800 bg-neutral-900 p-6">
        <ListingForm
          categories={categories || []}
          initialData={{
            seller_id: user?.id,
            ...(textbookCategory ? { category_id: textbookCategory.id } : {}),
          }}
          onSubmit={createListing}
        />
      </div>
    </div>
  );
}
