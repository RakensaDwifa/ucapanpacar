import { getUcapan } from "./store";

const TRIPAY_BASE = () =>
  process.env.TRIPAY_MODE === "production"
    ? "https://tripay.co.id/api/"
    : "https://tripay.co.id/api-sandbox/";

export function tripayConfigured(): boolean {
  return Boolean(
    process.env.TRIPAY_API_KEY && process.env.TRIPAY_PRIVATE_KEY && process.env.TRIPAY_MERCHANT_CODE
  );
}

interface TripayChannel {
  group: string;
  code: string;
  name: string;
  type: string;
  active: boolean;
}

export async function getPaymentChannels(): Promise<TripayChannel[]> {
  if (!tripayConfigured()) return [];
  try {
    const res = await fetch(`${TRIPAY_BASE()}merchant/payment-channel`, {
      headers: {
        Authorization: `Bearer ${process.env.TRIPAY_PRIVATE_KEY}`,
        "X-API-Key": process.env.TRIPAY_API_KEY!,
        Accept: "application/json",
      },
      cache: "no-store",
    });
    if (!res.ok) return [];
    const json = await res.json();
    return (json.data ?? []).filter((c: TripayChannel) => c.active === true);
  } catch {
    return [];
  }
}

export async function createTripayTransaction(input: {
  ucapanId: string;
  method: string;
  customerName: string;
  customerEmail?: string;
}): Promise<{ ok: boolean; paymentUrl?: string; error?: string }> {
  if (!tripayConfigured()) {
    return { ok: false, error: "PAYMENT_NOT_CONFIGURED" };
  }

  const ucapan = getUcapan(input.ucapanId);
  if (!ucapan) return { ok: false, error: "UCAPAN_NOT_FOUND" };

  const merchantRef = `UP-${input.ucapanId.slice(0, 8)}-${Date.now().toString(36).toUpperCase()}`;
  const baseUrl = process.env.APP_URL ?? "http://localhost:3000";
  const callbackUrl = process.env.TRIPAY_CALLBACK_URL ?? `${baseUrl}/api/payment/webhook`;
  const returnUrl = `${baseUrl}/checkout/${input.ucapanId}/selesai?ref=${merchantRef}`;

  try {
    const res = await fetch(`${TRIPAY_BASE()}transaction/create`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.TRIPAY_PRIVATE_KEY}`,
        "X-API-Key": process.env.TRIPAY_API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        method: input.method,
        merchant_ref: merchantRef,
        amount: 8900,
        customer_name: input.customerName.slice(0, 50),
        customer_email: input.customerEmail ?? undefined,
        order_items: [
          {
            sku: `TEMPLATE-${ucapan.templateSlug}`,
            name: `Template ${ucapan.templateSlug}`,
            price: 8900,
            quantity: 1,
          },
        ],
        callback_url: callbackUrl,
        return_url: returnUrl,
        expiry_time: 24 * 60,
      }),
      cache: "no-store",
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      return { ok: false, error: json.message ?? "TRIPAY_ERROR" };
    }
    return {
      ok: true,
      paymentUrl: json.data.payment_url ?? undefined,
    };
  } catch {
    return { ok: false, error: "NETWORK_ERROR" };
  }
}

export async function checkTripayStatus(
  reference: string
): Promise<{ ok: boolean; status?: string }> {
  if (!tripayConfigured()) return { ok: false };
  try {
    const res = await fetch(
      `${TRIPAY_BASE()}transaction/detail?reference=${encodeURIComponent(reference)}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.TRIPAY_PRIVATE_KEY}`,
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );
    const json = await res.json();
    if (!res.ok || !json.success) return { ok: false };
    return { ok: true, status: json.data.status };
  } catch {
    return { ok: false };
  }
}
