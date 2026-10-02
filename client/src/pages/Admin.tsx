import { useEffect, useState } from "react";
import { BarChart3, ChevronRight, FileText, FolderKanban, GraduationCap, Layers, LayoutDashboard, LogOut, Menu, Plus, Save, ShieldAlert, Trash2, User, X } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import type { Project, Skill, Message, SiteProfile, AboutCard, Certification } from "@shared/types";

type Section = "overview" | "projects" | "skills" | "messages" | "profile" | "about" | "certifications";
type ProjectDraft = { title: string; slug: string; shortDescription: string; description: string; imageUrl: string; githubUrl: string; liveUrl: string; category: string; technologies: string; featured: number; published: number };
type SkillDraft = { name: string; category: string; level: "Beginner" | "Intermediate" | "Advanced"; icon: string; description: string; displayOrder: number };
type ProfileDraft = Omit<SiteProfile, "id" | "createdAt" | "updatedAt">;
type AboutCardDraft = { label: string; title: string; description: string; displayOrder: number };
type CertDraft = { title: string; issuer: string; dateLabel: string; type: string; description: string; linkUrl: string; displayOrder: number };

const blankProject: ProjectDraft = { title: "", slug: "", shortDescription: "", description: "", imageUrl: "", githubUrl: "", liveUrl: "", category: "Full-Stack", technologies: "", featured: 0, published: 1 };
const blankSkill: SkillDraft = { name: "", category: "Frontend", level: "Intermediate", icon: "Code2", description: "", displayOrder: 0 };
const blankAbout: AboutCardDraft = { label: "01", title: "", description: "", displayOrder: 0 };
const blankCert: CertDraft = { title: "", issuer: "", dateLabel: "", type: "Réseaux", description: "", linkUrl: "", displayOrder: 0 };

export default function Admin() {
  const { user, loading, logout } = useAuth();
  if (loading) return <div className="admin-loading"><div className="loader-orbit" /><p>Vérification de la session...</p></div>;
  if (!user) return <AdminLogin />;
  if (user.role !== "admin") return <div className="admin-loading"><ShieldAlert className="h-8 w-8 text-primary" /><h1 className="mt-4 font-display text-2xl font-semibold">Accès administrateur requis</h1><p className="mt-2 max-w-md text-center text-sm text-muted-foreground">Votre compte est bien connecté, mais il ne possède pas les droits de gestion du portfolio.</p><button onClick={() => logout()} className="button-outline mt-6">Se déconnecter <LogOut className="h-4 w-4" /></button></div>;
  return <AdminShell logout={logout} />;
}

function AdminLogin() {
  return (
    <div className="admin-login">
      <div className="admin-login-card">
        <div className="brand-mark mx-auto"><ShieldAlert className="h-5 w-5" /></div>
        <p className="eyebrow mt-7 text-center">Espace privé</p>
        <h1 className="mt-3 text-center font-display text-3xl font-semibold">Content studio</h1>
        <p className="mt-4 text-center text-sm leading-6 text-muted-foreground">Connectez-vous pour gérer tout le contenu du portfolio.</p>
        <a href="/admin/login" className="button-primary mt-8 w-full justify-center">Se connecter <ChevronRight className="h-4 w-4" /></a>
        <a href="/" className="mt-5 block text-center text-sm text-muted-foreground hover:text-primary">← Retour au portfolio</a>
      </div>
    </div>
  );
}

