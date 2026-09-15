"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Script from "next/script";
import { Mail, MapPin, ArrowUpRight, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { contactFormSchema, ContactFormData } from "@/lib/validations/contact";

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement | string, options: {
        sitekey: string;
        callback: (token: string) => void;
        "error-callback"?: () => void;
        "expired-callback"?: () => void;
        theme?: "light" | "dark" | "auto";
      }) => string;
      reset: (widgetId: string) => void;
    };
  }
}

export default function Contact() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    message: "",
  });

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  
  const [turnstileToken, setTurnstileToken] = useState<string>("");
  const turnstileRef = useRef<HTMLDivElement>(null);
  const decodedEmail = "studio@tombergson.eu";

  const renderTurnstile = () => {
    if (window.turnstile && turnstileRef.current && !turnstileRef.current.hasChildNodes()) {
      // Automatyczny wybór klucza testowego dla localhost / dev oraz produkcyjnego dla live
      const isDev = process.env.NODE_ENV === "development";
      const siteKey = isDev ? "1x00000000000000000000AA" : (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "0x4AAAAAACcliHJZbwCxdXeb");

      window.turnstile.render(turnstileRef.current, {
        sitekey: siteKey,
        callback: (token: string) => {
          setTurnstileToken(token);
        },
        "error-callback": () => setTurnstileToken(""),
        "expired-callback": () => setTurnstileToken(""),
        theme: "dark",
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    setFieldErrors((prev) => ({ ...prev, [id]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});

    const validationResult = contactFormSchema.safeParse(formData);
    if (!validationResult.success) {
      const errors: { [key: string]: string } = {};
      validationResult.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          errors[issue.path[0].toString()] = issue.message;
        }
      });
      setFieldErrors(errors);
      return;
    }

    if (!turnstileToken) {
      setErrorMessage("Proszę ukończyć weryfikację bezpieczeństwa (CAPTCHA).");
      return;
    }

    setStatus("loading");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          turnstileToken,
        }),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        setStatus("success");
        setFormData({ name: "", email: "", message: "" });
        setTurnstileToken("");
      } else {
        setStatus("error");
        setErrorMessage(result.message || "Wystąpił problem z wysyłką.");
      }
    } catch {
      setStatus("error");
      setErrorMessage("Wystąpił błąd sieci. Spróbuj ponownie później.");
    }
  };

  return (
    <section id="contact" className="py-20 bg-[#080808] relative border-b border-neutral-900/60 overflow-hidden">
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        onLoad={renderTurnstile}
        strategy="lazyOnload"
      />

      <div className="absolute inset-0 z-0">
        <Image
          src="/images/contact-background.webp"
          alt="Contact background"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#080808]/50 via-[#080808]/30 to-[#080808]/60 backdrop-blur-[1px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="mb-14">
          <span className="text-red-500 font-mono text-xs tracking-widest uppercase mb-2 block font-semibold">
            Contact
          </span>
          <h3 className="text-2xl md:text-4xl font-semibold text-neutral-100 tracking-tight">
            Get In Touch
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
          <div className="lg:col-span-5 flex flex-col justify-between space-y-10">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-lg bg-neutral-900/80 backdrop-blur-md border border-neutral-800/80 text-red-500 shrink-0 mt-1">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-mono text-neutral-500 uppercase tracking-wider mb-1">
                    Find Me
                  </h4>
                  <p className="text-neutral-300 text-sm leading-relaxed">
                    ul. Niepodległości 69a,<br />
                    02-626 Warsaw, POLAND
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-lg bg-neutral-900/80 backdrop-blur-md border border-neutral-800/80 text-red-500 shrink-0 mt-1">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-mono text-neutral-500 uppercase tracking-wider mb-1">
                    Direct Email
                  </h4>
                  {decodedEmail ? (
                    <a
                      href={`mailto:${decodedEmail}`}
                      className="text-neutral-300 hover:text-red-500 text-sm transition-colors duration-200"
                    >
                      {decodedEmail}
                    </a>
                  ) : (
                    <span className="text-neutral-500 text-sm italic">
                      [Ładowanie adresu...]
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-mono text-neutral-500 uppercase tracking-wider mb-4">
                Follow Me
              </h4>
              <div className="flex flex-wrap gap-2">
                <a
                  href="https://www.instagram.com/tombergsondesign/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md bg-neutral-900/80 hover:bg-neutral-800/90 border border-neutral-800/80 hover:border-red-500/50 text-neutral-300 hover:text-white text-xs font-medium transition-all duration-200 group backdrop-blur-sm"
                >
                  <span>Instagram</span>
                  <ArrowUpRight className="w-3 h-3 text-neutral-500 group-hover:text-red-500 transition-colors" />
                </a>
                <a
                  href="https://www.facebook.com/tombergson.eu/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md bg-neutral-900/80 hover:bg-neutral-800/90 border border-neutral-800/80 hover:border-red-500/50 text-neutral-300 hover:text-white text-xs font-medium transition-all duration-200 group backdrop-blur-sm"
                >
                  <span>Facebook</span>
                  <ArrowUpRight className="w-3 h-3 text-neutral-500 group-hover:text-red-500 transition-colors" />
                </a>
                <a
                  href="https://www.youtube.com/@TomBergson"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md bg-neutral-900/80 hover:bg-neutral-800/90 border border-neutral-800/80 hover:border-red-500/50 text-neutral-300 hover:text-white text-xs font-medium transition-all duration-200 group backdrop-blur-sm"
                >
                  <span>Youtube</span>
                  <ArrowUpRight className="w-3 h-3 text-neutral-500 group-hover:text-red-500 transition-colors" />
                </a>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-neutral-950/70 backdrop-blur-md border border-neutral-800/80 p-6 md:p-8 rounded-xl shadow-2xl">
            <h4 className="text-lg font-medium text-neutral-200 mb-6">
              Send me a message
            </h4>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-xs font-mono text-neutral-400 block">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your Name"
                    className={`w-full bg-neutral-900/80 border rounded-md px-4 py-2.5 text-sm text-neutral-200 placeholder-neutral-600 focus:outline-none transition-colors duration-200 ${
                      fieldErrors.name ? "border-red-500" : "border-neutral-800/80 focus:border-red-500"
                    }`}
                  />
                  {fieldErrors.name && (
                    <p className="text-xs text-red-500 font-mono">{fieldErrors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-xs font-mono text-neutral-400 block">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your.email@example.com"
                    className={`w-full bg-neutral-900/80 border rounded-md px-4 py-2.5 text-sm text-neutral-200 placeholder-neutral-600 focus:outline-none transition-colors duration-200 ${
                      fieldErrors.email ? "border-red-500" : "border-neutral-800/80 focus:border-red-500"
                    }`}
                  />
                  {fieldErrors.email && (
                    <p className="text-xs text-red-500 font-mono">{fieldErrors.email}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-xs font-mono text-neutral-400 block">
                  Comment or Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="How can I help you?"
                  className={`w-full bg-neutral-900/80 border rounded-md px-4 py-3 text-sm text-neutral-200 placeholder-neutral-600 focus:outline-none transition-colors duration-200 resize-none ${
                    fieldErrors.message ? "border-red-500" : "border-neutral-800/80 focus:border-red-500"
                  }`}
                />
                {fieldErrors.message && (
                  <p className="text-xs text-red-500 font-mono">{fieldErrors.message}</p>
                )}
              </div>

              <div className="py-2">
                <div ref={turnstileRef} />
              </div>

              {status === "success" && (
                <div className="flex items-center gap-2 p-3 bg-emerald-950/50 border border-emerald-800/80 text-emerald-400 rounded-md text-xs font-mono">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>Thank you! Your message has been sent successfully.</span>
                </div>
              )}

              {status === "error" && (
                <div className="flex items-center gap-2 p-3 bg-red-950/50 border border-red-800/80 text-red-400 rounded-md text-xs font-mono">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage || "Something went wrong. Please try again."}</span>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={status === "loading" || !turnstileToken}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-neutral-800 disabled:cursor-not-allowed text-white text-xs font-mono uppercase tracking-wider font-semibold rounded-md transition-all duration-200 shadow-lg shadow-red-900/20 cursor-pointer"
                >
                  {status === "loading" && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{status === "loading" ? "Sending..." : "Send Message"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}