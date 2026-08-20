import "server-only";
import { Resend } from "resend";

const FROM = "UcapanPacar <onboarding@resend.dev>";

function resend(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

function appBaseUrl(): string {
  return (
    process.env.APP_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000"
  );
}

function layout(title: string, bodyHtml: string): string {
  return `<!doctype html>
<html lang="id">
  <body style="margin:0;padding:0;background:#fdf2f5;font-family:Arial,Helvetica,sans-serif;color:#3a1a24;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fdf2f5;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 12px 40px rgba(217,108,138,0.18);">
            <tr>
              <td style="background:linear-gradient(135deg,#d96c8a,#e89bb0);padding:28px 32px;text-align:center;">
                <div style="font-size:20px;font-weight:bold;color:#ffffff;letter-spacing:0.5px;">💌 UcapanPacar</div>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <h1 style="margin:0 0 16px;font-size:22px;color:#d96c8a;">${title}</h1>
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;background:#fdf2f5;text-align:center;font-size:12px;color:#b07a88;">
                UcapanPacar — website ucapan digital untuk orang tersayang
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function ctaButton(href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;"><tr><td style="border-radius:999px;background:linear-gradient(135deg,#d96c8a,#e89bb0);"><a href="${href}" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:bold;color:#ffffff;text-decoration:none;border-radius:999px;">${label}</a></td></tr></table>`;
}

export async function sendPaymentSuccessEmail(input: {
  to: string;
  fromName: string;
  toName: string;
  templateSlug: string;
  ucapanId: string;
}): Promise<{ ok: boolean; error?: string }> {
  const client = resend();
  if (!client) return { ok: false, error: "RESEND_NOT_CONFIGURED" };

  const url = `${appBaseUrl()}/t/${input.templateSlug}/${input.ucapanId}`;
  const html = layout(
    "Ucapan kamu sudah aktif! 🎉",
    `<p style="margin:0 0 12px;line-height:1.7;">Hai <b>${input.fromName}</b>,</p>
     <p style="margin:0 0 12px;line-height:1.7;">Ucapan untuk <b>${input.toName}</b> sudah aktif dan bisa dibagikan sekarang.</p>
     ${ctaButton(url, "Lihat Ucapanmu 💕")}
     <p style="margin:0;line-height:1.7;font-size:13px;color:#b07a88;">Atau buka link ini: <a href="${url}" style="color:#d96c8a;">${url}</a></p>`
  );

  const { error } = await client.emails.send({
    from: FROM,
    to: [input.to],
    subject: "Ucapan kamu sudah aktif 🎉",
    html,
  });
  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function sendAdminTransactionEmail(input: {
  to: string;
  fromName: string;
  toName: string;
  templateSlug: string;
  amount: number;
}): Promise<{ ok: boolean; error?: string }> {
  const client = resend();
  if (!client) return { ok: false, error: "RESEND_NOT_CONFIGURED" };

  const html = layout(
    "Transaksi baru 💰",
    `<p style="margin:0 0 12px;line-height:1.7;">Ada transaksi baru di UcapanPacar.</p>
     <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fdf2f5;border-radius:12px;padding:16px;font-size:14px;">
       <tr><td style="padding:4px 0;color:#b07a88;">Dari</td><td style="padding:4px 0;font-weight:bold;text-align:right;">${input.fromName}</td></tr>
       <tr><td style="padding:4px 0;color:#b07a88;">Untuk</td><td style="padding:4px 0;font-weight:bold;text-align:right;">${input.toName}</td></tr>
       <tr><td style="padding:4px 0;color:#b07a88;">Template</td><td style="padding:4px 0;font-weight:bold;text-align:right;">${input.templateSlug}</td></tr>
       <tr><td style="padding:4px 0;color:#b07a88;">Nominal</td><td style="padding:4px 0;font-weight:bold;text-align:right;">Rp ${input.amount.toLocaleString("id-ID")}</td></tr>
     </table>`
  );

  const { error } = await client.emails.send({
    from: FROM,
    to: [input.to],
    subject: `Transaksi baru: ${input.fromName} → ${input.toName} 💰`,
    html,
  });
  return error ? { ok: false, error: error.message } : { ok: true };
}