function AdminShell({ logout }: { logout: () => Promise<void> }) {
  const [section, setSection] = useState<Section>("overview");
  const [mobileOpen, setMobileOpen] = useState(false);
  const overview = trpc.admin.overview.useQuery(undefined, { staleTime: 15_000 });
  const projects = trpc.admin.projects.useQuery(undefined, { staleTime: 15_000 });
  const skills = trpc.admin.skills.useQuery(undefined, { staleTime: 15_000 });
  const messages = trpc.admin.messages.useQuery(undefined, { staleTime: 15_000 });
  const profileQ = trpc.admin.siteProfile.useQuery(undefined, { staleTime: 15_000 });
  const aboutCardsQ = trpc.admin.aboutCards.useQuery(undefined, { staleTime: 15_000 });
  const certsQ = trpc.admin.certifications.useQuery(undefined, { staleTime: 15_000 });
  const utils = trpc.useUtils();

  // Projects
  const [projectDraft, setProjectDraft] = useState<ProjectDraft>(blankProject);
  const [editingProject, setEditingProject] = useState<number | null>(null);
  const createProject = trpc.admin.createProject.useMutation({ onSuccess: () => { toast.success("Projet créé"); setProjectDraft(blankProject); utils.admin.invalidate(); }, onError: error => toast.error(error.message) });
  const updateProject = trpc.admin.updateProject.useMutation({ onSuccess: () => { toast.success("Projet mis à jour"); setProjectDraft(blankProject); setEditingProject(null); utils.admin.invalidate(); }, onError: error => toast.error(error.message) });
  const deleteProject = trpc.admin.deleteProject.useMutation({ onSuccess: () => { toast.success("Projet supprimé"); utils.admin.invalidate(); }, onError: error => toast.error(error.message) });

  // Skills
  const [skillDraft, setSkillDraft] = useState<SkillDraft>(blankSkill);
  const [editingSkill, setEditingSkill] = useState<number | null>(null);
  const createSkill = trpc.admin.createSkill.useMutation({ onSuccess: () => { toast.success("Compétence ajoutée"); setSkillDraft(blankSkill); utils.admin.invalidate(); }, onError: error => toast.error(error.message) });
  const updateSkill = trpc.admin.updateSkill.useMutation({ onSuccess: () => { toast.success("Compétence mise à jour"); setSkillDraft(blankSkill); setEditingSkill(null); utils.admin.invalidate(); }, onError: error => toast.error(error.message) });
  const deleteSkill = trpc.admin.deleteSkill.useMutation({ onSuccess: () => { toast.success("Compétence supprimée"); utils.admin.invalidate(); }, onError: error => toast.error(error.message) });

  // Profile
  const [profileDraft, setProfileDraft] = useState<ProfileDraft | null>(null);
  useEffect(() => { if (profileQ.data && !profileDraft) { const { id, createdAt, updatedAt, ...rest } = profileQ.data as SiteProfile; setProfileDraft(rest as ProfileDraft); } }, [profileQ.data]);
  const upsertProfile = trpc.admin.upsertSiteProfile.useMutation({ onSuccess: () => { toast.success("Profil mis à jour"); utils.admin.invalidate(); utils.public.invalidate(); }, onError: error => toast.error(error.message) });

  // About cards
  const [aboutDraft, setAboutDraft] = useState<AboutCardDraft>(blankAbout);
  const [editingAbout, setEditingAbout] = useState<number | null>(null);
  const createAbout = trpc.admin.createAboutCard.useMutation({ onSuccess: () => { toast.success("Carte ajoutée"); setAboutDraft(blankAbout); utils.admin.invalidate(); utils.public.invalidate(); }, onError: error => toast.error(error.message) });
  const updateAbout = trpc.admin.updateAboutCard.useMutation({ onSuccess: () => { toast.success("Carte mise à jour"); setAboutDraft(blankAbout); setEditingAbout(null); utils.admin.invalidate(); utils.public.invalidate(); }, onError: error => toast.error(error.message) });
  const deleteAbout = trpc.admin.deleteAboutCard.useMutation({ onSuccess: () => { toast.success("Carte supprimée"); utils.admin.invalidate(); utils.public.invalidate(); }, onError: error => toast.error(error.message) });

  // Certifications
  const [certDraft, setCertDraft] = useState<CertDraft>(blankCert);
  const [editingCert, setEditingCert] = useState<number | null>(null);
  const createCert = trpc.admin.createCertification.useMutation({ onSuccess: () => { toast.success("Certification ajoutée"); setCertDraft(blankCert); utils.admin.invalidate(); utils.public.invalidate(); }, onError: error => toast.error(error.message) });
  const updateCert = trpc.admin.updateCertification.useMutation({ onSuccess: () => { toast.success("Certification mise à jour"); setCertDraft(blankCert); setEditingCert(null); utils.admin.invalidate(); utils.public.invalidate(); }, onError: error => toast.error(error.message) });
  const deleteCert = trpc.admin.deleteCertification.useMutation({ onSuccess: () => { toast.success("Certification supprimée"); utils.admin.invalidate(); utils.public.invalidate(); }, onError: error => toast.error(error.message) });

  const markRead = trpc.admin.markMessageAsRead.useMutation({ onSuccess: () => utils.admin.invalidate(), onError: error => toast.error(error.message) });
  const deleteMessage = trpc.admin.deleteMessage.useMutation({ onSuccess: () => { toast.success("Message supprimé"); utils.admin.invalidate(); }, onError: error => toast.error(error.message) });

  const nav = [
    { key: "overview" as const, label: "Vue d'ensemble", icon: LayoutDashboard },
    { key: "profile" as const, label: "Profil & CV", icon: User },
    { key: "about" as const, label: "À propos", icon: Layers },
    { key: "certifications" as const, label: "Certifications", icon: GraduationCap, count: certsQ.data?.length },
    { key: "projects" as const, label: "Projets", icon: FolderKanban, count: overview.data?.projects },
    { key: "skills" as const, label: "Compétences", icon: BarChart3, count: overview.data?.skills },
    { key: "messages" as const, label: "Messages", icon: FileText, count: overview.data?.unread },
  ];
  const selectSection = (next: Section) => { setSection(next); setMobileOpen(false); };
  const saveProject = (event: React.FormEvent) => { event.preventDefault(); const payload = { ...projectDraft, imageUrl: projectDraft.imageUrl || undefined, githubUrl: projectDraft.githubUrl || undefined, liveUrl: projectDraft.liveUrl || undefined }; if (editingProject) updateProject.mutate({ ...payload, id: editingProject }); else createProject.mutate(payload); };
  const saveSkill = (event: React.FormEvent) => { event.preventDefault(); if (editingSkill) updateSkill.mutate({ ...skillDraft, icon: skillDraft.icon || undefined, description: skillDraft.description || undefined, id: editingSkill }); else createSkill.mutate({ ...skillDraft, icon: skillDraft.icon || undefined, description: skillDraft.description || undefined }); };
  const saveAbout = (event: React.FormEvent) => { event.preventDefault(); if (editingAbout) updateAbout.mutate({ ...aboutDraft, id: editingAbout }); else createAbout.mutate(aboutDraft); };
  const saveCert = (event: React.FormEvent) => { event.preventDefault(); const payload = { ...certDraft, linkUrl: certDraft.linkUrl || undefined }; if (editingCert) updateCert.mutate({ ...payload, id: editingCert }); else createCert.mutate(payload); };
  const saveProfile = (event: React.FormEvent) => { event.preventDefault(); if (profileDraft) upsertProfile.mutate(profileDraft); };
  const editProject = (project: Project) => { setEditingProject(project.id); setProjectDraft({ title: project.title, slug: project.slug, shortDescription: project.shortDescription, description: project.description, imageUrl: project.imageUrl ?? "", githubUrl: project.githubUrl ?? "", liveUrl: project.liveUrl ?? "", category: project.category, technologies: project.technologies, featured: project.featured, published: project.published }); setSection("projects"); };
  const editSkill = (skill: Skill) => { setEditingSkill(skill.id); setSkillDraft({ name: skill.name, category: skill.category, level: skill.level, icon: skill.icon ?? "", description: skill.description ?? "", displayOrder: skill.displayOrder }); setSection("skills"); };
  const editAbout = (card: AboutCard) => { setEditingAbout(card.id); setAboutDraft({ label: card.label, title: card.title, description: card.description, displayOrder: card.displayOrder }); setSection("about"); };
  const editCert = (cert: Certification) => { setEditingCert(cert.id); setCertDraft({ title: cert.title, issuer: cert.issuer, dateLabel: cert.dateLabel, type: cert.type, description: cert.description, linkUrl: cert.linkUrl ?? "", displayOrder: cert.displayOrder }); setSection("certifications"); };

  return (
    <div className="admin-layout">
      <aside className={`admin-sidebar ${mobileOpen ? "open" : ""}`}>
        <div className="flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <span className="brand-mark"><ShieldAlert className="h-4 w-4" /></span>
            <span className="font-display font-semibold">content<span className="text-primary">.studio</span></span>
          </a>
          <button className="icon-button md:hidden" onClick={() => setMobileOpen(false)}><X /></button>
        </div>
        <div className="mt-12">
          <p className="eyebrow px-3 text-[10px]">Workspace</p>
          <nav className="mt-3 space-y-1">
            {nav.map(item => (
              <button key={item.key} onClick={() => selectSection(item.key)} className={`admin-nav-item ${section === item.key ? "active" : ""}`}>
                <item.icon className="h-4 w-4" /><span>{item.label}</span>{item.count !== undefined && <span className="ml-auto text-xs text-muted-foreground">{item.count}</span>}
              </button>
            ))}
          </nav>
        </div>
        <div className="mt-auto border-t border-border/70 pt-5">
          <a href="/" className="admin-nav-item"><ChevronRight className="h-4 w-4 rotate-180" /> Voir le site</a>
          <button onClick={() => logout()} className="admin-nav-item text-muted-foreground"><LogOut className="h-4 w-4" /> Déconnexion</button>
        </div>
      </aside>
      <div className="admin-main">
        <header className="admin-topbar">
          <button className="icon-button md:hidden" onClick={() => setMobileOpen(true)}><Menu /></button>
          <div><p className="eyebrow hidden sm:block">Content studio / 2025</p><h1 className="font-display text-xl font-semibold md:text-2xl">{nav.find(item => item.key === section)?.label}</h1></div>
          <div className="ml-auto flex items-center gap-3"><span className="hidden text-sm text-muted-foreground sm:block">Admin</span><span className="avatar-dot">A</span></div>
        </header>
        <main className="admin-content">
          {section === "overview" && <Overview data={overview.data} onNavigate={selectSection} />}
          {section === "profile" && profileDraft && <ProfileManager draft={profileDraft} setDraft={setProfileDraft} onSubmit={saveProfile} pending={upsertProfile.isPending} />}
          {section === "profile" && !profileDraft && <p className="text-sm text-muted-foreground">Chargement du profil...</p>}
          {section === "about" && <AboutManager cards={aboutCardsQ.data ?? []} draft={aboutDraft} setDraft={setAboutDraft} editingId={editingAbout} onEdit={editAbout} onCancel={() => { setEditingAbout(null); setAboutDraft(blankAbout); }} onSubmit={saveAbout} onDelete={id => deleteAbout.mutate({ id })} pending={createAbout.isPending || updateAbout.isPending} />}
          {section === "certifications" && <CertificationsManager certs={certsQ.data ?? []} draft={certDraft} setDraft={setCertDraft} editingId={editingCert} onEdit={editCert} onCancel={() => { setEditingCert(null); setCertDraft(blankCert); }} onSubmit={saveCert} onDelete={id => deleteCert.mutate({ id })} pending={createCert.isPending || updateCert.isPending} />}
          {section === "projects" && <ProjectsManager projects={projects.data ?? []} draft={projectDraft} setDraft={setProjectDraft} editingId={editingProject} onEdit={editProject} onCancel={() => { setEditingProject(null); setProjectDraft(blankProject); }} onSubmit={saveProject} onDelete={id => deleteProject.mutate({ id })} pending={createProject.isPending || updateProject.isPending} />}
          {section === "skills" && <SkillsManager skills={skills.data ?? []} draft={skillDraft} setDraft={setSkillDraft} editingId={editingSkill} onEdit={editSkill} onCancel={() => { setEditingSkill(null); setSkillDraft(blankSkill); }} onSubmit={saveSkill} onDelete={id => deleteSkill.mutate({ id })} pending={createSkill.isPending || updateSkill.isPending} />}
          {section === "messages" && <MessagesManager messages={messages.data ?? []} onRead={id => markRead.mutate({ id })} onDelete={id => deleteMessage.mutate({ id })} />}
        </main>
      </div>
    </div>
  );
}

