import "server-only";
import { pick } from "@/i18n/config";
import type { AdminContext } from "./auth";
import type { Collection } from "./collections";

/** Titre lisible d'une ligne (texte bilingue → français, sinon anglais). */
export function rowTitle(collection: Collection, row: Record<string, unknown>) {
  const value = row[collection.titleColumn];
  const title = collection.localizedTitle ? pick(value as { fr?: string; en?: string }, "fr") : String(value ?? "");
  return title || "(sans titre)";
}

/** Choix proposés pour les champs « reference » (ex. : la catégorie d'une compétence). */
export async function loadReferences({ supabase }: AdminContext, collection: Collection) {
  const references: Record<string, { value: string; label: string }[]> = {};
  for (const field of collection.fields) {
    if (field.type !== "reference") continue;
    const { data } = await supabase.from(field.table).select(`id, ${field.labelColumn}`).order("sort_order");
    references[field.name] = (data ?? []).map(row => {
      const record = row as unknown as Record<string, unknown>;
      const label = record[field.labelColumn];
      return { value: String(record.id), label: field.localizedLabel ? pick(label as { fr?: string; en?: string }, "fr") : String(label) };
    });
  }
  return references;
}
