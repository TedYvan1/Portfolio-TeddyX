import { ArrowLeft } from "lucide-react";
import { Link, useLocation } from "wouter";
import { SiteLayout } from "@/components/SiteLayout";

export default function NotFound() {
  const [location] = useLocation();
  return (
    <SiteLayout>
      <main className="container flex min-h-[75svh] flex-col justify-center pb-16 pt-12">
        <div className="pane max-w-2xl">
          <div className="pane-bar">
            <span className="pane-dots" aria-hidden="true"><i /><i /><i /></span>
            <span>bash</span>
          </div>
          <div className="pane-body">
            <p>
              <span className="tok-prompt">ted@abidjan</span>:<span className="tok-path">~</span>$ cd {location}
            </p>
            <p className="text-destructive">bash : cd : {location} : aucun fichier ou dossier de ce type</p>
            <p className="mt-2">
              <span className="tok-prompt">ted@abidjan</span>:<span className="tok-path">~</span>$ <span className="cursor" aria-hidden="true" />
            </p>
          </div>
        </div>
        <h1 className="hero-name mt-10">
          <span className="text-primary">404</span>_
        </h1>
        <p className="mt-4 max-w-lg text-lg text-muted-foreground">Cette page n'existe pas, ou elle a changé d'adresse.</p>
        <Link href="/" className="button-primary mt-8 self-start">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> cd ~
        </Link>
      </main>
    </SiteLayout>
  );
}
