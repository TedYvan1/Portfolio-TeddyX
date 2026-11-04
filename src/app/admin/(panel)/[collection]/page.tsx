import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { findCollection, newLabel } from "@/lib/admin/collections";
import { loadReferences, rowTitle } from "@/lib/admin/data";
import { moveRecord } from "../../actions";

export async function generateMetadata({ params }: PageProps<"/admin/[collection]">): Promise<Metadata> {
  const collection = findCollection((await params).collection);
  return { title: collection?.label ?? "Introuvable" };
}

export default async function CollectionPage({ params }: PageProps<"/admin/[collection]">) {
  const collection = findCollection((await params).collection);
  if (!collection) notFound();
  const admin = await requireAdmin();

  let query = admin.supabase.from(collection.table).select("*");
  if (collection.groupBy) query = query.order(collection.groupBy);
  const { data, error } = await query.order("sort_order").order("id");
  if (error) throw new Error(`Lecture impossible : ${error.message}`);
  const rows = (data ?? []) as Record<string, unknown>[];

  // Regroupement (compétences par catégorie), dans l'ordre des catégories.
  const references = collection.groupBy ? await loadReferences(admin, collection) : {};
  const groupOptions = collection.groupBy ? references[collection.groupBy] ?? [] : [];
  const groups = collection.groupBy
    ? groupOptions.map(option => ({ title: option.label, rows: rows.filter(row => row[collection.groupBy!] === option.value) }))
    : [{ title: null as string | null, rows }];

  return (
    <div className="max-w-4xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{collection.label}</h1>
          <p className="mt-2 text-muted">{collection.description}</p>
        </div>
        <Link href={`/admin/${collection.key}/nouveau`} className="btn btn-primary">{newLabel(collection)}</Link>
      </div>

      {rows.length === 0 ? (
        <p className="mt-10 border-l-2 border-border pl-4 text-muted">Rien pour l&apos;instant.</p>
      ) : (
        groups.map(group => (
          <section key={group.title ?? "tout"} className="mt-10" aria-label={group.title ?? collection.label}>
            {group.title && <h2 className="eyebrow mb-3">{group.title}</h2>}
            <ol className="border-t border-border">
              {group.rows.map((row, index) => {
                const id = String(row.id);
                const publicPath = collection.publicPath?.(row);
                const title = rowTitle(collection, row);
                return (
                  <li key={id} className="flex items-center gap-3 border-b border-border py-3">
                    <div className="flex shrink-0 flex-col">
                      <MoveButton collectionKey={collection.key} id={id} direction={-1} disabled={index === 0} title={title} />
                      <MoveButton collectionKey={collection.key} id={id} direction={1} disabled={index === group.rows.length - 1} title={title} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link href={`/admin/${collection.key}/${id}`} className="link-underline font-semibold">{title}</Link>
                      {collection.subtitle && <p className="truncate text-sm text-muted">{collection.subtitle(row)}</p>}
                    </div>
                    {publicPath && <Link href={publicPath} target="_blank" className="tag shrink-0 hover:text-foreground">Voir ↗</Link>}
                  </li>
                );
              })}
            </ol>
          </section>
        ))
      )}
    </div>
  );
}

function MoveButton({ collectionKey, id, direction, disabled, title }: { collectionKey: string; id: string; direction: -1 | 1; disabled: boolean; title: string }) {
  return (
    <form action={moveRecord.bind(null, collectionKey, id, direction)}>
      <button type="submit" disabled={disabled} className="grid h-6 w-8 place-items-center text-muted hover:text-foreground disabled:opacity-25" aria-label={`${direction === -1 ? "Monter" : "Descendre"} « ${title} »`}>
        <span aria-hidden="true">{direction === -1 ? "↑" : "↓"}</span>
      </button>
    </form>
  );
}
