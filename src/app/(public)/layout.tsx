import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let navbarUser = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, role")
      .eq("id", user.id)
      .single();
    if (profile) {
      navbarUser = {
        id: profile.id,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        role: profile.role,
      };
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 dark:bg-neutral-950">
      <Navbar user={navbarUser} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
