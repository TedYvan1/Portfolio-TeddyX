"use server";

import { refresh, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { CONTENT_TAG } from "@/lib/content";
import { LOGIN_PATH, requireAdmin } from "@/lib/admin/auth";
import { findCollection, MEDIA_BUCKET, profileFields, type Field } from "@/lib/admin/collections";
import { orphanedFiles, readRecord, slugify, type FieldErrors } from "@/lib/admin/form-data";
import { createSessionClient } from "@/lib/supabase/server";
import { supabaseEnv } from "@/lib/supabase/env";

export type FormState =
  | { status: "idle" }
  | { status: "saved"; at: number }
  | { status: "error"; message: string; fields: FieldErrors };

const invalid = (fields: FieldErrors): FormState => ({ status: "error", message: "Certains champs sont à corriger.", fields });
const failure = (message: string): FormState => ({ status: "error", message, fields: {} });

/** Message lisible pour les erreurs Postgres les plus probables. */
function databaseError(error: { code?: string; message: string }): FormState {
  if (error.code === "23505") return invalid({ slug: "Cette adresse est déjà utilisée par un autre élément." });
  if (error.code === "23514") return failure("Une valeur dépasse la limite autorisée par la base. Raccourcis le texte concerné.");
  if (error.code === "42501") return failure("Accès refusé par la base : ce compte n'est pas administrateur.");
  return failure(`Enregistrement impossible : ${error.message}`);
}

// ── Connexion ─────────────────────────────────────────────

export type LoginState = { error: string | null; email?: string };

export async function signIn(_: LoginState, formData: FormData): Promise<LoginState> {
  if (!supabaseEnv()) return { error: "Supabase n'est pas configuré sur ce déploiement." };
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Renseigne ton e-mail et ton mot de passe.", email };

  const supabase = await createSessionClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  // Même message dans tous les cas : on ne révèle pas si le compte existe.
  if (error) return { error: "E-mail ou mot de passe incorrect.", email };

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) {
    await supabase.auth.signOut();
    return { error: "Ce compte n'a pas accès à l'administration.", email };
  }
  redirect("/admin");
}

export async function signOut() {
  if (supabaseEnv()) {
    const supabase = await createSessionClient();
    await supabase.auth.signOut();
  }
  redirect(LOGIN_PATH);
}

// ── Collections ───────────────────────────────────────────

async function removeFiles(admin: Awaited<ReturnType<typeof requireAdmin>>, paths: string[]) {
  // Au mieux : un fichier orphelin n'empêche jamais l'enregistrement.
  if (paths.length) await admin.supabase.storage.from(MEDIA_BUCKET).remove(paths);
}

async function save(fields: Field[], table: string, id: string | null, formData: FormData, extra: (values: Record<string, unknown>) => void = () => {}) {
  const admin = await requireAdmin();
  const before = id ? (await admin.supabase.from(table).select("*").eq("id", id).maybeSingle()).data : null;
  if (id && !before) return { state: failure("Cet élément n'existe plus.") };

  const { values, errors } = readRecord(fields, formData, before);
  extra(values);
  if (Object.keys(errors).length) return { state: invalid(errors) };

  if (!id) {
    const { data: last } = await admin.supabase.from(table).select("sort_order").order("sort_order", { ascending: false }).limit(1).maybeSingle();
    values.sort_order = (last?.sort_order ?? 0) + 10;
  }

  const query = id ? admin.supabase.from(table).update(values).eq("id", id).select("id").single() : admin.supabase.from(table).insert(values).select("id").single();
  const { data, error } = await query;
  if (error) return { state: databaseError(error) };

  await removeFiles(admin, orphanedFiles(fields, before, values));
  updateTag(CONTENT_TAG);
  return { state: { status: "saved", at: Date.now() } as FormState, id: data.id as string };
}

export async function saveRecord(key: string, id: string | null, _: FormState, formData: FormData): Promise<FormState> {
  const collection = findCollection(key);
  if (!collection) return failure("Collection inconnue.");

  const result = await save(collection.fields, collection.table, id, formData, values => {
    // Adresse vide : déduite du titre français (ou anglais).
    if (collection.fields.some(field => field.type === "slug") && !values.slug) {
      const title = values[collection.titleColumn] as { fr?: string; en?: string };
      values.slug = slugify(title.fr ?? title.en ?? "");
    }
  });
  if (!id && result.id) redirect(`/admin/${key}/${result.id}?cree=1`);
  return result.state;
}

export async function deleteRecord(key: string, id: string) {
  const collection = findCollection(key);
  if (!collection) return;
  const admin = await requireAdmin();
  const { data: before } = await admin.supabase.from(collection.table).select("*").eq("id", id).maybeSingle();
  const { error } = await admin.supabase.from(collection.table).delete().eq("id", id);
  if (error) throw new Error(`Suppression impossible : ${error.message}`);
  await removeFiles(admin, orphanedFiles(collection.fields, before, {}));
  updateTag(CONTENT_TAG);
  redirect(`/admin/${key}`);
}

/** Monte ou descend un élément : la liste est renumérotée (10, 20, 30…) pour rester stable. */
export async function moveRecord(key: string, id: string, direction: -1 | 1) {
  const collection = findCollection(key);
  if (!collection) return;
  const admin = await requireAdmin();
  const { data: current } = await admin.supabase.from(collection.table).select("*").eq("id", id).maybeSingle();
  if (!current) return;

  let query = admin.supabase.from(collection.table).select("id, sort_order").order("sort_order").order("id");
  if (collection.groupBy) query = query.eq(collection.groupBy, current[collection.groupBy]);
  const { data: rows } = await query;
  if (!rows) return;

  const index = rows.findIndex(row => row.id === id);
  const target = index + direction;
  if (index === -1 || target < 0 || target >= rows.length) return;
  [rows[index], rows[target]] = [rows[target], rows[index]];

  for (const [position, row] of rows.entries()) {
    const order = (position + 1) * 10;
    if (row.sort_order !== order) await admin.supabase.from(collection.table).update({ sort_order: order }).eq("id", row.id);
  }
  updateTag(CONTENT_TAG);
  refresh();
}

// ── Profil ────────────────────────────────────────────────

export async function saveProfile(_: FormState, formData: FormData): Promise<FormState> {
  return (await save(profileFields, "profile", "1", formData)).state;
}

// ── Messages ──────────────────────────────────────────────

export async function setMessageRead(id: string, read: boolean) {
  const { supabase } = await requireAdmin();
  await supabase.from("messages").update({ read }).eq("id", id);
  refresh();
}

export async function deleteMessage(id: string) {
  const { supabase } = await requireAdmin();
  await supabase.from("messages").delete().eq("id", id);
  redirect("/admin/messages");
}
