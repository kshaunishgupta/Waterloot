"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

async function verifyAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") throw new Error("Forbidden");
  return user;
}

export async function banUser(userId: string) {
  await verifyAdmin();
  const admin = createAdminClient();

  const { error: profileError } = await admin
    .from("profiles")
    .update({ is_banned: true })
    .eq("id", userId);

  if (profileError) {
    return { error: profileError.message };
  }

  // Ban the user in Supabase Auth
  const { error: authError } = await admin.auth.admin.updateUserById(userId, {
    ban_duration: "876000h",
  });

  if (authError) {
    return { error: authError.message };
  }

  revalidatePath("/admin/users");
  return { success: true };
}

export async function unbanUser(userId: string) {
  await verifyAdmin();
  const admin = createAdminClient();

  const { error: profileError } = await admin
    .from("profiles")
    .update({ is_banned: false })
    .eq("id", userId);

  if (profileError) {
    return { error: profileError.message };
  }

  const { error: authError } = await admin.auth.admin.updateUserById(userId, {
    ban_duration: "none",
  });

  if (authError) {
    return { error: authError.message };
  }

  revalidatePath("/admin/users");
  return { success: true };
}

export async function removeListing(listingId: string) {
  await verifyAdmin();
  const admin = createAdminClient();

  const { error } = await admin
    .from("listings")
    .update({ status: "removed" })
    .eq("id", listingId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/listings");
  revalidatePath("/browse");
  return { success: true };
}

export async function restoreListing(listingId: string) {
  await verifyAdmin();
  const admin = createAdminClient();

  const { error } = await admin
    .from("listings")
    .update({ status: "active" })
    .eq("id", listingId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/listings");
  revalidatePath("/browse");
  return { success: true };
}

export async function resolveReport(
  reportId: string,
  data: { status: "resolved" | "dismissed"; admin_notes?: string }
) {
  const user = await verifyAdmin();
  const admin = createAdminClient();

  const { error } = await admin
    .from("reports")
    .update({
      status: data.status,
      admin_notes: data.admin_notes || null,
      resolved_by: user.id,
    })
    .eq("id", reportId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/reports");
  return { success: true };
}

export async function promoteToAdmin(userId: string) {
  await verifyAdmin();
  const admin = createAdminClient();

  const { error } = await admin
    .from("profiles")
    .update({ role: "admin" })
    .eq("id", userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/users");
  return { success: true };
}

export async function removeWantedPost(postId: string) {
  await verifyAdmin();
  const admin = createAdminClient();

  const { error } = await admin
    .from("wanted_posts")
    .update({ status: "closed" })
    .eq("id", postId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/wanted");
  revalidatePath("/admin");
  return { success: true };
}

export async function demoteToStudent(userId: string) {
  await verifyAdmin();
  const admin = createAdminClient();

  const { error } = await admin
    .from("profiles")
    .update({ role: "student" })
    .eq("id", userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/users");
  return { success: true };
}