function Overview({ data, onNavigate }: { data?: { projects: number; skills: number; messages: number; unread: number; recentProjects: Project[]; recentMessages: Message[] }; onNavigate: (section: Section) => void }) {
  const cards = [{ label: "Projets", value: data?.projects ?? 0, icon: FolderKanban, section: "projects" as const }, { label: "Compétences", value: data?.skills ?? 0, icon: BarChart3, section: "skills" as const }, { label: "Messages", value: data?.messages ?? 0, icon: FileText, section: "messages" as const }];
  return <div className="space-y-10"><div className="admin-intro"><div><p className="eyebrow">Bonjour, administrateur</p><h2 className="mt-3 font-display text-3xl font-semibold md:text-4xl">Votre portfolio, <span className="text-gradient">en mouvement.</span></h2><p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">Pilotez tout votre contenu — profil, projets, compétences, certifications — depuis un espace unique.</p></div><div className="admin-status"><span className="pulse-dot" /> Système opérationnel</div></div><div className="grid gap-4 md:grid-cols-3">{cards.map(card => <button key={card.label} onClick={() => onNavigate(card.section)} className="stat-card text-left"><div className="flex items-center justify-between"><span className="stat-icon"><card.icon className="h-5 w-5" /></span><ChevronRight className="h-4 w-4 text-muted-foreground" /></div><p className="mt-8 text-4xl font-semibold tracking-tight">{card.value}</p><p className="mt-1 text-sm text-muted-foreground">{card.label}</p></button>)}</div><div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]"><div className="admin-panel"><div className="panel-heading"><div><p className="eyebrow">Derniers ajouts</p><h3 className="mt-2 font-display text-xl font-semibold">Projets récents</h3></div><button onClick={() => onNavigate("projects")} className="text-sm text-primary hover:underline">Gérer</button></div><div className="divide-y divide-border/60">{data?.recentProjects.map(project => <div className="flex items-center gap-4 py-4" key={project.id}><div className="mini-thumb">{project.title.slice(0, 1)}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{project.title}</p><p className="mt-1 text-xs text-muted-foreground">{project.category}</p></div><span className={`status-chip ${project.published ? "published" : "draft"}`}>{project.published ? "Publié" : "Brouillon"}</span></div>)}{!data?.recentProjects.length && <p className="py-8 text-sm text-muted-foreground">Aucun projet pour le moment.</p>}</div></div><div className="admin-panel"><div className="panel-heading"><div><p className="eyebrow">Boîte de réception</p><h3 className="mt-2 font-display text-xl font-semibold">Messages récents</h3></div><button onClick={() => onNavigate("messages")} className="text-sm text-primary hover:underline">Voir tout</button></div><div className="divide-y divide-border/60">{data?.recentMessages.map(message => <div className="flex items-center gap-3 py-4" key={message.id}><span className={`message-dot ${message.read ? "read" : ""}`} /><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{message.subject}</p><p className="truncate text-xs text-muted-foreground">{message.name} · {message.email}</p></div></div>)}{!data?.recentMessages.length && <p className="py-8 text-sm text-muted-foreground">Aucun message.</p>}</div></div></div></div>;
}

