import { z } from "zod";

export const contactFormSchema = z.object({
  name: z.string().min(2, "Imię musi mieć co najmniej 2 znaki."),
  email: z.string().email("Wprowadź poprawny adres email."),
  message: z.string().min(10, "Wiadomość musi mieć co najmniej 10 znaków."),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;