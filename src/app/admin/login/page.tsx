import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LogoMark } from "@/components/logo";
import { LoginForm } from "@/components/admin/login-form";
import { supabaseEnv } from "@/lib/supabase/env";

export const metadata: Metadata = { title: "Connexion" };

export default function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  const configured = Boolean(supabaseEnv());

  return (
    <main className="grid min-h-svh place-items-center px-4 py-16">
      <div className="w-full max-w-sm">
        <Link href="/" className="flex w-fit items-center gap-2.5 font-bold tracking-tight">
          <LogoMark />
          tedyvan <span className="font-normal text-muted">/ admin</span>
        </Link>
        <h1 className="mt-10 text-2xl font-bold tracking-tight">Connexion</h1>

        {configured ? (
          <>
            <Suspense fallback={null}>
              <Refused searchParams={searchParams} />
            </Suspense>
            <LoginForm />
          </>
        ) : (
          <div className="mt-6 grid gap-3 border-l-2 border-journey pl-4 text-[15px] leading-7 text-muted">
            <p className="font-semibold text-foreground">Supabase n&apos;est pas encore configuré.</p>
            <p>
              Ajoute <code className="tag text-foreground">NEXT_PUBLIC_SUPABASE_URL</code> et <code className="tag text-foreground">NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> au fichier <code className="tag text-foreground">.env</code> (et sur Vercel), puis redémarre le serveur.
            </p>
            <p>Le site public fonctionne en attendant, avec le contenu de secours.</p>
          </div>
        )}
      </div>
    </main>
  );
}

/** Renvoyé ici par requireAdmin : connecté, mais sans droits d'administration. */
async function Refused({ searchParams }: Pick<PageProps<"/admin/login">, "searchParams">) {
  const { refus } = await searchParams;
  if (!refus) return null;
  return <p role="alert" className="mt-4 border-l-2 border-danger pl-3 text-sm text-danger">Ce compte n&apos;a pas accès à l&apos;administration.</p>;
}
