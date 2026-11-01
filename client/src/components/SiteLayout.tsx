import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowUp, Download, Menu, Moon, Sun, X } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAbidjanTime, useProfile } from "@/lib/profile";
import { easeOutExpo } from "@/lib/motion";

export const navItems = [
  { number: "1", id: "projects", label: "projets" },
  { number: "2", id: "about", label: "profil" },
  { number: "3", id: "skills", label: "compétences" },
  { number: "4", id: "journey", label: "parcours" },
  { number: "5", id: "contact", label: "contact" },
];

/** Section visible à l'écran (page d'accueil uniquement), pour surligner l'onglet correspondant. */
function useActiveSection(enabled: boolean) {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    if (!enabled) return setActive(null);
    // Suivi au défilement plutôt qu'un IntersectionObserver : les sections n'existent qu'après le chargement des données.
    let frame = 0;
    const update = () => {
      frame = 0;
      const line = window.innerHeight * 0.4;
      let current: string | null = null;
      for (const item of navItems) {
        const el = document.getElementById(item.id);
        if (el && el.getBoundingClientRect().top <= line) current = item.id;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [enabled]);
  return active;
}

export function SiteLayout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [location] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const profile = useProfile();
  const time = useAbidjanTime();
  const active = useActiveSection(location === "/");

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <div className="scanlines min-h-screen bg-background text-foreground">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-14 focus:z-[70] focus:bg-primary focus:px-4 focus:py-2 focus:font-mono focus:text-primary-foreground">
        Aller au contenu
      </a>
      <header className="fixed inset-x-0 top-0 z-50">
        <div className="status-bar border-b">
          <Link href="/" className="inline-flex items-center gap-2 border-r border-border bg-primary px-3 font-bold text-primary-foreground" onClick={() => setMenuOpen(false)} aria-label="Accueil">
            ted@abidjan
          </Link>
          <nav className="hidden min-w-0 lg:flex" aria-label="Navigation principale">
            {navItems.map(item => (
              <a key={item.id} href={`/#${item.id}`} className={`status-tab whitespace-nowrap ${active === item.id ? "active" : ""}`} aria-current={active === item.id ? "location" : undefined}>
                <span>{item.number}:</span>
                {item.label}
              </a>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2 px-2">
            <span className="hidden items-center gap-2 whitespace-nowrap px-2 text-muted-foreground xl:inline-flex">
              <span className="h-2 w-2 rounded-full bg-signal" aria-hidden="true" />
              <span className="sr-only">Statut :</span>
              {profile.heroEyebrow.toLowerCase()}
            </span>
            <span className="hidden whitespace-nowrap px-2 text-muted-foreground sm:inline" aria-label={`Heure d'Abidjan : ${time}`}>
              {time} GMT
            </span>
            <button className="icon-button" onClick={toggleTheme} aria-label={theme === "dark" ? "Passer en thème clair" : "Passer en thème sombre"}>
              {theme === "dark" ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
            </button>
            <a href={profile.cvUrl} target="_blank" rel="noreferrer" className="icon-button hidden sm:inline-flex">
              <Download className="h-3.5 w-3.5" aria-hidden="true" /> cv.pdf
            </a>
            <button className="icon-button lg:hidden" onClick={() => setMenuOpen(open => !open)} aria-expanded={menuOpen} aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}>
              {menuOpen ? <X className="h-4 w-4" aria-hidden="true" /> : <Menu className="h-4 w-4" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div className="mobile-overlay lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
            <p className="mono-label">
              <span className="tok-prompt">ted@abidjan:~$</span> ls
            </p>
            <nav aria-label="Navigation mobile" className="mt-2">
              {navItems.map((item, index) => (
                <motion.a
                  key={item.id}
                  href={`/#${item.id}`}
                  className="big"
                  onClick={() => setMenuOpen(false)}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.04, duration: 0.3, ease: easeOutExpo }}
                >
                  <span className="text-sm text-primary">{item.number}:</span>
                  <span className="tok-path">{item.label}/</span>
                </motion.a>
              ))}
            </nav>
            <div className="mt-auto flex flex-wrap items-center justify-between gap-4 pt-6">
              <a href={profile.cvUrl} target="_blank" rel="noreferrer" className="button-primary">
                <Download className="h-4 w-4" aria-hidden="true" /> cv.pdf
              </a>
              <span className="mono-label">Abidjan {time} GMT</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div id="main" className="pt-[var(--bar-h)]">
        {children}
      </div>

      <SiteFooter />
    </div>
  );
}

function SiteFooter() {
  const profile = useProfile();
  const links = [
    { label: "github", href: profile.githubUrl },
    { label: "linkedin", href: profile.linkedinUrl },
    { label: "email", href: `mailto:${profile.email}` },
    { label: "cv.pdf", href: profile.cvUrl },
  ].filter(link => link.href);

  return (
    <footer className="border-t border-border">
      <div className="container grid gap-8 py-12 font-mono text-sm md:grid-cols-[1.4fr_1fr]">
        <div>
          <p className="text-muted-foreground">
            <span className="tok-prompt">ted@abidjan:~$</span> cat signature.txt
          </p>
          <p className="mt-3 text-lg font-bold">{profile.displayName}</p>
          <p className="mt-1 max-w-md font-sans text-[15px] leading-7 text-muted-foreground">{profile.footerBio}</p>
        </div>
        <ul className="grid grid-cols-2 content-start gap-3 sm:grid-cols-4 md:grid-cols-2">
          {links.map(link => (
            <li key={link.label}>
              <a href={link.href} target={link.href.startsWith("mailto:") ? undefined : "_blank"} rel="noreferrer" className="link-mono">
                ./{link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div className="status-bar border-t">
        <span className="inline-flex items-center border-r border-border bg-primary px-3 font-bold text-primary-foreground">[0] portfolio</span>
        <span className="inline-flex items-center px-3 text-muted-foreground">© {new Date().getFullYear()} {profile.displayName}</span>
        <a href="#main" className="status-tab ml-auto border-l border-r-0">
          <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" /> haut
        </a>
      </div>
    </footer>
  );
}

/** Section du portfolio : une commande de terminal comme en-tête, puis un titre et le contenu. */
export function Section({ id, command, title, description, children }: { id: string; command: React.ReactNode; title: string; description?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="section">
      <div className="container">
        <Reveal>
          <p className="cmd-line">
            <span className="tok-prompt">ted@abidjan</span>
            <span className="tok-dim">:</span>
            <span className="tok-path">~</span>
            <span className="tok-dim">$ </span>
            {command}
          </p>
          <h2 className="section-title">{title}</h2>
          {description && <p className="mt-4 max-w-2xl text-[16px] leading-7 text-muted-foreground">{description}</p>}
        </Reveal>
        <div className="mt-10 md:mt-12">{children}</div>
      </div>
    </section>
  );
}

/** Apparition discrète au défilement (désactivée si l'utilisateur réduit les animations). */
export function Reveal({ children, className = "", delay = 0, as = "div" }: { children: React.ReactNode; className?: string; delay?: number; as?: "div" | "li" }) {
  const reduceMotion = useReducedMotion();
  const Component = as === "li" ? motion.li : motion.div;
  return (
    <Component
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.45, delay, ease: easeOutExpo }}
    >
      {children}
    </Component>
  );
}
