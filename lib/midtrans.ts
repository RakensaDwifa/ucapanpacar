import crypto from "node:crypto";

const MIDTRANS_MODE = () => process.env.MIDTRANS_MODE ?? "sandbox";

const SNAP_URL = () =>
  MIDTRANS_MODE() === "production"
    ? "https://app.midtrans.com/snap/v1/transactions"
    : "https://app.sandbox.midtrans.com/snap/v1/transactions";

const API_URL = () =>
  MIDTRANS_MODE() === "production"
    ? "https://api.midtrans.com/v2"
    : "https://api.sandbox.midtrans.com/v2";

export function midtransConfigured(): boolean {
  return Boolean(process.env.MIDTRANS_SERVER_KEY);
}

export async function createSnapTransaction(input: {
  ucapanId: string;
  merchantRef: string;
  templateSlug: string;
  customerName: string;
  customerEmail?: string;
}): Promise<{ ok: boolean; paymentUrl?: string; error?: string }> {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) {
    return { ok: false, error: "PAYMENT_NOT_CONFIGURED" };
  }

  const authString = Buffer.from(`${serverKey}:`).toString("base64");
  const baseUrl = process.env.APP_URL ?? "http://localhost:3000";
  const callbackUrl = process.env.MIDTRANS_CALLBACK_URL ?? `${baseUrl}/api/payment/webhook`;
  const returnUrl = `${baseUrl}/checkout/${input.ucapanId}/selesai?ref=${input.merchantRef}`;

  try {
    const res = await fetch(SNAP_URL(), {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Basic ${authString}`,
        "X-Override-Notification": callbackUrl,
      },
      body: JSON.stringify({
        transaction_details: {
          order_id: input.merchantRef,
          gross_amount: 8900,
        },
        item_details: [
          {
            id: `TEMPLATE-${input.templateSlug}`,
            price: 8900,
            quantity: 1,
            name: `Template Ucapan (${input.templateSlug})`,
          },
        ],
        customer_details: {
          first_name: input.customerName.slice(0, 50),
          email: input.customerEmail ?? "pelanggan@ucapanpacar.com",
        },
        enabled_payments: ["qris", "gopay", "shopeepay", "ovo", "dana"],
        callbacks: {
          finish: returnUrl,
        },
      }),
      cache: "no-store",
    });

    const json = await res.json();
    if (!res.ok || !json.token) {
      return { ok: false, error: json.message ?? json.error_messages?.[0] ?? "MIDTRANS_ERROR" };
    }

    return {
      ok: true,
      paymentUrl: json.redirect_url ?? undefined,
    };
  } catch {
    return { ok: false, error: "NETWORK_ERROR" };
  }
}

export function verifyMidtransSignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  receivedSignature: string
): boolean {
  const serverKey = process.env.MIDTRANS_SERVER_KEY ?? "";
  if (!serverKey) return false;

  const raw = orderId + statusCode + grossAmount + serverKey;
  const computed = crypto.createHash("sha512").update(raw).digest("hex");
  return computed === receivedSignature;
}

export async function checkMidtransStatus(
  orderId: string
): Promise<{ ok: boolean; status?: string }> {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) return { ok: false };

  const authString = Buffer.from(`${serverKey}:`).toString("base64");

  try {
    const res = await fetch(`${API_URL()}/${encodeURIComponent(orderId)}/status`, {
      headers: {
        Accept: "application/json",
        Authorization: `Basic ${authString}`,
      },
      cache: "no-store",
    });

    const json = await res.json();
    if (!res.ok) return { ok: false };

    const txStatus = json.transaction_status;
    let normalized = "PENDING";
    if (txStatus === "settlement" || txStatus === "capture") {
      normalized = "PAID";
    } else if (["cancel", "deny", "expire"].includes(txStatus)) {
      normalized = "FAILED";
    }

    return { ok: true, status: normalized };
  } catch {
    return { ok: false };
  }
}