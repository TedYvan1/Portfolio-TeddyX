import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { ArrowUp, ArrowUpRight, Menu, Moon, Sun, X } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAbidjanTime, useProfile } from "@/lib/profile";
import { easeOutExpo } from "@/lib/motion";

export const navItems = [
  { number: "01", label: "Projets", href: "/#projects" },
  { number: "02", label: "Profil", href: "/#about" },
  { number: "03", label: "Compétences", href: "/#skills" },
  { number: "04", label: "Parcours", href: "/#journey" },
  { number: "05", label: "Contact", href: "/#contact" },
];

export function SiteLayout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const profile = useProfile();
  const time = useAbidjanTime();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <div className="grain min-h-screen bg-background text-foreground">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:bg-foreground focus:px-4 focus:py-2 focus:text-background">
        Aller au contenu
      </a>
      <header className={`site-header ${scrolled || menuOpen ? "scrolled" : ""}`}>
        <div className="container flex h-16 items-center justify-between gap-6 md:h-20">
          <Link href="/" className="group flex items-center gap-3" onClick={() => setMenuOpen(false)} aria-label="Accueil">
            <span className="brand-mark transition-colors group-hover:bg-primary group-hover:text-primary-foreground">TYK</span>
            <span className="hidden font-mono text-[11px] uppercase leading-tight tracking-[.14em] text-muted-foreground sm:block">
              {profile.displayName}
              <br />
              <span className="text-foreground">Abidjan {time} GMT</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-7 lg:flex" aria-label="Navigation principale">
            {navItems.map(item => (
              <a key={item.href} href={item.href} className="nav-link">
                <span>{item.number}</span>
                {item.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <button className="icon-button" onClick={toggleTheme} aria-label={theme === "dark" ? "Passer en thème clair" : "Passer en thème sombre"}>
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <a href={profile.cvUrl} target="_blank" rel="noreferrer" className="button-primary hidden min-h-9 px-4 sm:inline-flex">
              CV <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
            <button className="icon-button lg:hidden" onClick={() => setMenuOpen(open => !open)} aria-expanded={menuOpen} aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}>
              {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="mobile-overlay lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: easeOutExpo }}
          >
            <nav aria-label="Navigation mobile">
              {navItems.map((item, index) => (
                <motion.a
                  key={item.href}
                  href={item.href}
                  className="big"
                  onClick={() => setMenuOpen(false)}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 + index * 0.05, duration: 0.45, ease: easeOutExpo }}
                >
                  <span className="font-mono text-xs text-primary">{item.number}</span>
                  {item.label}
                </motion.a>
              ))}
            </nav>
            <div className="mt-auto flex items-center justify-between pt-8">
              <a href={profile.cvUrl} target="_blank" rel="noreferrer" className="button-primary">
                Télécharger le CV <ArrowUpRight className="h-4 w-4" />
              </a>
              <span className="mono-label">Abidjan {time}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div id="main">{children}</div>

      <SiteFooter />
    </div>
  );
}

function SiteFooter() {
  const profile = useProfile();
  const time = useAbidjanTime();
  const links = [
    { label: "GitHub", href: profile.githubUrl },
    { label: "LinkedIn", href: profile.linkedinUrl },
    { label: "Email", href: `mailto:${profile.email}` },
    { label: "CV", href: profile.cvUrl },
  ].filter(link => link.href);

  return (
    <footer className="relative overflow-hidden border-t border-foreground/15">
      <div className="container grid gap-10 py-14 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="font-serif text-3xl leading-tight md:text-4xl">{profile.displayName}</p>
          <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">{profile.footerBio}</p>
        </div>
        <ul className="grid grid-cols-2 gap-x-6 gap-y-3 md:col-span-4">
          {links.map(link => (
            <li key={link.label}>
              <a href={link.href} target={link.href.startsWith("mailto:") ? undefined : "_blank"} rel="noreferrer" className="group inline-flex items-center gap-1.5 text-sm">
                <span className="link-underline">{link.label}</span>
                <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            </li>
          ))}
        </ul>
        <div className="flex flex-col items-start gap-3 md:col-span-3 md:items-end">
          <span className="mono-label">Abidjan · {time} GMT</span>
          <span className="mono-label">© {new Date().getFullYear()} {profile.displayName}</span>
          <a href="#main" className="mono-label inline-flex items-center gap-1.5 hover:text-foreground">
            Retour en haut <ArrowUp className="h-3 w-3" />
          </a>
        </div>
      </div>
      <p aria-hidden="true" className="pointer-events-none select-none whitespace-nowrap px-[var(--gutter)] font-sans font-extrabold uppercase leading-[.75] tracking-[-.05em] text-foreground/[.07]" style={{ fontSize: "clamp(4rem, 18.5vw, 20rem)", marginBottom: "-0.12em" }}>
        Kamanan
      </p>
    </footer>
  );
}

/** Section numérotée comme un « saut » réseau : étiquette collante à gauche, contenu à droite. */
export function Hop({ id, number, label, children, className = "" }: { id?: string; number: string; label: string; children: React.ReactNode; className?: string }) {
  return (
    <section id={id} className={`hop scroll-mt-20 ${className}`}>
      <div className="container hop-grid">
        <div className="hop-rail">
          <div className="hop-rail-inner">
            <p className="hop-number">SAUT {number}</p>
            <p className="mt-2 font-mono text-[11px] uppercase tracking-[.14em] text-foreground">{label}</p>
            <div className="mt-4 hidden h-px w-16 bg-foreground/30 lg:block" />
          </div>
        </div>
        <div className="hop-content">{children}</div>
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
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, delay, ease: easeOutExpo }}
    >
      {children}
    </Component>
  );
}
