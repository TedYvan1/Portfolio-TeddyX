import { motion, useReducedMotion } from "framer-motion";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, Download } from "lucide-react";
import type { Certification, Education, Language, Project, Skill } from "@shared/types";
import { useTheme } from "@/contexts/ThemeContext";
import { splitList, useProfile, type Profile } from "@/lib/profile";
import { easeOutExpo } from "@/lib/motion";

type HeroData = { projects: Project[]; skills: Skill[]; educations: Education[]; certifications: Certification[]; languages: Language[] };

export function Hero(data: HeroData) {
  const profile = useProfile();
  const reduceMotion = useReducedMotion();
  const appear = (delay: number) => ({
    initial: reduceMotion ? false : { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay, ease: easeOutExpo },
  });

  return (
    <section className="container pb-16 pt-10 md:pb-24 md:pt-16" aria-labelledby="hero-name">
      <motion.p className="cmd-line text-muted-foreground" {...appear(0)}>
        <span className="tok-prompt">ted@abidjan</span>:<span className="tok-path">~</span>$ echo $NOM
      </motion.p>
      <motion.h1 id="hero-name" className="hero-name mt-3" {...appear(0.08)}>
        {profile.displayName}
        <span className="cursor ml-2" aria-hidden="true" />
      </motion.h1>
      <motion.p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground md:text-xl" {...appear(0.16)}>
        <span className="text-foreground">{profile.role}.</span> {profile.heroTitle} <span className="tok-str">{profile.heroTitleAccent}</span> {profile.heroSubtitle}
      </motion.p>
      <motion.div className="mt-7 flex flex-wrap gap-3" {...appear(0.24)}>
        <a href="#projects" className="button-primary">
          ./voir-projets <ArrowDown className="h-4 w-4" aria-hidden="true" />
        </a>
        <a href={profile.cvUrl} target="_blank" rel="noreferrer" className="button-outline">
          <Download className="h-4 w-4" aria-hidden="true" /> cv.pdf
        </a>
      </motion.div>

      <motion.div className="mt-12 grid gap-4 lg:grid-cols-12" {...appear(0.32)}>
        <div className="lg:col-span-7">
          <Terminal profile={profile} data={data} />
        </div>
        <div className="lg:col-span-5">
          <Neofetch profile={profile} data={data} />
        </div>
      </motion.div>
    </section>
  );
}

/* ───────────── neofetch ───────────── */

const LOGO = [
  "████████╗██╗   ██╗██╗  ██╗",
  "╚══██╔══╝╚██╗ ██╔╝██║ ██╔╝",
  "   ██║    ╚████╔╝ █████╔╝ ",
  "   ██║     ╚██╔╝  ██╔═██╗ ",
  "   ██║      ██║   ██║  ██╗",
  "   ╚═╝      ╚═╝   ╚═╝  ╚═╝",
];

const shortTitle = (title: string) => title.replace(/\s*-\s*/, " ").replace("Réseaux et Sécurité Informatique", "Réseaux & Sécu");

