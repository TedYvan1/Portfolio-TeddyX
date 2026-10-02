import { AnimatePresence, motion, useMotionValue, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowUpRight, Download, Github, Linkedin, Menu, Moon, ShieldCheck, Sun, X } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { trpc } from "@/lib/trpc";
import { BlurText } from "@/components/effects/BlurText";
import { Magnet } from "@/components/effects/Magnet";

type RevealProps = { children: React.ReactNode; className?: string };

const navItems = [
  { label: "À propos", href: "/#about" },
  { label: "Compétences", href: "/#skills" },
  { label: "Certifications", href: "/#certifications" },
  { label: "Projets", href: "/projects" },
  { label: "Contact", href: "/#contact" },
];

const fallbackProfile = {
  displayName: "yvan.dev",
  email: "y.vannky10@gmail.com",
  githubUrl: "https://github.com/",
  linkedinUrl: "https://linkedin.com/",
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
      <CustomCursor />
      <header className="site-header">
        <motion.div className="scroll-progress" style={{ scaleX: progress }} aria-hidden="true" />
        <div className="container flex h-20 items-center justify-between">
          <Link href="/" className="flex items-center gap-3" onClick={() => setMenuOpen(false)}>
            <Magnet strength={0.22}>
              <motion.span className="brand-mark" whileHover={{ rotate: -6, scale: 1.05 }} transition={{ duration: 0.2 }}>
                <ShieldCheck className="h-5 w-5" />
              </motion.span>
            </Magnet>
            <span className="font-display text-lg font-semibold tracking-tight">
              {profile.displayName.split(".")[0]}
              <span className="text-primary">.{profile.displayName.split(".")[1] ?? "dev"}</span>
            </span>
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
            <Link href="/admin" className="button-outline">
              Admin <ArrowUpRight className="h-4 w-4" />
            </Link>
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
          <span>© 2025 {profile.displayName}. Tous droits réservés.</span>
          <span>Conçu et développé avec React · Framer Motion · React Bits</span>
        </div>
      </footer>
    </div>
  );
}

export function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <div className="mb-10 max-w-2xl">
      <p className="eyebrow">{eyebrow}</p>
      <BlurText text={title} as="h2" className="mt-3 font-display text-3xl font-semibold tracking-tight md:text-4xl" stagger={0.02} />
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
      initial={reduceMotion ? false : { opacity: 0, y: 26, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.16, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.62, delay, ease: [0.23, 1, 0.32, 1] }}
    >
      {children}
    </motion.div>
  );
}

function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);
  const springX = useSpring(mouseX, { stiffness: 420, damping: 34, mass: 0.18 });
  const springY = useSpring(mouseY, { stiffness: 420, damping: 34, mass: 0.18 });

  useEffect(() => {
    const media = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => setEnabled(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    document.body.classList.add("custom-cursor-enabled");
    const move = (event: PointerEvent) => {
      mouseX.set(event.clientX);
      mouseY.set(event.clientY);
    };
    const over = (event: PointerEvent) => {
      const target = event.target as HTMLElement;
      setHovering(Boolean(target.closest("a, button, input, textarea, select, [role='button']")));
    };
    const leave = () => setHovering(false);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerover", over, { passive: true });
    window.addEventListener("blur", leave);
    return () => {
      document.body.classList.remove("custom-cursor-enabled");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
      window.removeEventListener("blur", leave);
    };
  }, [enabled, mouseX, mouseY]);

  if (!enabled) return null;
  return (
    <>
      <motion.span className={`custom-cursor-dot ${hovering ? "hovering" : ""}`} style={{ x: springX, y: springY }} />
      <motion.span className={`custom-cursor-ring ${hovering ? "hovering" : ""}`} style={{ x: springX, y: springY }} />
    </>
  );
}
