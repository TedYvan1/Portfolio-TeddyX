import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RecordForm } from "@/components/admin/record-form";
import { requireAdmin } from "@/lib/admin/auth";
import { findCollection, newLabel } from "@/lib/admin/collections";
import { loadReferences } from "@/lib/admin/data";
import { saveRecord } from "../../../actions";

export async function generateMetadata({ params }: PageProps<"/admin/[collection]/nouveau">): Promise<Metadata> {
  const collection = findCollection((await params).collection);
  return { title: collection ? newLabel(collection) : "Introuvable" };
}

export default async function NewRecordPage({ params, searchParams }: PageProps<"/admin/[collection]/nouveau">) {
  const collection = findCollection((await params).collection);
  if (!collection) notFound();
  const admin = await requireAdmin();
  const references = await loadReferences(admin, collection);

  // Préremplissage depuis l'URL pour les champs de référence (ex. : ?category_id=… depuis une catégorie).
  const query = await searchParams;
  const values = Object.fromEntries(collection.fields.filter(field => field.type === "reference" && typeof query[field.name] === "string").map(field => [field.name, query[field.name]]));

  return (
    <div className="max-w-4xl">
      <Link href={`/admin/${collection.key}`} className="tag hover:text-foreground">← {collection.label}</Link>
      <h1 className="mt-3 mb-10 text-3xl font-bold tracking-tight">{newLabel(collection)}</h1>
      {collection.fields.some(field => field.type === "reference" && !references[field.name]?.length) ? (
        <p className="border-l-2 border-journey pl-4 text-muted">Ajoute d&apos;abord une catégorie : chaque {collection.singular} doit en avoir une.</p>
      ) : (
        <RecordForm fields={collection.fields} values={values} references={references} action={saveRecord.bind(null, collection.key, null)} submitLabel="Créer" />
      )}
    </div>
  );
}
