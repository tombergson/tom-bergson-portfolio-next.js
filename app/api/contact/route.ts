import { NextResponse, type NextRequest } from "next/server";
import { contactFormSchema } from "@/lib/validations/contact";
import { checkRateLimit } from "@/lib/rateLimit";
import { z } from "zod";

/**
 * Escapes HTML special characters to prevent injection in email templates
 */
function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting per IP address
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    const rateLimitResult = checkRateLimit(ip);

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { success: false, message: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { turnstileToken, ...formData } = body;

    const isDev = process.env.NODE_ENV !== "production";

    // 1. Weryfikacja tokenu Cloudflare Turnstile (pomijamy w trybie deweloperskim)
    if (!isDev) {
      if (!turnstileToken) {
        return NextResponse.json(
          { success: false, message: "Brak tokenu weryfikacji CAPTCHA." },
          { status: 400 }
        );
      }

      const turnstileRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          secret: process.env.TURNSTILE_SECRET_KEY || "",
          response: turnstileToken,
        }),
      });

      const turnstileResult = await turnstileRes.json();

      if (!turnstileResult.success) {
        return NextResponse.json(
          { success: false, message: "Niepomyślna weryfikacja bezpieczeństwa (CAPTCHA)." },
          { status: 400 }
        );
      }
    } else {
      console.log("DEV_MODE: Pomijam weryfikację Cloudflare Turnstile.");
    }

    // 2. Walidacja Zod dla danych formularza
    const validatedData = contactFormSchema.parse(formData);
    const { name, email, message } = validatedData;

    // 3. Wywołanie Resend API z zabezpieczeniem sieciowym dla macOS
    try {
      console.log("Wysyłam e-mail przez Resend API...");
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "Tom Bergson <studio@tombergson.eu>",
          to: [process.env.CONTACT_EMAIL_TO || "studio@tombergson.eu"],
          reply_to: email,
          subject: `[Tom Bergson] Nowa wiadomość od ${escapeHtml(name)}`,
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
      });

      const resData = await response.json();

      if (!response.ok) {
        console.error("RESEND_API_ERROR:", { status: response.status, resData });
        return NextResponse.json(
          { success: false, message: "Email could not be sent. Please try again later." },
          { status: response.status }
        );
      }

      console.log("EMAIL_SENT_SUCCESS", { messageId: resData?.id });
      return NextResponse.json({ success: true, data: { id: resData?.id } });

    } catch (networkError) {
      // Jeśli jesteśmy na lokalnym Macu i sieć ucięła fetch, w trybie dev nie wywalamy błędu 500
      if (isDev) {
        console.warn("DEV_MODE WARNING: Lokalna sieć Maca zablokowała fetch do Resend. Symuluję sukces wysyłki dla UI.");
        return NextResponse.json({ success: true, data: { id: "dev-network-fallback-id" } });
      }
      throw networkError; // Na produkcji błąd sieciowy leci do głównego catcha
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, errors: error.issues },
        { status: 400 }
      );
    }

    console.error("INTERNAL_SERVER_ERROR:", {
      type: error instanceof Error ? error.constructor.name : typeof error,
      message: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      { success: false, message: "Wystapil blad podczas wysylania wiadomosci. Sprobuj ponownie pozniej." },
      { status: 500 }
    );
  }
}