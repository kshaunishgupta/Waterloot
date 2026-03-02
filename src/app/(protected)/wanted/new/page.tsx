import { createClient } from "@/lib/supabase/server";
import { WantedForm } from "@/components/wanted/wanted-form";
import { createWantedPost } from "@/actions/wanted";

export default async function NewWantedPage() {
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("display_order");

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          Post a Wanted Listing
        </h1>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          Let other students know what you&apos;re looking to buy.
        </p>
      </div>
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
        <WantedForm categories={categories || []} onSubmit={createWantedPost} />
      </div>
    </div>
  );
}
