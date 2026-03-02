"use server";

import { createClient } from "@/lib/supabase/server";

export async function createReport(data: {
  listing_id?: string;
  reported_user_id?: string;
  reason: string;
  description?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in" };
  }

  const { error } = await supabase.from("reports").insert({
    reporter_id: user.id,
    listing_id: data.listing_id || null,
    reported_user_id: data.reported_user_id || null,
    reason: data.reason,
    description: data.description || null,
  });

  if (error) {
    return { error: error.message };
  }

  // Send notification email if Resend API key is configured
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    const listingUrl = data.listing_id
      ? `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/listings/${data.listing_id}`
      : "N/A";
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Waterloot Reports <noreply@waterloot.ca>",
        to: ["waterloothelp@gmail.com"],
        subject: `[Report] ${data.reason}`,
        text: [
          `A new report has been submitted on Waterloot.`,
          ``,
          `Reason: ${data.reason}`,
          `Details: ${data.description || "none"}`,
          `Listing: ${listingUrl}`,
          `Reporter ID: ${user.id}`,
          `Reported user ID: ${data.reported_user_id || "none"}`,
        ].join("\n"),
      }),
    }).catch(() => {
      // Non-fatal — report is already saved to DB
    });
  }

  return { success: true };
}
