import { NextResponse } from "next/server";
import { contactFormSchema } from "@/lib/validations/contact";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { turnstileToken, ...formData } = body;

    const isDev = process.env.NODE_ENV === "development";

    // 1. Weryfikacja tokenu Cloudflare Turnstile
    if (!turnstileToken && !isDev) {
      return NextResponse.json(
        { success: false, message: "Brak tokenu weryfikacji CAPTCHA." },
        { status: 400 }
      );
    }

    // W trybie deweloperskim używamy oficjalnego testowego secret key Cloudflare
    const secretKey = isDev 
      ? "2x0000000000000000000000000000000AA" 
      : process.env.TURNSTILE_SECRET_KEY;

    const turnstileRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: secretKey || "",
        response: turnstileToken || "test-token",
      }),
    });

    const turnstileResult = await turnstileRes.json();

    if (!turnstileResult.success && !isDev) {
      return NextResponse.json(
        { success: false, message: "Niepomyślna weryfikacja bezpieczeństwa (CAPTCHA)." },
        { status: 400 }
      );
    }

    // 2. Walidacja Zod dla danych formularza
    const validatedData = contactFormSchema.parse(formData);
    const { name, email, message } = validatedData;

    // 3. Wywołanie Resend API
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
        subject: `[Tom Bergson] Nowa wiadomość od ${name}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #111; line-height: 1.6;">
            <h2>Nowa wiadomość z formularza kontaktowego</h2>
            <p><strong>Imię i nazwisko:</strong> ${name}</p>
            <p><strong>Email nadawcy:</strong> <a href="mailto:${email}">${email}</a></p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p><strong>Treść wiadomości:</strong></p>
            <p style="white-space: pre-wrap; background: #f9f9f9; padding: 15px; border-radius: 6px; border: 1px solid #e5e5e5;">${message}</p>
          </div>
        `,
      }),
    });

    const resData = await response.json();

    if (!response.ok) {
      console.error("BŁĄD RESEND API (HTTP):", response.status, resData);
      return NextResponse.json(
        { success: false, message: resData.message || "Błąd wysyłki e-mail." },
        { status: response.status }
      );
    }

    console.log("SUKCES - Odpowiedź z Resend:", resData);
    return NextResponse.json({ success: true, data: resData });

  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { success: false, errors: error.errors },
        { status: 400 }
      );
    }

    console.error("DOKŁADNY BŁĄD SIECIOWY / CATCH:", error);

    return NextResponse.json(
      { success: false, message: error?.message || "Wystąpił błąd podczas wysyłania wiadomości." },
      { status: 500 }
    );
  }
}