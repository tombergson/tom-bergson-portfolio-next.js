import { z } from "zod";

// Bez znaków sterujących (w tym CR/LF) – pole trafia do tematu maila
const noControlChars = /^[^\u0000-\u001F\u007F]*$/;

// Treść wiadomości: dozwolone \t, \n, \r, reszta znaków sterujących zablokowana
const messageChars = /^[^\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]*$/;

export const contactFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .max(100, "Name must be at most 100 characters.")
    .regex(noControlChars, "Name contains invalid characters."),
  email: z
    .string()
    .trim()
    .max(254, "Email is too long.")
    .email("Please enter a valid email address."),
  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters.")
    .max(5000, "Message must be at most 5000 characters.")
    .regex(messageChars, "Message contains invalid characters."),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;