import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { contactFormSchema } from "@/lib/validations/contact";
import { checkRateLimit } from "@/lib/rateLimit";

const isDev = process.env.NODE_ENV === "development";

const ALLOWED_ORIGINS = new Set(
  (process.env.ALLOWED_ORIGINS || "https://tombergson.eu")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean)
);
const ALLOWED_HOSTNAMES = new Set([...ALLOWED_ORIGINS].map((o) => new URL(o).hostname));
const MAX_BODY_BYTES = 10_000;

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-real-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

function fail(message: string, status: number) {
  return NextResponse.json({ success: false, message }, { status });
}

export async function POST(request: NextRequest) {
  try {
    // 1. Origin + Content-Type (blokuje cross-site POST jako text/plain)
    if (!isDev) {
      const origin = request.headers.get("origin");
      if (!origin || !ALLOWED_ORIGINS.has(origin)) {
        return fail("Forbidden.", 403);
      }
    }
    if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) {
      return fail("Unsupported media type.", 415);
    }

    // 2. Rate limiting
    const ip = getClientIp(request);
    if (!checkRateLimit(ip).allowed) {
      return fail("Too many requests. Please try again later.", 429);
    }

    // 3. Body: limit rozmiaru + bezpieczny parse
    const declaredLength = Number(request.headers.get("content-length") || 0);
    if (declaredLength > MAX_BODY_BYTES) {
      return fail("Payload too large.", 413);
    }
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) {
      return fail("Payload too large.", 413);
    }

    let body: unknown;
    try {
      body = JSON.parse(raw);
    } catch {
      return fail("Nieprawidłowe dane.", 400);
    }
    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      return fail("Nieprawidłowe dane.", 400);
    }

    const { turnstileToken, ...formData } = body as Record<string, unknown>;

    // 4. Walidacja Zod (przed zewnętrznym wywołaniem)
    const { name, email, message } = contactFormSchema.parse(formData);

    // 5. Turnstile (w dev użyj testowego secretu Cloudflare w .env.local)
    if (typeof turnstileToken !== "string" || !turnstileToken || turnstileToken.length > 2048) {
      return fail("Brak tokenu weryfikacji CAPTCHA.", 400);
    }

    const secret = process.env.TURNSTILE_SECRET_KEY;
    if (!secret) {
      console.error("CONFIG_ERROR: brak TURNSTILE_SECRET_KEY");
      return fail("Wystąpił błąd serwera.", 500);
    }

    const turnstileRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: turnstileToken, remoteip: ip }),
      signal: AbortSignal.timeout(8000),
    });
    const turnstileResult = (await turnstileRes.json()) as { success?: boolean; hostname?: string };

    if (!turnstileResult.success || (!isDev && !ALLOWED_HOSTNAMES.has(turnstileResult.hostname ?? ""))) {
      return fail("Niepomyślna weryfikacja bezpieczeństwa (CAPTCHA).", 400);
    }

    // 6. Resend
    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      console.error("CONFIG_ERROR: brak RESEND_API_KEY");
      return fail("Wystąpił błąd serwera.", 500);
    }

    const safeSubjectName = name.replace(/[\r\n]+/g, " ").slice(0, 100);

    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendKey}`,
        },
        body: JSON.stringify({
          from: "Tom Bergson <studio@tombergson.eu>",
          to: [process.env.CONTACT_EMAIL_TO || "studio@tombergson.eu"],
          reply_to: email,
          subject: `[Tom Bergson] Nowa wiadomość od ${safeSubjectName}`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; color: #111; line-height: 1.6;">
              <h2>Nowa wiadomość z formularza kontaktowego</h2>
              <p><strong>Imię i nazwisko:</strong> ${escapeHtml(name)}</p>
              <p><strong>Email nadawcy:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
              <p><strong>Treść wiadomości:</strong></p>
              <p style="white-space: pre-wrap; background: #f9f9f9; padding: 15px; border-radius: 6px; border: 1px solid #e5e5e5;">${escapeHtml(message)}</p>
            </div>
          `,
        }),
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        console.error("RESEND_API_ERROR:", { status: response.status, body: await response.text() });
        return fail("Email could not be sent. Please try again later.", 502);
      }

      return NextResponse.json({ success: true });
    } catch (networkError) {
      if (isDev) {
        console.warn("DEV_MODE: błąd sieci do Resend, symuluję sukces.");
        return NextResponse.json({ success: true });
      }
      throw networkError;
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, errors: error.issues }, { status: 400 });
    }

    console.error("INTERNAL_SERVER_ERROR:", {
      type: error instanceof Error ? error.constructor.name : typeof error,
      message: error instanceof Error ? error.message : String(error),
    });

    return fail("Wystąpił błąd podczas wysyłania wiadomości. Spróbuj ponownie później.", 500);
  }
}