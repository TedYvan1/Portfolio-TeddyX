import type { Metadata } from "next";
import { Suspense } from "react";
import { fontVariables } from "../fonts";
import "../globals.css";

export const metadata: Metadata = {
  title: { default: "Administration", template: "%s · Admin" },
  robots: { index: false, follow: false },
  icons: { icon: "/favicon.svg" },
};

// L'admin lit la session à chaque requête : rien n'y est prérendu, et c'est voulu.
export const instant = false;

/** Mise en page racine de l'admin (séparée du site public, toujours en français). */
export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return (
    <html lang="fr" className={`${fontVariables} h-full antialiased`}>
      <body className="min-h-full font-sans">
        <Suspense fallback={<p className="p-8 text-sm text-muted">Chargement…</p>}>{children}</Suspense>
      </body>
    </html>
  );
}
