import { NextResponse } from "next/server";
import { contactFormSchema } from "@/lib/validations/contact";
import https from "https";

const agent = new https.Agent({
  rejectUnauthorized: process.env.NODE_ENV === "production",
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. Walidacja Zod
    const validatedData = contactFormSchema.parse(body);
    const { name, email, message } = validatedData;

    // 2. Wywołanie Resend API
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      // @ts-ignore
      agent,
      body: JSON.stringify({
        // TUTAJSZA ZMIANA: używamy zweryfikowanej domeny tombergson.eu
        from: "Portfolio Contact <kontakt@tombergson.eu>",
        to: [process.env.CONTACT_EMAIL_TO || "studio@tombergson.eu"],
        reply_to: email,
        subject: `[Portfolio Contact] Nowa wiadomość od ${name}`,
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