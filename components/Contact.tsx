"use client";

import { useState } from "react";
import Image from "next/image";
import { Mail, MapPin, ArrowUpRight, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { contactFormSchema, ContactFormData } from "@/lib/validations/contact";

export default function Contact() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    message: "",
  });

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    setFieldErrors((prev) => ({ ...prev, [id]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});

    // Walidacja po stronie klienta za pomocą Zod
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

    setStatus("loading");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        setStatus("success");
        setFormData({ name: "", email: "", message: "" });
      } else {
        setStatus("error");
        setErrorMessage(result.message || "Wystąpił problem z wysyłką.");
      }
    } catch (err) {
      setStatus("error");
      setErrorMessage("Wystąpił błąd sieci. Spróbuj ponownie później.");
    }
  };

  return (
    <section id="contact" className="py-20 bg-[#080808] relative border-b border-neutral-900/60 overflow-hidden">
      
      {/* Obraz tła z jaśniejszą nakładką */}
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
        
        {/* Nagłówek sekcji */}
        <div className="mb-14">
          <span className="text-red-500 font-mono text-xs tracking-widest uppercase mb-2 block font-semibold">
            Contact
          </span>
          <h3 className="text-2xl md:text-4xl font-semibold text-neutral-100 tracking-tight">
            Get In Touch
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
          
          {/* Lewa Kolumna: Dane kontaktowe i Social Media */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-10">
            
            {/* Adres i Email */}
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
                  <a
                    href="mailto:studio@tombergson.eu"
                    className="text-neutral-300 hover:text-red-500 text-sm transition-colors duration-200"
                  >
                    studio@tombergson.eu
                  </a>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div>
              <h4 className="text-xs font-mono text-neutral-500 uppercase tracking-wider mb-4">
                Follow Me
              </h4>
              <div className="flex flex-wrap gap-2">
                
                {/* Instagram */}
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md bg-neutral-900/80 hover:bg-neutral-800/90 border border-neutral-800/80 hover:border-red-500/50 text-neutral-300 hover:text-white text-xs font-medium transition-all duration-200 group backdrop-blur-sm"
                >
                  <svg
                    className="w-4 h-4 text-neutral-400 group-hover:text-red-500 transition-colors"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                  <span>Instagram</span>
                  <ArrowUpRight className="w-3 h-3 text-neutral-500 group-hover:text-red-500 transition-colors" />
                </a>

                {/* Facebook */}
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md bg-neutral-900/80 hover:bg-neutral-800/90 border border-neutral-800/80 hover:border-red-500/50 text-neutral-300 hover:text-white text-xs font-medium transition-all duration-200 group backdrop-blur-sm"
                >
                  <svg
                    className="w-4 h-4 text-neutral-400 group-hover:text-red-500 transition-colors"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                  <span>Facebook</span>
                  <ArrowUpRight className="w-3 h-3 text-neutral-500 group-hover:text-red-500 transition-colors" />
                </a>

                {/* Youtube */}
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md bg-neutral-900/80 hover:bg-neutral-800/90 border border-neutral-800/80 hover:border-red-500/50 text-neutral-300 hover:text-white text-xs font-medium transition-all duration-200 group backdrop-blur-sm"
                >
                  <svg
                    className="w-4 h-4 text-neutral-400 group-hover:text-red-500 transition-colors"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
                    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="currentColor" />
                  </svg>
                  <span>Youtube</span>
                  <ArrowUpRight className="w-3 h-3 text-neutral-500 group-hover:text-red-500 transition-colors" />
                </a>

              </div>
            </div>

          </div>

          {/* Prawa Kolumna: Formularz interaktywny */}
          <div className="lg:col-span-7 bg-neutral-950/70 backdrop-blur-md border border-neutral-800/80 p-6 md:p-8 rounded-xl shadow-2xl">
            <h4 className="text-lg font-medium text-neutral-200 mb-6">
              Send me a message
            </h4>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Pole: Name */}
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

                {/* Pole: Email */}
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

              {/* Pole: Message */}
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

              {/* Status Messages */}
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

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={status === "loading"}
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