function ProfileManager({ draft, setDraft, onSubmit, pending }: { draft: ProfileDraft; setDraft: React.Dispatch<React.SetStateAction<ProfileDraft | null>>; onSubmit: (e: React.FormEvent) => void; pending: boolean }) {
  const update = (key: keyof ProfileDraft, value: string) => setDraft(prev => prev ? { ...prev, [key]: value } : prev);
  const field = (key: keyof ProfileDraft, label: string, multiline = false) => (
    <label className="admin-field">
      <span>{label}</span>
      {multiline ? <textarea value={String(draft[key] ?? "")} onChange={e => update(key, e.target.value)} rows={3} /> : <input value={String(draft[key] ?? "")} onChange={e => update(key, e.target.value)} />}
    </label>
  );
  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      <div><p className="text-sm text-muted-foreground">Tout le contenu textuel du site</p><h2 className="mt-1 font-display text-2xl font-semibold">Profil & CV</h2><p className="mt-2 text-sm text-muted-foreground">Modifiez ici toutes les informations issues du CV : hero, sections, contact, liens.</p></div>
      <div className="admin-panel"><h3 className="font-display text-lg font-semibold">Identité</h3><div className="mt-4 grid gap-4 md:grid-cols-2">{field("displayName", "Nom d'affichage (ex: yvan.dev)")}{field("fullName", "Nom complet")}{field("role", "Rôle / Titre")}{field("email", "Email")}{field("phone", "Téléphone")}{field("availability", "Disponibilité")}{field("githubUrl", "URL GitHub")}{field("linkedinUrl", "URL LinkedIn")}{field("cvUrl", "URL du CV (fichier)")} <div className="md:col-span-2">{field("footerBio", "Bio footer", true)}</div></div></div>
      <div className="admin-panel"><h3 className="font-display text-lg font-semibold">Hero</h3><div className="mt-4 grid gap-4 md:grid-cols-2">{field("heroEyebrow", "Eyebrow hero")}{field("heroLocation", "Localisation hero")}{field("heroTitle", "Titre hero")}{field("heroTitleAccent", "Accent titre hero")}{field("heroSubtitle", "Sous-titre hero")}<div className="md:col-span-2">{field("heroDescription", "Description hero", true)}</div>{field("heroTags", "Tags hero (séparés par des virgules)")}{field("codeFocus", "Code focus")}{field("codeMindset", "Code mindset")}{field("codeStack", "Code stack (virgules)")}{field("codeStatus", "Code status")}</div></div>
      <div className="admin-panel"><h3 className="font-display text-lg font-semibold">Sections</h3><div className="mt-4 grid gap-4 md:grid-cols-2">{field("aboutEyebrow", "Eyebrow À propos")}{field("aboutTitle", "Titre À propos")}<div className="md:col-span-2">{field("aboutDescription", "Description À propos", true)}</div>{field("skillsEyebrow", "Eyebrow Compétences")}{field("skillsTitle", "Titre Compétences")}<div className="md:col-span-2">{field("skillsDescription", "Description Compétences", true)}</div>{field("certificationsEyebrow", "Eyebrow Certifications")}{field("certificationsTitle", "Titre Certifications")}<div className="md:col-span-2">{field("certificationsDescription", "Description Certifications", true)}</div>{field("projectsEyebrow", "Eyebrow Projets")}{field("projectsTitle", "Titre Projets")}<div className="md:col-span-2">{field("projectsDescription", "Description Projets", true)}</div>{field("contactEyebrow", "Eyebrow Contact")}{field("contactTitle", "Titre Contact")}<div className="md:col-span-2">{field("contactDescription", "Description Contact", true)}</div></div></div>
      <div className="flex justify-end"><button type="submit" className="button-primary" disabled={pending}><Save className="h-4 w-4" /> {pending ? "Enregistrement..." : "Enregistrer le profil"}</button></div>
    </form>
  );
}

