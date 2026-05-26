import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { addOrderToGoogleSheets } from "@/lib/google-sheets";
import { getStoreApiBaseUrl } from "@/lib/store-api-url";
import { isStandaloneStore } from "@/lib/store-mode";

export const runtime = "nodejs";

type OrderPayload = {
  customer: {
    name: string;
    phone: string;
    city: string;
    address: string;
    carType?: string;
    carModel?: string;
    notes?: string;
    paymentMethod?: string;
  };
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    subtotal: number;
  }>;
  summary: {
    subtotal: number;
    deliveryFee: number;
    total: number;
    totalItems: number;
  };
  channel?: string;
};

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("ar-IQ", {
    style: "currency",
    currency: "IQD",
    maximumFractionDigits: 0,
  }).format(amount);

const buildTelegramMessage = (payload: OrderPayload, invoiceId: string) => {
  const itemsText = payload.items
    .map(
      (item, index) =>
        `${index + 1}. ${item.name} — ${item.quantity} × ${formatCurrency(
          item.price,
        )} = ${formatCurrency(item.subtotal)}`,
    )
    .join("\n");

  const message = [
    `🛍️ طلب جديد من الأطرقجي للسجاد والأثاث والمفروشات 🏪`,
    `📋 رقم الفاتورة: ${invoiceId}`,
    `👤 اسم العميل: ${payload.customer.name}`,
    `📱 رقم الهاتف: ${payload.customer.phone}`,
    `📍 المدينة: ${payload.customer.city}`,
    `🏠 المنطقة: ${payload.customer.address}`,
    `🪜 الطابق أو مدخل المنزل: ${payload.customer.carType || "—"}`,
    `⏰ وقت التوصيل المفضل: ${payload.customer.carModel || "—"}`,
    `💳 طريقة الدفع: ${payload.customer.paymentMethod || "الدفع عند الاستلام"}`,
    `📝 ملاحظات: ${payload.customer.notes || "لا توجد ملاحظات"}`,
    "",
    "🛒 تفاصيل الطلب:",
    itemsText,
    "",
    `💰 المجموع الفرعي: ${formatCurrency(payload.summary.subtotal)}`,
    `🚚 رسوم التوصيل: ${formatCurrency(payload.summary.deliveryFee)}`,
    `💵 الإجمالي: ${formatCurrency(payload.summary.total)}`,
    `📦 عدد المنتجات: ${payload.summary.totalItems}`,
    "",
    `🔗 القناة: ${payload.channel || "الموقع الإلكتروني"}`,
    `📅 التاريخ: ${new Date().toLocaleDateString("ar-IQ")} ${new Date().toLocaleTimeString("ar-IQ")}`,
  ].join("\n");

  return message;
};

const sendTelegramMessage = async (payload: OrderPayload, invoiceId: string) => {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHANNEL_ID) {
    return { ok: false, reason: "missing_telegram_config" };
  }

  const message = buildTelegramMessage(payload, invoiceId);
  const formData = new FormData();
  formData.append("chat_id", TELEGRAM_CHANNEL_ID);
  formData.append("text", message);

  const response = await fetch(
    `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: "POST",
      body: formData,
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[Telegram] sendMessage failed:", response.status, errorText);
    return { ok: false, reason: errorText || "telegram_request_failed" };
  }

  return { ok: true };
};

async function postOrderToLaravel(
  payload: OrderPayload,
): Promise<
  { ok: true; invoiceId: string; storeToken?: string } | { ok: false; status: number; body: unknown }
> {
  const base = getStoreApiBaseUrl();
  if (!base) {
    return { ok: false, status: 500, body: { message: "STORE_API_BASE_URL غير مضبوط" } };
  }
  const res = await fetch(`${base}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });
  const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    return { ok: false, status: res.status, body };
  }
  const invoiceId = typeof body.invoiceId === "string" ? body.invoiceId : "";
  if (!invoiceId) {
    return { ok: false, status: 502, body: { message: "استجابة غير متوقعة من الخادم." } };
  }
  const storeToken = typeof body.storeToken === "string" ? body.storeToken : undefined;
  return { ok: true, invoiceId, storeToken };
}