function Neofetch({ profile, data }: { profile: Profile; data: HeroData }) {
  const schools = data.educations.filter(item => /licence|master|bts|dut/i.test(item.title)).slice(0, 2);
  const rows: [string, React.ReactNode][] = [
    ["Rôle", profile.role],
    ["Lieu", profile.heroLocation],
    ...schools.map((item, index): [string, React.ReactNode] => [index === 0 ? "Formation" : "", `${shortTitle(item.title)} · ${item.institution.match(/\(([^)]+)\)/)?.[1] ?? item.institution}`]),
    ["Stack", splitList(profile.codeStack).join(", ")],
    ["Projets", `${data.projects.length} publiés`],
    ["Certifs", `${data.certifications.length}`],
    ["Langues", data.languages.map(item => item.name).join(", ") || "Français, Anglais"],
    ["Statut", <span className="text-primary">{profile.availability}</span>],
  ];

  return (
    <div className="pane h-full">
      <div className="pane-bar">
        <span className="pane-dots" aria-hidden="true"><i /><i /><i /></span>
        <span>neofetch</span>
      </div>
      <div className="pane-body grid gap-5 sm:grid-cols-[auto_1fr] lg:grid-cols-1 xl:grid-cols-1">
        <pre className="overflow-hidden text-[7px] leading-[1.05] text-primary sm:text-[8px]" aria-hidden="true">{LOGO.join("\n")}</pre>
        <div className="min-w-0">
          <p>
            <span className="tok-prompt font-bold">ted</span>@<span className="tok-prompt font-bold">abidjan</span>
          </p>
          <p className="tok-dim" aria-hidden="true">───────────</p>
          <dl className="mt-1 grid grid-cols-[5.5rem_1fr] gap-x-2 text-[12.5px] leading-6">
            {rows.map(([key, value], index) => (
              <Fragment key={index}>
                <dt className="font-bold text-cyan">{key}</dt>
                <dd className="min-w-0 break-words">{value}</dd>
              </Fragment>
            ))}
          </dl>
          <div className="mt-4 flex gap-1" aria-hidden="true">
            {["bg-foreground", "bg-primary", "bg-amber", "bg-cyan", "bg-destructive", "bg-muted-foreground", "bg-border"].map(color => (
              <span key={color} className={`h-4 w-6 ${color}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────── Terminal interactif ───────────── */

type Line = { id: number; kind: "cmd" | "out"; node: React.ReactNode };

const COMMANDS = ["help", "whoami", "about", "projets", "skills", "parcours", "contact", "ping", "cv", "github", "linkedin", "theme", "clear", "sudo embauche"];
const BOOT = ["whoami", "ls projets/"];
const SECTION_FOR: Record<string, string> = { projets: "projects", about: "about", profil: "about", skills: "skills", competences: "skills", "compétences": "skills", parcours: "journey", contact: "contact" };

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

function Terminal({ profile, data }: { profile: Profile; data: HeroData }) {
  const reduceMotion = useReducedMotion();
  const { toggleTheme } = useTheme();
  const [lines, setLines] = useState<Line[]>([]);
  const [input, setInput] = useState("");
  const [booting, setBooting] = useState(true);
  const [history, setHistory] = useState<string[]>([]);
  const historyIndex = useRef(-1);
  const nextId = useRef(0);
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const run = useMemo(() => {
    const link = (href: string, label: string) => (
      <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="link-mono">
        {label}
      </a>
    );
    const goto = (id: string, label: string) => (
      <button type="button" className="link-mono" onClick={() => scrollToSection(id)}>
        {label}
      </button>
    );

    return (raw: string): React.ReactNode | "clear" => {
      const cmd = raw.trim().replace(/\s+/g, " ");
      const [name, ...args] = cmd.toLowerCase().split(" ");
      if (!cmd) return null;
      switch (name) {
        case "help":
          return (
            <div className="grid grid-cols-[8.5rem_1fr] gap-x-3">
              {[
                ["whoami", "qui je suis"],
                ["about", "mon profil"],
                ["projets", "mes projets"],
                ["skills", "mes compétences"],
                ["parcours", "formations & certifs"],
                ["contact", "me contacter"],
                ["ping", "tester la connexion"],
                ["cv", "ouvrir mon CV"],
                ["github · linkedin", "mes profils"],
                ["theme", "clair / sombre"],
                ["clear", "effacer l'écran"],
              ].map(([key, desc]) => (
                <Fragment key={key}>
                  <span className="text-primary">{key}</span>
                  <span className="tok-dim">{desc}</span>
                </Fragment>
              ))}
              <span className="col-span-2 mt-1 tok-dim">astuce : ↑ ↓ pour l'historique, Tab pour compléter.</span>
            </div>
          );
        case "whoami":
          return (
            <>
              <p className="font-bold">{profile.displayName}</p>
              <p className="tok-dim">{profile.role} — {profile.heroLocation}</p>
            </>
          );
        case "about":
        case "profil":
        case "cat":
          return (
            <>
              <p>{profile.heroDescription}</p>
              <p className="mt-1">→ {goto("about", "cd ~/profil")}</p>
            </>
          );
        case "ls":
          if (args[0]?.startsWith("projets")) {
            return data.projects.length ? (
              <div className="flex flex-wrap gap-x-5">
                {data.projects.map(project => (
                  <a key={project.id} href={`/projects/${project.slug}`} className="tok-path hover:underline">
                    {project.slug}/
                  </a>
                ))}
              </div>
            ) : (
              <span className="tok-dim">(chargement…)</span>
            );
          }
          return (
            <div className="flex flex-wrap gap-x-5">
              {["projets/", "profil/", "skills/", "parcours/"].map(dir => (
                <span key={dir} className="tok-path">{dir}</span>
              ))}
              <span>cv.pdf</span>
              <span className="text-primary">contact.sh*</span>
            </div>
          );
        case "projets":
        case "projects":
          return (
            <>
              {data.projects.map(project => (
                <p key={project.id}>
                  <a href={`/projects/${project.slug}`} className="tok-path hover:underline">{project.title}</a>
                  <span className="tok-dim"> — {splitList(project.technologies).slice(0, 3).join(", ")}</span>
                </p>
              ))}
              <p className="mt-1">→ {goto("projects", "cd ~/projets")}</p>
            </>
          );
        case "skills":
        case "competences":
        case "compétences": {
          const groups = data.skills.reduce<Record<string, string[]>>((acc, skill) => ((acc[skill.category] ??= []).push(skill.name), acc), {});
          return (
            <>
              {Object.entries(groups).map(([category, names]) => (
                <p key={category}>
                  <span className="text-cyan">{category}</span> <span className="tok-dim">{names.join(", ")}</span>
                </p>
              ))}
              <p className="mt-1">→ {goto("skills", "cd ~/skills")}</p>
            </>
          );
        }
        case "parcours":
          return (
            <>
              {data.educations.map(item => (
                <p key={item.id}>
                  <span className="tok-str">{item.period}</span> {item.title}
                </p>
              ))}
              <p className="mt-1">→ {goto("journey", "cd ~/parcours")}</p>
            </>
          );
        case "contact":
        case "./contact.sh":
          return (
            <>
              <p>email : {link(`mailto:${profile.email}`, profile.email)}</p>
              <p>tél. : {link(`tel:${profile.phone.replace(/\s+/g, "")}`, profile.phone)}</p>
              <p className="mt-1">→ {goto("contact", "ouvrir le formulaire")}</p>
            </>
          );
        case "cv":
          window.open(profile.cvUrl, "_blank", "noopener");
          return <p>Ouverture de {link(profile.cvUrl, "cv.pdf")}…</p>;
        case "github":
          window.open(profile.githubUrl, "_blank", "noopener");
          return <p>→ {link(profile.githubUrl, profile.githubUrl.replace(/^https?:\/\//, ""))}</p>;
        case "linkedin":
          window.open(profile.linkedinUrl, "_blank", "noopener");
          return <p>→ {link(profile.linkedinUrl, "linkedin.com/in/…")}</p>;
        case "theme":
          toggleTheme?.();
          return <p className="tok-dim">Thème basculé.</p>;
        case "cd": {
          const target = SECTION_FOR[(args[0] ?? "").replace(/^~\/?|\/$/g, "")];
          if (target) {
            scrollToSection(target);
            return null;
          }
          return <p className="text-destructive">cd : {args[0] ?? ""} : aucun dossier de ce nom</p>;
        }
        case "sudo":
          if (/^(embauche|hire|hire-me|recrute)/.test(args.join(" "))) {
            return (
              <>
                <p className="tok-dim">[sudo] mot de passe pour recruteur : ********</p>
                <p className="text-primary">Accès accordé. Je suis disponible : {profile.availability.toLowerCase()}.</p>
                <p>→ {goto("contact", "./contact.sh")}</p>
              </>
            );
          }
          return <p className="text-destructive">recruteur n'est pas dans le fichier sudoers. Essayez : sudo embauche</p>;
        case "ping":
          return (
            <>
              <p>PING ted.kamanan ({profile.heroLocation}) : 56 octets de données.</p>
              {[12, 9, 11].map((ms, seq) => (
                <p key={seq} className="tok-dim">64 octets de ted.kamanan : icmp_seq={seq + 1} ttl=64 temps={ms} ms</p>
              ))}
              <p>
                <span className="text-primary">0 % de perte</span> — je réponds aux messages sous 48 h. → {goto("contact", "./contact.sh")}
              </p>
            </>
          );
        case "clear":
          return "clear";
        default:
          return (
            <p>
              <span className="text-destructive">{name} : commande introuvable.</span> <span className="tok-dim">Tapez</span> <span className="text-primary">help</span>
            </p>
          );
      }
    };
  }, [profile, data, toggleTheme]);

  const push = (kind: Line["kind"], node: React.ReactNode) => setLines(current => [...current, { id: nextId.current++, kind, node }]);

  // La séquence de démarrage est asynchrone : elle doit toujours utiliser les données les plus récentes.
  const runRef = useRef(run);
  runRef.current = run;

  const execute = (command: string) => {
    const result = runRef.current(command);
    if (result === "clear") {
      setLines([]);
      return;
    }
    push("cmd", command);
    if (result) push("out", result);
  };

  // Séquence de démarrage : quelques commandes tapées automatiquement (instantanées si animations réduites).
  // On attend les projets (pour « ls projets/ »), sans bloquer le terminal plus de 2,5 s si l'API est lente.
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (data.projects.length) return setReady(true);
    const timeout = window.setTimeout(() => setReady(true), 2500);
    return () => window.clearTimeout(timeout);
  }, [data.projects.length]);

  const booted = useRef(false);
  useEffect(() => {
    if (booted.current || !ready) return;
    booted.current = true;
    if (reduceMotion) {
      BOOT.forEach(execute);
      setBooting(false);
      return;
    }
    let cancelled = false;
    const sleep = (ms: number) => new Promise(resolve => window.setTimeout(resolve, ms));
    (async () => {
      await sleep(700);
      for (const command of BOOT) {
        for (let i = 1; i <= command.length && !cancelled; i++) {
          setInput(command.slice(0, i));
          await sleep(55);
        }
        await sleep(180);
        if (cancelled) return;
        setInput("");
        execute(command);
        await sleep(450);
      }
      if (!cancelled) setBooting(false);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, reduceMotion]);

  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [lines]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (booting || !input.trim()) return;
    execute(input);
    setHistory(current => [input, ...current].slice(0, 30));
    historyIndex.current = -1;
    setInput("");
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      if (!history.length) return;
      event.preventDefault();
      const next = event.key === "ArrowUp" ? Math.min(historyIndex.current + 1, history.length - 1) : historyIndex.current - 1;
      historyIndex.current = next;
      setInput(next >= 0 ? history[next] : "");
    } else if (event.key === "Tab" && input.trim()) {
      const match = COMMANDS.find(command => command.startsWith(input.trim().toLowerCase()));
      if (match) {
        event.preventDefault();
        setInput(match);
      }
    }
  };

  return (
    <div className="pane h-full" onClick={() => !booting && window.getSelection()?.isCollapsed && inputRef.current?.focus({ preventScroll: true })}>
      <div className="pane-bar">
        <span className="pane-dots" aria-hidden="true"><i /><i /><i /></span>
        <span>bash — ted@abidjan</span>
        <span className="ml-auto hidden sm:inline">tapez help</span>
      </div>
      <div ref={logRef} className="pane-body term-log" role="log" aria-live="polite" aria-label="Sortie du terminal">
        <p className="tok-dim">Bienvenue sur le portfolio de {profile.displayName}. Tapez « help » pour la liste des commandes.</p>
        {lines.map(line =>
          line.kind === "cmd" ? (
            <p key={line.id} className="mt-3">
              <span className="tok-prompt">ted@abidjan</span>:<span className="tok-path">~</span>$ {line.node}
            </p>
          ) : (
            <div key={line.id} className="mt-1">{line.node}</div>
          ),
        )}
        <form onSubmit={submit} className="mt-3 flex items-center gap-2">
          <label htmlFor="terminal-input" className="shrink-0">
            <span className="tok-prompt">ted@abidjan</span>:<span className="tok-path">~</span>$
            <span className="sr-only">Commande</span>
          </label>
          <input
            ref={inputRef}
            id="terminal-input"
            className="term-input"
            value={input}
            onChange={event => setInput(event.target.value)}
            onKeyDown={onKeyDown}
            readOnly={booting}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            placeholder={booting ? "" : "help"}
            aria-describedby="terminal-hint"
          />
        </form>
      </div>
      <div className="flex flex-wrap gap-2 border-t border-border p-3" aria-label="Commandes rapides">
        <span id="terminal-hint" className="sr-only">Tapez une commande puis Entrée, ou utilisez les boutons de commandes rapides.</span>
        {["help", "whoami", "projets", "skills", "contact", "sudo embauche"].map(command => (
          <button key={command} type="button" className="term-chip" disabled={booting} onClick={() => execute(command)}>
            {command}
          </button>
        ))}
      </div>
    </div>
  );
}