function AboutManager({ cards, draft, setDraft, editingId, onEdit, onCancel, onSubmit, onDelete, pending }: { cards: AboutCard[]; draft: AboutCardDraft; setDraft: React.Dispatch<React.SetStateAction<AboutCardDraft>>; editingId: number | null; onEdit: (card: AboutCard) => void; onCancel: () => void; onSubmit: (event: React.FormEvent) => void; onDelete: (id: number) => void; pending: boolean }) {
  const [showForm, setShowForm] = useState(false);
  const update = (key: keyof AboutCardDraft, value: string | number) => setDraft(prev => ({ ...prev, [key]: value }));
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm text-muted-foreground">Section À propos</p><h2 className="mt-1 font-display text-2xl font-semibold">Cartes À propos</h2></div><button className="button-primary" onClick={() => { setShowForm(true); onCancel(); }}><Plus className="h-4 w-4" /> Nouvelle carte</button></div>
      {(showForm || editingId) && (
        <form className="admin-panel" onSubmit={onSubmit}>
          <div className="panel-heading"><div><p className="eyebrow">{editingId ? "Modifier" : "Créer"}</p><h3 className="mt-2 font-display text-xl font-semibold">Carte À propos</h3></div><button type="button" className="icon-button" onClick={() => { setShowForm(false); onCancel(); }}><X className="h-4 w-4" /></button></div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="admin-field"><span>Label (ex: 01)</span><input value={draft.label} onChange={e => update("label", e.target.value)} /></label>
            <label className="admin-field"><span>Ordre</span><input type="number" value={draft.displayOrder} onChange={e => update("displayOrder", Number(e.target.value))} /></label>
            <label className="admin-field"><span>Titre</span><input value={draft.title} onChange={e => update("title", e.target.value)} /></label>
            <label className="admin-field md:col-span-2"><span>Description</span><textarea value={draft.description} onChange={e => update("description", e.target.value)} rows={3} /></label>
          </div>
          <div className="mt-6 flex justify-end gap-3"><button type="button" className="button-outline" onClick={() => { setShowForm(false); onCancel(); }}>Annuler</button><button type="submit" className="button-primary" disabled={pending}><Save className="h-4 w-4" /> {pending ? "..." : editingId ? "Mettre à jour" : "Créer"}</button></div>
        </form>
      )}
      <div className="grid gap-4 md:grid-cols-2">{cards.map(card => <div key={card.id} className="admin-panel flex flex-col"><p className="eyebrow text-[10px]">{card.label}</p><h3 className="mt-2 font-semibold">{card.title}</h3><p className="mt-2 text-sm text-muted-foreground">{card.description}</p><div className="mt-4 flex gap-2"><button className="button-outline flex-1 justify-center" onClick={() => { setShowForm(true); onEdit(card); }}>Modifier</button><button className="icon-button" onClick={() => onDelete(card.id)}><Trash2 className="h-4 w-4" /></button></div></div>)}{!cards.length && <p className="col-span-full py-8 text-center text-sm text-muted-foreground">Aucune carte.</p>}</div>
    </div>
  );
}

