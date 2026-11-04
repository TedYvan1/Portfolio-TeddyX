import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { collections } from "@/lib/admin/collections";
import { signOut } from "../actions";

export const metadata: Metadata = { title: "Tableau de bord" };

export default async function DashboardPage() {
  const { supabase, user } = await requireAdmin();
  const count = async (table: string, filter?: [string, boolean]) => {
    let query = supabase.from(table).select("*", { count: "exact", head: true });
    if (filter) query = query.eq(filter[0], filter[1]);
    return (await query).count ?? 0;
  };
  const [unread, drafts, ...totals] = await Promise.all([count("messages", ["read", false]), count("projects", ["published", false]), ...collections.map(collection => count(collection.table))]);

  return (
    <div className="max-w-4xl">
      <p className="tag">{user.email}</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">Tableau de bord</h1>

      <div className="mt-10 grid gap-8 sm:grid-cols-2">
        <Link href="/admin/messages" className="group border-t-2 border-contact pt-4">
          <p className="text-4xl font-bold tabular-nums">{unread}</p>
          <p className="mt-1 text-muted group-hover:text-foreground">message{unread > 1 ? "s" : ""} non lu{unread > 1 ? "s" : ""} →</p>
        </Link>
        <Link href="/admin/projets" className="group border-t-2 border-project pt-4">
          <p className="text-4xl font-bold tabular-nums">{drafts}</p>
          <p className="mt-1 text-muted group-hover:text-foreground">projet{drafts > 1 ? "s" : ""} en brouillon →</p>
        </Link>
      </div>

      <h2 className="eyebrow mt-16 mb-3">Contenu</h2>
      <ul className="border-t border-border">
        {collections.map((collection, index) => (
          <li key={collection.key}>
            <Link href={`/admin/${collection.key}`} className="flex items-baseline justify-between gap-4 border-b border-border py-3 hover:bg-surface">
              <span>
                <span className="font-semibold">{collection.label}</span>
                <span className="block text-sm text-muted">{collection.description}</span>
              </span>
              <span className="tag shrink-0 tabular-nums">{totals[index]}</span>
            </Link>
          </li>
        ))}
        <li>
          <Link href="/admin/profil" className="flex items-baseline justify-between gap-4 border-b border-border py-3 hover:bg-surface">
            <span>
              <span className="font-semibold">Profil</span>
              <span className="block text-sm text-muted">Nom, accroche, liens, photo et CV.</span>
            </span>
          </Link>
        </li>
      </ul>

      <form action={signOut} className="mt-12 lg:hidden">
        <button type="submit" className="btn btn-secondary">Se déconnecter</button>
      </form>
    </div>
  );
}
