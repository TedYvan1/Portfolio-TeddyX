import { ArrowLeft } from "lucide-react";
import { Link, useLocation } from "wouter";
import { SiteLayout } from "@/components/SiteLayout";

export default function NotFound() {
  const [location] = useLocation();
  return (
    <SiteLayout>
      <main className="container flex min-h-[80svh] flex-col justify-center pb-16 pt-32">
        <div className="trace max-w-2xl">
          <div className="trace-head">
            <span>
              <span className="text-primary">$</span> traceroute {location}
            </span>
          </div>
          <ol>
            <li className="trace-row">
              <span className="text-muted-foreground">1</span>
              <span className="trace-host">accueil</span>
              <span className="trace-label">ok</span>
              <span className="trace-meta">0 ms</span>
            </li>
            <li className="trace-row">
              <span className="text-muted-foreground">2</span>
              <span className="trace-host text-primary">{location}</span>
              <span className="trace-label">hôte injoignable</span>
              <span className="trace-meta">* * *</span>
            </li>
          </ol>
        </div>
        <h1 className="mt-12 font-sans font-extrabold leading-[.8] tracking-[-.05em]" style={{ fontSize: "clamp(6rem, 26vw, 20rem)" }}>
          404
        </h1>
        <p className="mt-6 max-w-lg font-serif text-3xl leading-tight">Cette page n'existe pas, ou elle a changé d'adresse.</p>
        <Link href="/" className="button-primary mt-10 self-start">
          <ArrowLeft className="h-4 w-4" /> Revenir à l'accueil
        </Link>
      </main>
    </SiteLayout>
  );
}