function CertificationsManager({ certs, draft, setDraft, editingId, onEdit, onCancel, onSubmit, onDelete, pending }: { certs: Certification[]; draft: CertDraft; setDraft: React.Dispatch<React.SetStateAction<CertDraft>>; editingId: number | null; onEdit: (cert: Certification) => void; onCancel: () => void; onSubmit: (event: React.FormEvent) => void; onDelete: (id: number) => void; pending: boolean }) {
  const [showForm, setShowForm] = useState(false);
  const update = (key: keyof CertDraft, value: string | number) => setDraft(prev => ({ ...prev, [key]: value }));
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm text-muted-foreground">Parcours & diplômes</p><h2 className="mt-1 font-display text-2xl font-semibold">Certifications</h2></div><button className="button-primary" onClick={() => { setShowForm(true); onCancel(); }}><Plus className="h-4 w-4" /> Nouvelle certification</button></div>
      {(showForm || editingId) && (
        <form className="admin-panel" onSubmit={onSubmit}>
          <div className="panel-heading"><div><p className="eyebrow">{editingId ? "Modifier" : "Créer"}</p><h3 className="mt-2 font-display text-xl font-semibold">Certification</h3></div><button type="button" className="icon-button" onClick={() => { setShowForm(false); onCancel(); }}><X className="h-4 w-4" /></button></div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="admin-field"><span>Titre</span><input value={draft.title} onChange={e => update("title", e.target.value)} /></label>
            <label className="admin-field"><span>Organisme</span><input value={draft.issuer} onChange={e => update("issuer", e.target.value)} /></label>
            <label className="admin-field"><span>Date</span><input value={draft.dateLabel} onChange={e => update("dateLabel", e.target.value)} placeholder="2025 / Depuis 2024" /></label>
            <label className="admin-field"><span>Type</span><input value={draft.type} onChange={e => update("type", e.target.value)} placeholder="Réseaux, Sécurité, Formation" /></label>
            <label className="admin-field"><span>Ordre</span><input type="number" value={draft.displayOrder} onChange={e => update("displayOrder", Number(e.target.value))} /></label>
            <label className="admin-field"><span>URL (optionnel)</span><input value={draft.linkUrl} onChange={e => update("linkUrl", e.target.value)} /></label>
            <label className="admin-field md:col-span-2"><span>Description</span><textarea value={draft.description} onChange={e => update("description", e.target.value)} rows={3} /></label>
          </div>
          <div className="mt-6 flex justify-end gap-3"><button type="button" className="button-outline" onClick={() => { setShowForm(false); onCancel(); }}>Annuler</button><button type="submit" className="button-primary" disabled={pending}><Save className="h-4 w-4" /> {pending ? "..." : editingId ? "Mettre à jour" : "Créer"}</button></div>
        </form>
      )}
      <div className="grid gap-4 md:grid-cols-2">{certs.map(cert => <div key={cert.id} className="admin-panel"><p className="eyebrow text-[10px]">{cert.type}</p><h3 className="mt-2 font-semibold">{cert.title}</h3><p className="mt-1 text-sm text-primary">{cert.issuer} · {cert.dateLabel}</p><p className="mt-3 text-sm text-muted-foreground">{cert.description}</p><div className="mt-4 flex gap-2"><button className="button-outline flex-1 justify-center" onClick={() => { setShowForm(true); onEdit(cert); }}>Modifier</button><button className="icon-button" onClick={() => onDelete(cert.id)}><Trash2 className="h-4 w-4" /></button></div></div>)}{!certs.length && <p className="col-span-full py-8 text-center text-sm text-muted-foreground">Aucune certification.</p>}</div>
    </div>
  );
}