function flattenLaravelErrorMessage(body: unknown): string {
  if (!body || typeof body !== "object") return "";
  const o = body as Record<string, unknown>;
  const errs = o.errors;
  if (errs && typeof errs === "object" && errs !== null) {
    const parts: string[] = [];
    for (const v of Object.values(errs as Record<string, unknown>)) {
      if (Array.isArray(v)) {
        for (const x of v) {
          if (typeof x === "string" && x.trim()) parts.push(x.trim());
        }
      } else if (typeof v === "string" && v.trim()) {
        parts.push(v.trim());
      }
    }
    if (parts.length) return parts.join(" ");
  }
  if (typeof o.message === "string" && o.message.trim()) return o.message.trim();
  return "";
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as OrderPayload;

    if (!payload?.customer?.name || !payload?.items?.length) {
      return NextResponse.json(
        { message: "بيانات الطلب غير مكتملة." },
        { status: 400 },
      );
    }

    const hasApi = !isStandaloneStore() && !!getStoreApiBaseUrl();
    const hasTelegram = !!(TELEGRAM_BOT_TOKEN && TELEGRAM_CHANNEL_ID);
    const hasSheets = !!process.env.GOOGLE_APPS_SCRIPT_URL?.trim();

    if (!hasApi && !hasTelegram && !hasSheets) {
      const message = isStandaloneStore()
        ? "لم يُضبط التكامل: أضف تيليغرام (`TELEGRAM_BOT_TOKEN` و `TELEGRAM_CHANNEL_ID`) و/أو `GOOGLE_APPS_SCRIPT_URL`."
        : "لم يُضبط التكامل: عيّن `STORE_API_BASE_URL` لربط الطلبات بلوحة التحكم، أو أضف تيليغرام و/أو Google Sheets.";
      return NextResponse.json({ message }, { status: 500 });
    }

    let invoiceId: string;
    let storeToken: string | undefined;

    if (hasApi) {
      const laravel = await postOrderToLaravel(payload);
      if (!laravel.ok) {
        const b = laravel.body as { message?: string; errors?: Record<string, string[] | string> };
        const flat = flattenLaravelErrorMessage(laravel.body);
        return NextResponse.json(
          {
            message:
              flat ||
              (typeof b?.message === "string" ? b.message : "") ||
              "تعذر تسجيل الطلب في لوحة التحكم.",
            errors: b?.errors,
          },
          { status: laravel.status >= 400 && laravel.status < 600 ? laravel.status : 502 },
        );
      }
      invoiceId = laravel.invoiceId;
      storeToken = laravel.storeToken;
    } else {
      invoiceId = randomUUID().slice(0, 8).toUpperCase();
    }

    if (hasTelegram) {
      const telegramResult = await sendTelegramMessage(payload, invoiceId);
      if (!telegramResult.ok && !hasApi && !hasSheets) {
        const reason =
          typeof telegramResult.reason === "string" ? telegramResult.reason : "";
        console.error("[Checkout] Telegram error:", reason);
        const isForbidden =
          /chat not found|have no rights|not found|unauthorized|wrong token/i.test(
            reason,
          );
        const hint = isForbidden
          ? "تأكد أن البوت مضاف للقناة كمسؤول (Admin) ولديه صلاحية نشر الرسائل."
          : "";
        return NextResponse.json(
          {
            message: hint
              ? `تعذر إرسال الطلب عبر تلجرام. ${hint}`
              : "تعذر إرسال الطلب عبر تلجرام حالياً.",
          },
          { status: 502 },
        );
      }
      if (!telegramResult.ok && hasApi) {
        console.warn(
          "[Checkout] Telegram failed after Laravel success (order saved):",
          telegramResult.reason,
        );
      }
    }

    try {
      await addOrderToGoogleSheets({
        ...payload,
        invoiceId,
      });
    } catch (error) {
      console.error("Failed to add order to Google Sheets:", error);
    }

    return NextResponse.json({
      message: "تم استلام طلبك بنجاح.",
      invoiceId,
      ...(storeToken ? { storeToken } : {}),
    });
  } catch {
    return NextResponse.json(
      { message: "تعذر معالجة الطلب حالياً." },
      { status: 500 },
    );
  }
}
