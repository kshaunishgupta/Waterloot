import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { updateListing } from "@/actions/listings";
import { ListingForm } from "@/components/listings/listing-form";

interface EditListingPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: EditListingPageProps) {
  const { id } = await params;
  return { title: `edit listing — Waterloot` };
}

export default async function EditListingPage({ params }: EditListingPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/listings/${id}/edit`);
  }

  const { data: listing } = await supabase
    .from("listings")
    .select("*")
    .eq("id", id)
    .single();

  if (!listing) notFound();
  if (listing.seller_id !== user.id) redirect(`/listings/${id}`);

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("display_order");

  const updateAction = updateListing.bind(null, id);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-white">edit listing</h1>
      <ListingForm
        categories={categories || []}
        initialData={listing}
        onSubmit={updateAction}
        isEditing={true}
      />
    </div>
  );
}