function ProjectsManager({ projects, draft, setDraft, editingId, onEdit, onCancel, onSubmit, onDelete, pending }: { projects: Project[]; draft: ProjectDraft; setDraft: React.Dispatch<React.SetStateAction<ProjectDraft>>; editingId: number | null; onEdit: (project: Project) => void; onCancel: () => void; onSubmit: (event: React.FormEvent) => void; onDelete: (id: number) => void; pending: boolean }) {
  const [showForm, setShowForm] = useState(false);
  const field = (key: keyof ProjectDraft, label: string, multiline = false) => <label className="admin-field"><span>{label}</span>{multiline ? <textarea value={String(draft[key])} onChange={event => setDraft(prev => ({ ...prev, [key]: event.target.value }))} rows={key === "description" ? 5 : 3} /> : <input value={String(draft[key])} onChange={event => setDraft(prev => ({ ...prev, [key]: event.target.value }))} />}</label>;
  return <div className="space-y-6"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm text-muted-foreground">Contenu public</p><h2 className="mt-1 font-display text-2xl font-semibold">Vos projets</h2></div><button className="button-primary" onClick={() => { setShowForm(true); onCancel(); }}><Plus className="h-4 w-4" /> Nouveau projet</button></div>{(showForm || editingId) && <form className="admin-panel" onSubmit={onSubmit}><div className="panel-heading"><div><p className="eyebrow">{editingId ? "Modifier" : "Créer"}</p><h3 className="mt-2 font-display text-xl font-semibold">Détails du projet</h3></div><button type="button" className="icon-button" onClick={() => { setShowForm(false); onCancel(); }}><X className="h-4 w-4" /></button></div><div className="grid gap-4 md:grid-cols-2">{field("title", "Titre")}{field("slug", "Slug")}{field("category", "Catégorie")}{field("technologies", "Technologies (séparées par des virgules)")}{field("shortDescription", "Description courte", true)}{field("description", "Description complète", true)}{field("imageUrl", "URL de l'image")}{field("githubUrl", "URL GitHub")}{field("liveUrl", "URL de démo")}</div><div className="mt-5 flex flex-wrap gap-5"><label className="check-field"><input type="checkbox" checked={draft.featured === 1} onChange={event => setDraft(prev => ({ ...prev, featured: event.target.checked ? 1 : 0 }))} /> Projet vedette</label><label className="check-field"><input type="checkbox" checked={draft.published === 1} onChange={event => setDraft(prev => ({ ...prev, published: event.target.checked ? 1 : 0 }))} /> Visible sur le site</label></div><div className="mt-6 flex justify-end gap-3"><button type="button" className="button-outline" onClick={() => { setShowForm(false); onCancel(); }}>Annuler</button><button type="submit" className="button-primary" disabled={pending}><Save className="h-4 w-4" /> {pending ? "Enregistrement..." : editingId ? "Mettre à jour" : "Créer"}</button></div></form>}<div className="grid gap-4">{projects.map(project => <div key={project.id} className="admin-panel flex flex-col gap-4 md:flex-row md:items-center"><div className="mini-thumb">{project.title.slice(0, 1)}</div><div className="min-w-0 flex-1"><p className="font-medium">{project.title}</p><p className="mt-1 text-xs text-muted-foreground">{project.category} · {project.technologies.slice(0, 60)}</p></div><span className={`status-chip ${project.published ? "published" : "draft"}`}>{project.published ? "Publié" : "Brouillon"}</span><div className="flex gap-2"><button className="button-outline" onClick={() => { setShowForm(true); onEdit(project); }}>Modifier</button><button className="icon-button" onClick={() => onDelete(project.id)}><Trash2 className="h-4 w-4" /></button></div></div>)}{!projects.length && <p className="py-8 text-center text-sm text-muted-foreground">Aucun projet.</p>}</div></div>;
}

