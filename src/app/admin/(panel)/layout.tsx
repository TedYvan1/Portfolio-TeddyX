import Link from "next/link";
import { Suspense } from "react";
import { LogoMark } from "@/components/logo";
import { AdminNav } from "@/components/admin/admin-nav";
import { collections } from "@/lib/admin/collections";
import { requireAdmin } from "@/lib/admin/auth";
import { signOut } from "../actions";

const groups = [
  { title: "Général", items: [{ href: "/admin", label: "Tableau de bord" }, { href: "/admin/profil", label: "Profil" }, { href: "/admin/messages", label: "Messages" }] },
  { title: "Contenu", items: collections.map(collection => ({ href: `/admin/${collection.key}`, label: collection.label })) },
];

/** Coquille de l'admin : statique (la navigation vient de la configuration), seule la session est lue à la requête. */
export default function PanelLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="mx-auto grid min-h-svh max-w-[1400px] lg:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="border-b border-border px-4 pt-4 pb-3 lg:sticky lg:top-0 lg:h-svh lg:overflow-y-auto lg:border-r lg:border-b-0 lg:px-5 lg:py-6">
        <div className="mb-4 flex items-center justify-between gap-4 lg:mb-8">
          <Link href="/admin" className="flex items-center gap-2.5 font-bold tracking-tight">
            <LogoMark />
            tedyvan <span className="font-normal text-muted">/ admin</span>
          </Link>
          <Link href="/" target="_blank" className="tag hover:text-foreground lg:hidden">Voir le site ↗</Link>
        </div>
        <AdminNav groups={groups} />
        <div className="mt-8 hidden border-t border-border pt-5 lg:block">
          <Link href="/" target="_blank" className="link-underline text-sm">Voir le site ↗</Link>
          <Suspense fallback={null}>
            <Account />
          </Suspense>
        </div>
      </aside>
      <main id="main" className="min-w-0 px-4 py-8 sm:px-8 lg:px-12 lg:py-10">
        <Suspense fallback={<p className="text-sm text-muted">Chargement…</p>}>{children}</Suspense>
      </main>
    </div>
  );
}

async function Account() {
  const { user } = await requireAdmin();
  return (
    <form action={signOut} className="mt-4 grid gap-2">
      <p className="tag truncate" title={user.email}>{user.email}</p>
      <button type="submit" className="w-fit text-sm text-muted hover:text-foreground">Se déconnecter</button>
    </form>
  );
}
