import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Download, Github, Linkedin, Menu, Moon, ShieldCheck, Sun, X } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { trpc } from "@/lib/trpc";

type RevealProps = { children: React.ReactNode; className?: string };

const navItems = [
  { label: "À propos", href: "/#about" },
  { label: "Compétences", href: "/#skills" },
  { label: "Certifications", href: "/#certifications" },
  { label: "Projets", href: "/projects" },
  { label: "Contact", href: "/#contact" },
];

const fallbackProfile = {
  displayName: "Ted Yvan KAMANAN",
  email: "y.vannky10@gmail.com",
  githubUrl: "https://github.com/TedYvan1",
  linkedinUrl: "https://www.linkedin.com/in/ted-yvan-kamanan-7b752038b",
  cvUrl: "/cv.pdf",
  footerBio: "Étudiant en réseaux, sécurité informatique et génie logiciel, à la recherche d'un stage.",
};

export function SiteLayout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [location] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.18 });
  const profileQuery = trpc.public.siteProfile.useQuery(undefined, { staleTime: 60_000 });
  const profile = (profileQuery.data as typeof fallbackProfile | null) ?? fallbackProfile;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="site-header">
        <motion.div className="scroll-progress" style={{ scaleX: progress }} aria-hidden="true" />
        <div className="container flex h-20 items-center justify-between">
          <Link href="/" className="flex items-center gap-3" onClick={() => setMenuOpen(false)}>
            <span className="brand-mark">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <span className="font-display text-lg font-semibold tracking-tight">{profile.displayName}</span>
          </Link>
          <nav className="hidden items-center gap-8 md:flex" aria-label="Navigation principale">
            {navItems.map(item => (
              <a key={item.href} href={item.href} className={`nav-link ${location === item.href ? "active" : ""}`}>
                {item.label}
              </a>
            ))}
          </nav>
          <div className="hidden items-center gap-3 md:flex">
            <a href={profile.cvUrl} className="button-ghost">
              <Download className="h-4 w-4" /> CV
            </a>
            <motion.button className="icon-button" whileTap={{ scale: 0.92 }} onClick={toggleTheme} aria-label="Changer de thème">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </motion.button>
          </div>
          <motion.button
            className="icon-button md:hidden"
            whileTap={{ scale: 0.92 }}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          >
            {menuOpen ? <X /> : <Menu />}
          </motion.button>
        </div>
        <AnimatePresence initial={false}>
          {menuOpen && (
            <motion.div
              className="mobile-menu md:hidden"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
            >
              <div className="container flex flex-col gap-2 py-4">
                {navItems.map((item, index) => (
                  <motion.a
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="mobile-nav-link"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.035 }}
                  >
                    {item.label}
                  </motion.a>
                ))}
                <div className="mt-3 flex gap-2 border-t border-border pt-4">
                  <a href={profile.cvUrl} className="button-ghost flex-1 justify-center">
                    <Download className="h-4 w-4" /> CV
                  </a>
                  <button className="button-outline flex-1 justify-center" onClick={toggleTheme}>
                    {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />} Thème
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
      {children}
      <footer className="border-t border-border/70 bg-card/30">
        <div className="container flex flex-col gap-6 py-10 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="brand-mark">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <span className="font-display font-semibold">{profile.displayName}</span>
            </div>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">{profile.footerBio}</p>
          </div>
          <div className="flex items-center gap-3">
            <a className="icon-button" href={profile.githubUrl} target="_blank" rel="noreferrer" aria-label="GitHub">
              <Github className="h-4 w-4" />
            </a>
            <a className="icon-button" href={profile.linkedinUrl} target="_blank" rel="noreferrer" aria-label="LinkedIn">
              <Linkedin className="h-4 w-4" />
            </a>
            <a className="text-sm text-muted-foreground transition-colors hover:text-primary" href={`mailto:${profile.email}`}>
              {profile.email}
            </a>
          </div>
        </div>
        <div className="container flex flex-col gap-2 border-t border-border/50 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} {profile.displayName}. Tous droits réservés.</span>
          <span>Conçu et développé par {profile.displayName}</span>
        </div>
      </footer>
    </div>
  );
}

export function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <div className="mb-10 max-w-2xl">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight md:text-4xl">{title}</h2>
      {description && <p className="mt-4 text-base leading-7 text-muted-foreground">{description}</p>}
    </div>
  );
}

export function ScrollReveal({ children, className = "" }: RevealProps) {
  const reduceMotion = useReducedMotion();
  const delay = className.includes("delay-1") ? 0.08 : className.includes("delay-2") ? 0.16 : className.includes("delay-3") ? 0.24 : 0;
  return (
    <motion.div
      className={className.replace(/delay-[123]/g, "")}
      initial={reduceMotion ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.16, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.62, delay, ease: [0.23, 1, 0.32, 1] }}
    >
      {children}
    </motion.div>
  );
}
