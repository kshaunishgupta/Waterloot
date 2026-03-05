import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM ?? "help@uwaterloot.ca";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://uwaterloot.ca";
const HOOK_SECRET = process.env.SEND_EMAIL_HOOK_SECRET;

export async function POST(req: NextRequest) {
  // Verify the request is from Supabase
  if (HOOK_SECRET) {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || authHeader !== `Bearer ${HOOK_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const body = await req.json();
  const { user, email_data } = body;

  if (!user?.email || !email_data) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { token, token_hash, redirect_to, email_action_type } = email_data;
  const email = user.email;

  try {
    if (email_action_type === "signup") {
      const confirmUrl = `${SITE_URL}/auth/confirm-email?token_hash=${token_hash}&type=signup&next=${encodeURIComponent(redirect_to || "/browse")}`;

      await resend.emails.send({
        from: FROM,
        to: email,
        subject: "Confirm your Waterloot account",
        html: buildSignupEmail(confirmUrl),
      });
    } else if (email_action_type === "recovery") {
      const resetUrl = `${SITE_URL}/auth/callback?token_hash=${token_hash}&type=recovery&next=/reset-password`;

      await resend.emails.send({
        from: FROM,
        to: email,
        subject: "Reset your Waterloot password",
        html: buildPasswordResetEmail(resetUrl),
      });
    } else if (email_action_type === "email_change") {
      const confirmUrl = `${SITE_URL}/auth/callback?token_hash=${token_hash}&type=email_change`;

      await resend.emails.send({
        from: FROM,
        to: email,
        subject: "Confirm your new Waterloot email",
        html: buildEmailChangeEmail(confirmUrl),
      });
    } else if (email_action_type === "invite") {
      const inviteUrl = `${SITE_URL}/auth/callback?token_hash=${token_hash}&type=invite`;

      await resend.emails.send({
        from: FROM,
        to: email,
        subject: "You've been invited to Waterloot",
        html: buildSignupEmail(inviteUrl),
      });
    }

    return NextResponse.json({});
  } catch (err: any) {
    console.error("[send-email hook]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

function baseEmail(content: string) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#171717;border:1px solid #262626;max-width:560px;width:100%;">
        <tr>
          <td style="padding:32px 40px;border-bottom:1px solid #262626;">
            <span style="font-size:24px;font-weight:800;color:#eab308;letter-spacing:-0.5px;">Waterloot</span>
          </td>
        </tr>
        <tr>
          <td style="padding:40px;">
            ${content}
          </td>
        </tr>
        <tr>
          <td style="padding:24px 40px;border-top:1px solid #262626;">
            <p style="margin:0;font-size:12px;color:#525252;">University of Waterloo student marketplace. If you didn't request this email, you can safely ignore it.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildSignupEmail(url: string) {
  return baseEmail(`
    <h1 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#ffffff;">Confirm your email</h1>
    <p style="margin:0 0 28px;font-size:15px;color:#a3a3a3;line-height:1.6;">
      Thanks for signing up for Waterloot. Click the button below to confirm your email address and activate your account.
    </p>
    <a href="${url}" style="display:inline-block;background:#ca8a04;color:#ffffff;font-size:14px;font-weight:600;padding:12px 28px;text-decoration:none;letter-spacing:0.3px;">
      Confirm email
    </a>
    <p style="margin:28px 0 0;font-size:13px;color:#525252;">
      Or copy this link into your browser:<br/>
      <span style="color:#a3a3a3;word-break:break-all;">${url}</span>
    </p>
  `);
}

function buildPasswordResetEmail(url: string) {
  return baseEmail(`
    <h1 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#ffffff;">Reset your password</h1>
    <p style="margin:0 0 28px;font-size:15px;color:#a3a3a3;line-height:1.6;">
      We received a request to reset your Waterloot password. Click the button below to choose a new password. This link expires in 1 hour.
    </p>
    <a href="${url}" style="display:inline-block;background:#ca8a04;color:#ffffff;font-size:14px;font-weight:600;padding:12px 28px;text-decoration:none;letter-spacing:0.3px;">
      Reset password
    </a>
    <p style="margin:28px 0 0;font-size:13px;color:#525252;">
      Or copy this link into your browser:<br/>
      <span style="color:#a3a3a3;word-break:break-all;">${url}</span>
    </p>
  `);
}

function buildEmailChangeEmail(url: string) {
  return baseEmail(`
    <h1 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#ffffff;">Confirm your new email</h1>
    <p style="margin:0 0 28px;font-size:15px;color:#a3a3a3;line-height:1.6;">
      Click the button below to confirm your new email address for Waterloot.
    </p>
    <a href="${url}" style="display:inline-block;background:#ca8a04;color:#ffffff;font-size:14px;font-weight:600;padding:12px 28px;text-decoration:none;letter-spacing:0.3px;">
      Confirm new email
    </a>
    <p style="margin:28px 0 0;font-size:13px;color:#525252;">
      Or copy this link into your browser:<br/>
      <span style="color:#a3a3a3;word-break:break-all;">${url}</span>
    </p>
  `);
}
