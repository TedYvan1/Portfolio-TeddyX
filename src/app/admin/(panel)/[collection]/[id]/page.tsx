import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { RecordForm } from "@/components/admin/record-form";
import { requireAdmin } from "@/lib/admin/auth";
import { findCollection } from "@/lib/admin/collections";
import { loadReferences, rowTitle } from "@/lib/admin/data";
import { deleteRecord, saveRecord } from "../../../actions";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function load(params: PageProps<"/admin/[collection]/[id]">["params"]) {
  const { collection: key, id } = await params;
  const collection = findCollection(key);
  if (!collection || !UUID.test(id)) notFound();
  const admin = await requireAdmin();
  const { data } = await admin.supabase.from(collection.table).select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  return { admin, collection, id, row: data as Record<string, unknown> };
}

export async function generateMetadata({ params }: PageProps<"/admin/[collection]/[id]">): Promise<Metadata> {
  const { collection, row } = await load(params);
  return { title: rowTitle(collection, row) };
}

export default async function EditRecordPage({ params, searchParams }: PageProps<"/admin/[collection]/[id]">) {
  const { admin, collection, id, row } = await load(params);
  const [references, { cree }] = await Promise.all([loadReferences(admin, collection), searchParams]);
  const publicPath = collection.publicPath?.(row);
  const title = rowTitle(collection, row);

  return (
    <div className="max-w-4xl">
      <Link href={`/admin/${collection.key}`} className="tag hover:text-foreground">← {collection.label}</Link>
      <div className="mt-3 mb-10 flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {publicPath && <Link href={publicPath} target="_blank" className="link-underline text-sm">Voir sur le site ↗</Link>}
      </div>
      {cree && <p role="status" className="mb-8 border-l-2 border-skill pl-4 text-sm">C&apos;est créé. Tu peux continuer à compléter la fiche.</p>}

      <RecordForm fields={collection.fields} values={row} references={references} action={saveRecord.bind(null, collection.key, id)} />

      <section className="mt-16 border-t border-border pt-6" aria-labelledby="danger-title">
        <h2 id="danger-title" className="text-sm font-semibold">Supprimer</h2>
        <p className="mt-1 text-sm text-muted">Définitif : l&apos;élément et ses fichiers sont effacés.</p>
        <form action={deleteRecord.bind(null, collection.key, id)} className="mt-4">
          <ConfirmButton message={`Supprimer « ${title} » ? Cette action est définitive.`}>Supprimer définitivement</ConfirmButton>
        </form>
      </section>
    </div>
  );
}
