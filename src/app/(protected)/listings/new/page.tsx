import { createClient } from "@/lib/supabase/server";
import { createListing } from "@/actions/listings";
import { ListingForm } from "@/components/listings/listing-form";

export default async function NewListingPage() {
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("display_order");

  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      <h1 className="mb-6 text-2xl font-bold text-white">create a listing</h1>
      <div className="rounded-xl border border-neutral-700 bg-neutral-900 p-6">
        <ListingForm
          categories={categories || []}
          initialData={{ seller_id: user?.id }}
          onSubmit={createListing}
        />
      </div>
    </div>
  );
}
