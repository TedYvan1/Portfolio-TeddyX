"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { z } from "zod";
import { hasLocale } from "@/i18n/config";
import { createPublicClient } from "@/lib/supabase/public";

export type ContactField = "name" | "email" | "subject" | "message";
export type ContactState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "invalid"; fields: ContactField[]; values: Record<ContactField, string> }
  | { status: "error"; reason: "rateLimit" | "unavailable"; values: Record<ContactField, string> };

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(320),
  subject: z.string().trim().min(3).max(180),
  message: z.string().trim().min(20).max(4000),
});

export async function sendMessage(_previous: ContactState, formData: FormData): Promise<ContactState> {
  const values = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    subject: String(formData.get("subject") ?? ""),
    message: String(formData.get("message") ?? ""),
  };
  // Champ piège invisible : un robot qui le remplit reçoit un faux succès.
  if (String(formData.get("website") ?? "")) return { status: "success" };

  const parsed = schema.safeParse(values);
  if (!parsed.success) {
    return { status: "invalid", fields: [...new Set(parsed.error.issues.map(issue => issue.path[0] as ContactField))], values };
  }

  const supabase = createPublicClient();
  if (!supabase) return { status: "error", reason: "unavailable", values };

  // Empreinte de l'expéditeur pour la limite de 5 messages par heure : l'IP n'est jamais stockée en clair.
  const requestHeaders = await headers();
  const ip = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() || requestHeaders.get("x-real-ip") || "inconnu";
  const senderHash = createHash("sha256").update(`${process.env.CONTACT_HASH_SALT ?? "portfolio"}:${ip}`).digest("hex");
  const locale = String(formData.get("locale") ?? "fr");

  const { error } = await supabase.rpc("submit_message", {
    p_name: parsed.data.name,
    p_email: parsed.data.email,
    p_subject: parsed.data.subject,
    p_body: parsed.data.message,
    p_locale: hasLocale(locale) ? locale : "fr",
    p_sender_hash: senderHash,
  });
  if (error) {
    console.error("[contact] envoi refusé :", error.code, error.message);
    return { status: "error", reason: error.code === "P0429" ? "rateLimit" : "unavailable", values };
  }
  return { status: "success" };
}