function SkillsManager({ skills, draft, setDraft, editingId, onEdit, onCancel, onSubmit, onDelete, pending }: { skills: Skill[]; draft: SkillDraft; setDraft: React.Dispatch<React.SetStateAction<SkillDraft>>; editingId: number | null; onEdit: (skill: Skill) => void; onCancel: () => void; onSubmit: (event: React.FormEvent) => void; onDelete: (id: number) => void; pending: boolean }) {
  const [showForm, setShowForm] = useState(false);
  const update = (key: keyof SkillDraft, value: string | number) => setDraft(prev => ({ ...prev, [key]: value }));
  return <div className="space-y-6"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm text-muted-foreground">Stack technique</p><h2 className="mt-1 font-display text-2xl font-semibold">Compétences</h2></div><button className="button-primary" onClick={() => { setShowForm(true); onCancel(); }}><Plus className="h-4 w-4" /> Nouvelle compétence</button></div>{(showForm || editingId) && <form className="admin-panel" onSubmit={onSubmit}><div className="panel-heading"><div><p className="eyebrow">{editingId ? "Modifier" : "Créer"}</p><h3 className="mt-2 font-display text-xl font-semibold">Détails de la compétence</h3></div><button type="button" className="icon-button" onClick={() => { setShowForm(false); onCancel(); }}><X className="h-4 w-4" /></button></div><div className="grid gap-4 md:grid-cols-2"><label className="admin-field"><span>Nom</span><input value={draft.name} onChange={event => update("name", event.target.value)} /></label><label className="admin-field"><span>Catégorie</span><input value={draft.category} onChange={event => update("category", event.target.value)} /></label><label className="admin-field"><span>Niveau</span><select value={draft.level} onChange={event => update("level", event.target.value)}><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></label><label className="admin-field"><span>Icône Lucide</span><input value={draft.icon} onChange={event => update("icon", event.target.value)} /></label><label className="admin-field"><span>Ordre</span><input type="number" value={draft.displayOrder} onChange={event => update("displayOrder", Number(event.target.value))} /></label><label className="admin-field md:col-span-2"><span>Description</span><textarea value={draft.description} onChange={event => update("description", event.target.value)} rows={3} /></label></div><div className="mt-6 flex justify-end gap-3"><button type="button" className="button-outline" onClick={() => { setShowForm(false); onCancel(); }}>Annuler</button><button type="submit" className="button-primary" disabled={pending}><Save className="h-4 w-4" /> {pending ? "..." : editingId ? "Mettre à jour" : "Créer"}</button></div></form>}<div className="grid gap-4 md:grid-cols-2">{skills.map(skill => <div key={skill.id} className="admin-panel flex items-center gap-4"><div className="mini-thumb">{skill.name.slice(0, 1)}</div><div className="min-w-0 flex-1"><p className="text-sm font-medium">{skill.name}</p><p className="text-xs text-muted-foreground">{skill.category} · {skill.level}</p></div><button className="button-outline" onClick={() => { setShowForm(true); onEdit(skill); }}>Modifier</button><button className="icon-button" onClick={() => onDelete(skill.id)}><Trash2 className="h-4 w-4" /></button></div>)}{!skills.length && <p className="col-span-full py-8 text-center text-sm text-muted-foreground">Aucune compétence.</p>}</div></div>;
}

function MessagesManager({ messages, onRead, onDelete }: { messages: Message[]; onRead: (id: number) => void; onDelete: (id: number) => void }) {
  const [selected, setSelected] = useState<number | null>(messages[0]?.id ?? null);
  const active = messages.find(message => message.id === selected);
  return <div className="space-y-6"><div><p className="text-sm text-muted-foreground">Boîte de réception</p><h2 className="mt-1 font-display text-2xl font-semibold">Messages</h2></div><div className="admin-panel overflow-hidden"><div className="message-layout"><div className="message-list">{messages.map(message => <button key={message.id} onClick={() => { setSelected(message.id); if (!message.read) onRead(message.id); }} className={`message-row ${active?.id === message.id ? "selected" : ""}`}><span className={`message-dot ${message.read ? "read" : ""}`} /><span className="min-w-0 flex-1 text-left"><span className="block truncate text-sm font-medium">{message.subject}</span><span className="mt-1 block truncate text-xs text-muted-foreground">{message.name} · {new Date(message.createdAt).toLocaleDateString("fr-FR")}</span></span></button>)}{!messages.length && <p className="p-8 text-sm text-muted-foreground">Votre boîte de réception est vide.</p>}</div><div className="message-detail">{active ? <><div className="flex items-start justify-between gap-4"><div><p className="eyebrow">Message reçu</p><h3 className="mt-2 font-display text-2xl font-semibold">{active.subject}</h3><p className="mt-2 text-sm text-muted-foreground">De <a className="text-primary hover:underline" href={`mailto:${active.email}`}>{active.name} · {active.email}</a></p></div><button className="table-action danger" onClick={() => onDelete(active.id)}><Trash2 className="h-4 w-4" /></button></div><div className="mt-10 whitespace-pre-line text-sm leading-7 text-muted-foreground">{active.message}</div><p className="mt-10 border-t border-border/60 pt-4 text-xs text-muted-foreground">Reçu le {new Date(active.createdAt).toLocaleString("fr-FR")}</p></> : <div className="empty-state h-full">Sélectionnez un message pour le lire.</div>}</div></div></div></div>;
}
