import { useEffect, useState } from "react";
import { BarChart3, ChevronRight, FileText, FolderKanban, GraduationCap, Layers, LayoutDashboard, LogOut, Menu, Plus, Save, ShieldAlert, Trash2, User, X } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import type { Project, Skill, Message, SiteProfile, AboutCard, Certification } from "@shared/types";
import { useLocation } from "wouter";

type Section = "overview" | "projects" | "skills" | "messages" | "profile" | "about" | "certifications";
type ProjectDraft = { title: string; slug: string; shortDescription: string; description: string; imageUrl: string; githubUrl: string; liveUrl: string; category: string; technologies: string; featured: number; published: number; };
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
  if (user.role !== "admin") return <div className="admin-loading"><ShieldAlert className="h-8 w-8 text-primary" /><h1 className="mt-4 font-display text-2xl font-semibold">Accès administrateur refusé</h1><p className="mt-2 text-sm text-muted-foreground">Ce compte n'est pas autorisé à gérer le contenu du site.</p><button onClick={() => logout()} className="button-primary mt-6">Se déconnecter</button></div>;
  return <AdminShell logout={logout} />;
}

function AdminLogin() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const login = trpc.auth.login.useMutation({
    onSuccess: () => {
      toast.success("Connexion réussie");
      setLocation("/admin");
    },
    onError: (error) => {
      toast.error(error.message || "Identifiants invalides.");
    },
  });

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    login.mutate({ email, password });
  };

  return (
    <div className="admin-login">
      <div className="admin-login-card">
        <div className="brand-mark mx-auto"><ShieldAlert className="h-5 w-5" /></div>
        <p className="eyebrow mt-7 text-center">Espace privé</p>
        <h1 className="mt-3 text-center font-display text-3xl font-semibold">Content studio</h1>
        <p className="mt-4 text-center text-sm leading-6 text-muted-foreground">Connectez-vous pour gérer tout le contenu du portfolio.</p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <label className="admin-field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@exemple.com"
              autoComplete="email"
              required
            />
          </label>

          <label className="admin-field">
            <span>Mot de passe</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </label>

          <button type="submit" className="button-primary mt-2 w-full justify-center" disabled={login.isPending}>
            {login.isPending ? "Connexion..." : "Se connecter"}
            <ChevronRight className="h-4 w-4" />
          </button>
        </form>

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
  const editProject = (project: Project) => { setEditingProject(project.id); setProjectDraft({ title: project.title, slug: project.slug, shortDescription: project.shortDescription, description: project.description, imageUrl: project.imageUrl ?? "", githubUrl: project.githubUrl ?? "", liveUrl: project.liveUrl ?? "", category: project.category, technologies: project.technologies, featured: project.featured, published: project.published }); };
  const editSkill = (skill: Skill) => { setEditingSkill(skill.id); setSkillDraft({ name: skill.name, category: skill.category, level: skill.level, icon: skill.icon ?? "", description: skill.description ?? "", displayOrder: skill.displayOrder }); };
  const editAbout = (card: AboutCard) => { setEditingAbout(card.id); setAboutDraft({ label: card.label, title: card.title, description: card.description, displayOrder: card.displayOrder }); };
  const editCert = (cert: Certification) => { setEditingCert(cert.id); setCertDraft({ title: cert.title, issuer: cert.issuer, dateLabel: cert.dateLabel, type: cert.type, description: cert.description, linkUrl: cert.linkUrl ?? "", displayOrder: cert.displayOrder }); };

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
          {section === "about" && <AboutManager cards={aboutCardsQ.data ?? []} draft={aboutDraft} setDraft={setAboutDraft} editingId={editingAbout} onEdit={editAbout} onCancel={() => { setEditingAbout(null); setAboutDraft(blankAbout); }} onSubmit={saveAbout} onDelete={id => deleteAbout.mutate({ id })} pending={createAbout.isPending || updateAbout.isPending || deleteAbout.isPending} />}
          {section === "certifications" && <CertificationsManager certs={certsQ.data ?? []} draft={certDraft} setDraft={setCertDraft} editingId={editingCert} onEdit={editCert} onCancel={() => { setEditingCert(null); setCertDraft(blankCert); }} onSubmit={saveCert} onDelete={id => deleteCert.mutate({ id })} pending={createCert.isPending || updateCert.isPending || deleteCert.isPending} />}
          {section === "projects" && <ProjectsManager projects={projects.data ?? []} draft={projectDraft} setDraft={setProjectDraft} editingId={editingProject} onEdit={editProject} onCancel={() => { setEditingProject(null); setProjectDraft(blankProject); }} onSubmit={saveProject} onDelete={id => deleteProject.mutate({ id })} pending={createProject.isPending || updateProject.isPending || deleteProject.isPending} />}
          {section === "skills" && <SkillsManager skills={skills.data ?? []} draft={skillDraft} setDraft={setSkillDraft} editingId={editingSkill} onEdit={editSkill} onCancel={() => { setEditingSkill(null); setSkillDraft(blankSkill); }} onSubmit={saveSkill} onDelete={id => deleteSkill.mutate({ id })} pending={createSkill.isPending || updateSkill.isPending || deleteSkill.isPending} />}
          {section === "messages" && <MessagesManager messages={messages.data ?? []} onRead={id => markRead.mutate({ id })} onDelete={id => deleteMessage.mutate({ id })} />}
        </main>
      </div>
    </div>
  );
}

function Overview({ data, onNavigate }: { data?: { projects: number; skills: number; messages: number; unread: number; recentProjects: Project[]; recentMessages: Message[] }; onNavigate: (section: Section) => void }) {
  const cards = [{ label: "Projets", value: data?.projects ?? 0, icon: FolderKanban, section: "projects" as const }, { label: "Compétences", value: data?.skills ?? 0, icon: BarChart3, section: "skills" as const }, { label: "Messages", value: data?.unread ?? 0, icon: FileText, section: "messages" as const }];
  return <div className="space-y-10"><div className="admin-intro"><div><p className="eyebrow">Bonjour, administrateur</p><h2 className="mt-3 font-display text-3xl font-semibold md:text-4xl">Votre espace de gestion</h2><p className="mt-3 max-w-2xl text-sm text-muted-foreground">Suivez votre contenu, publiez des projets, mettez à jour les compétences et répondez aux messages sans quitter le portfolio.</p></div></div><div className="grid gap-4 md:grid-cols-3">{cards.map(({ label, value, icon: Icon, section }) => <button key={label} className="admin-panel text-left" onClick={() => onNavigate(section)}><div className="flex items-center justify-between"><p className="text-sm text-muted-foreground">{label}</p><Icon className="h-4 w-4 text-primary" /></div><p className="mt-5 font-display text-3xl font-semibold">{value}</p></button>)}</div></div>;
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
      <div><p className="text-sm text-muted-foreground">Tout le contenu textuel du site</p><h2 className="mt-1 font-display text-2xl font-semibold">Profil & CV</h2><p className="mt-2 text-sm text-muted-foreground">Complétez les informations affichées sur la page d'accueil et les blocs de contact.</p></div>
      <div className="admin-panel"><h3 className="font-display text-lg font-semibold">Identité</h3><div className="mt-4 grid gap-4 md:grid-cols-2">{field("displayName", "Nom d'affichage")}{field("fullName", "Nom complet")}{field("role", "Rôle")}{field("email", "Email")}{field("phone", "Téléphone")}{field("availability", "Disponibilité")}</div></div>
      <div className="admin-panel"><h3 className="font-display text-lg font-semibold">Hero</h3><div className="mt-4 grid gap-4 md:grid-cols-2">{field("heroEyebrow", "Eyebrow")}{field("heroLocation", "Localisation")}{field("heroTitle", "Titre")}{field("heroTitleAccent", "Accent")}{field("heroSubtitle", "Sous-titre")}{field("heroTags", "Tags")}{field("codeFocus", "Focus code")}{field("codeMindset", "Mindset")}{field("codeStack", "Stack")}{field("codeStatus", "Statut")}{field("heroDescription", "Description", true)} </div></div>
      <div className="admin-panel"><h3 className="font-display text-lg font-semibold">Liens</h3><div className="mt-4 grid gap-4 md:grid-cols-2">{field("githubUrl", "GitHub")}{field("linkedinUrl", "LinkedIn")}{field("cvUrl", "CV")}{field("footerBio", "Bio footer", true)}</div></div>
      <div className="flex justify-end"><button type="submit" className="button-primary" disabled={pending}><Save className="h-4 w-4" /> {pending ? "Enregistrement..." : "Enregistrer le profil"}</button></div>
    </form>
  );
}

function AboutManager({ cards, draft, setDraft, editingId, onEdit, onCancel, onSubmit, onDelete, pending }: { cards: AboutCard[]; draft: AboutCardDraft; setDraft: React.Dispatch<React.SetStateAction<AboutCardDraft>>; editingId: number | null; onEdit: (card: AboutCard) => void; onCancel: () => void; onSubmit: (e: React.FormEvent) => void; onDelete: (id: number) => void; pending: boolean }) {
  const [showForm, setShowForm] = useState(false);
  const update = (key: keyof AboutCardDraft, value: string | number) => setDraft(prev => ({ ...prev, [key]: value }));
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm text-muted-foreground">Section À propos</p><h2 className="mt-1 font-display text-2xl font-semibold">Cartes</h2></div><button className="button-primary" onClick={() => { setShowForm(true); onCancel(); }}><Plus className="h-4 w-4" /> Ajouter</button></div>
      {(showForm || editingId) && (
        <form className="admin-panel" onSubmit={onSubmit}>
          <div className="panel-heading"><div><p className="eyebrow">{editingId ? "Modifier" : "Créer"}</p><h3 className="mt-2 font-display text-xl font-semibold">Carte À propos</h3></div><button type="button" className="icon-button" onClick={() => { setShowForm(false); onCancel(); }}><X /></button></div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="admin-field"><span>Label</span><input value={draft.label} onChange={e => update("label", e.target.value)} /></label>
            <label className="admin-field"><span>Ordre</span><input type="number" value={draft.displayOrder} onChange={e => update("displayOrder", Number(e.target.value))} /></label>
            <label className="admin-field"><span>Titre</span><input value={draft.title} onChange={e => update("title", e.target.value)} /></label>
            <label className="admin-field md:col-span-2"><span>Description</span><textarea value={draft.description} onChange={e => update("description", e.target.value)} rows={3} /></label>
          </div>
          <div className="mt-6 flex justify-end gap-3"><button type="button" className="button-outline" onClick={() => { setShowForm(false); onCancel(); }}>Annuler</button><button type="submit" className="button-primary" disabled={pending}><Save className="h-4 w-4" /> {pending ? "Enregistrement..." : editingId ? "Mettre à jour" : "Créer"}</button></div>
        </form>
      )}
      <div className="grid gap-4 md:grid-cols-2">{cards.map(card => <div key={card.id} className="admin-panel"><p className="eyebrow text-[10px]">{card.label}</p><h3 className="mt-2 font-semibold">{card.title}</h3><p className="mt-2 text-sm text-muted-foreground">{card.description}</p><div className="mt-4 flex justify-end gap-2"><button className="button-outline" onClick={() => onEdit(card)}>Modifier</button><button className="button-outline text-destructive" onClick={() => onDelete(card.id)}>Supprimer</button></div></div>)}</div>
    </div>
  );
}

function CertificationsManager({ certs, draft, setDraft, editingId, onEdit, onCancel, onSubmit, onDelete, pending }: { certs: Certification[]; draft: CertDraft; setDraft: React.Dispatch<React.SetStateAction<CertDraft>>; editingId: number | null; onEdit: (cert: Certification) => void; onCancel: () => void; onSubmit: (e: React.FormEvent) => void; onDelete: (id: number) => void; pending: boolean }) {
  const [showForm, setShowForm] = useState(false);
  const update = (key: keyof CertDraft, value: string | number) => setDraft(prev => ({ ...prev, [key]: value }));
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm text-muted-foreground">Parcours & diplômes</p><h2 className="mt-1 font-display text-2xl font-semibold">Certifications</h2></div><button className="button-primary" onClick={() => { setShowForm(true); onCancel(); }}><Plus className="h-4 w-4" /> Ajouter</button></div>
      {(showForm || editingId) && (
        <form className="admin-panel" onSubmit={onSubmit}>
          <div className="panel-heading"><div><p className="eyebrow">{editingId ? "Modifier" : "Créer"}</p><h3 className="mt-2 font-display text-xl font-semibold">Certification</h3></div><button type="button" className="icon-button" onClick={() => { setShowForm(false); onCancel(); }}><X /></button></div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="admin-field"><span>Titre</span><input value={draft.title} onChange={e => update("title", e.target.value)} /></label>
            <label className="admin-field"><span>Organisme</span><input value={draft.issuer} onChange={e => update("issuer", e.target.value)} /></label>
            <label className="admin-field"><span>Date</span><input value={draft.dateLabel} onChange={e => update("dateLabel", e.target.value)} /></label>
            <label className="admin-field"><span>Type</span><input value={draft.type} onChange={e => update("type", e.target.value)} /></label>
            <label className="admin-field"><span>Ordre</span><input type="number" value={draft.displayOrder} onChange={e => update("displayOrder", Number(e.target.value))} /></label>
            <label className="admin-field"><span>URL (optionnel)</span><input value={draft.linkUrl} onChange={e => update("linkUrl", e.target.value)} /></label>
            <label className="admin-field md:col-span-2"><span>Description</span><textarea value={draft.description} onChange={e => update("description", e.target.value)} rows={3} /></label>
          </div>
          <div className="mt-6 flex justify-end gap-3"><button type="button" className="button-outline" onClick={() => { setShowForm(false); onCancel(); }}>Annuler</button><button type="submit" className="button-primary" disabled={pending}><Save className="h-4 w-4" /> {pending ? "Enregistrement..." : editingId ? "Mettre à jour" : "Créer"}</button></div>
        </form>
      )}
      <div className="grid gap-4 md:grid-cols-2">{certs.map(cert => <div key={cert.id} className="admin-panel"><p className="eyebrow text-[10px]">{cert.type}</p><h3 className="mt-2 font-semibold">{cert.title}</h3><p className="mt-2 text-sm text-muted-foreground">{cert.issuer} · {cert.dateLabel}</p><div className="mt-4 flex justify-end gap-2"><button className="button-outline" onClick={() => onEdit(cert)}>Modifier</button><button className="button-outline text-destructive" onClick={() => onDelete(cert.id)}>Supprimer</button></div></div>)}</div>
    </div>
  );
}

function ProjectsManager({ projects, draft, setDraft, editingId, onEdit, onCancel, onSubmit, onDelete, pending }: { projects: Project[]; draft: ProjectDraft; setDraft: React.Dispatch<React.SetStateAction<ProjectDraft>>; editingId: number | null; onEdit: (project: Project) => void; onCancel: () => void; onSubmit: (e: React.FormEvent) => void; onDelete: (id: number) => void; pending: boolean }) {
  const [showForm, setShowForm] = useState(false);
  const field = (key: keyof ProjectDraft, label: string, multiline = false) => <label className="admin-field"><span>{label}</span>{multiline ? <textarea value={String(draft[key])} onChange={event => setDraft(prev => ({ ...prev, [key]: event.target.value }))} rows={4} /> : <input value={String(draft[key])} onChange={event => setDraft(prev => ({ ...prev, [key]: event.target.value }))} />}</label>;
  return <div className="space-y-6"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm text-muted-foreground">Contenu public</p><h2 className="mt-1 font-display text-2xl font-semibold">Projets</h2></div><button className="button-primary" onClick={() => { setShowForm(true); onCancel(); }}><Plus className="h-4 w-4" /> Ajouter</button></div>{(showForm || editingId) && <form className="admin-panel" onSubmit={onSubmit}><div className="panel-heading"><div><p className="eyebrow">{editingId ? "Modifier" : "Créer"}</p><h3 className="mt-2 font-display text-xl font-semibold">Projet</h3></div><button type="button" className="icon-button" onClick={() => { setShowForm(false); onCancel(); }}><X /></button></div><div className="grid gap-4 md:grid-cols-2">{field("title", "Titre")}{field("slug", "Slug")}{field("category", "Catégorie")}{field("technologies", "Technologies")}{field("imageUrl", "Image URL")}{field("githubUrl", "GitHub URL")}{field("liveUrl", "Live URL")}{field("shortDescription", "Courte description")}{field("description", "Description", true)}</div><div className="mt-6 flex justify-end gap-3"><button type="button" className="button-outline" onClick={() => { setShowForm(false); onCancel(); }}>Annuler</button><button type="submit" className="button-primary" disabled={pending}><Save className="h-4 w-4" /> {pending ? "Enregistrement..." : editingId ? "Mettre à jour" : "Créer"}</button></div></form>}{projects.length === 0 ? <p className="text-sm text-muted-foreground">Aucun projet pour le moment.</p> : <div className="grid gap-4 md:grid-cols-2">{projects.map(project => <div key={project.id} className="admin-panel"><p className="eyebrow text-[10px]">{project.category}</p><h3 className="mt-2 font-semibold">{project.title}</h3><p className="mt-2 text-sm text-muted-foreground">{project.shortDescription}</p><div className="mt-4 flex justify-end gap-2"><button className="button-outline" onClick={() => onEdit(project)}>Modifier</button><button className="button-outline text-destructive" onClick={() => onDelete(project.id)}>Supprimer</button></div></div>)}</div>}</div>;
}

function SkillsManager({ skills, draft, setDraft, editingId, onEdit, onCancel, onSubmit, onDelete, pending }: { skills: Skill[]; draft: SkillDraft; setDraft: React.Dispatch<React.SetStateAction<SkillDraft>>; editingId: number | null; onEdit: (skill: Skill) => void; onCancel: () => void; onSubmit: (e: React.FormEvent) => void; onDelete: (id: number) => void; pending: boolean }) {
  const [showForm, setShowForm] = useState(false);
  const update = (key: keyof SkillDraft, value: string | number) => setDraft(prev => ({ ...prev, [key]: value }));
  return <div className="space-y-6"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm text-muted-foreground">Stack technique</p><h2 className="mt-1 font-display text-2xl font-semibold">Compétences</h2></div><button className="button-primary" onClick={() => { setShowForm(true); onCancel(); }}><Plus className="h-4 w-4" /> Ajouter</button></div>{(showForm || editingId) && <form className="admin-panel" onSubmit={onSubmit}><div className="panel-heading"><div><p className="eyebrow">{editingId ? "Modifier" : "Créer"}</p><h3 className="mt-2 font-display text-xl font-semibold">Compétence</h3></div><button type="button" className="icon-button" onClick={() => { setShowForm(false); onCancel(); }}><X /></button></div><div className="grid gap-4 md:grid-cols-2"><label className="admin-field"><span>Nom</span><input value={draft.name} onChange={e => update("name", e.target.value)} /></label><label className="admin-field"><span>Catégorie</span><input value={draft.category} onChange={e => update("category", e.target.value)} /></label><label className="admin-field"><span>Niveau</span><select value={draft.level} onChange={e => update("level", e.target.value as SkillDraft["level"])}><option value="Beginner">Beginner</option><option value="Intermediate">Intermediate</option><option value="Advanced">Advanced</option></select></label><label className="admin-field"><span>Icône</span><input value={draft.icon} onChange={e => update("icon", e.target.value)} /></label><label className="admin-field"><span>Ordre</span><input type="number" value={draft.displayOrder} onChange={e => update("displayOrder", Number(e.target.value))} /></label><label className="admin-field md:col-span-2"><span>Description</span><textarea value={draft.description} onChange={e => update("description", e.target.value)} rows={3} /></label></div><div className="mt-6 flex justify-end gap-3"><button type="button" className="button-outline" onClick={() => { setShowForm(false); onCancel(); }}>Annuler</button><button type="submit" className="button-primary" disabled={pending}><Save className="h-4 w-4" /> {pending ? "Enregistrement..." : editingId ? "Mettre à jour" : "Créer"}</button></div></form>}{skills.length === 0 ? <p className="text-sm text-muted-foreground">Aucune compétence pour le moment.</p> : <div className="grid gap-4 md:grid-cols-2">{skills.map(skill => <div key={skill.id} className="admin-panel"><p className="eyebrow text-[10px]">{skill.category}</p><h3 className="mt-2 font-semibold">{skill.name}</h3><p className="mt-2 text-sm text-muted-foreground">{skill.level}</p><div className="mt-4 flex justify-end gap-2"><button className="button-outline" onClick={() => onEdit(skill)}>Modifier</button><button className="button-outline text-destructive" onClick={() => onDelete(skill.id)}>Supprimer</button></div></div>)}</div>}</div>;
}

function MessagesManager({ messages, onRead, onDelete }: { messages: Message[]; onRead: (id: number) => void; onDelete: (id: number) => void }) {
  const [selected, setSelected] = useState<number | null>(messages[0]?.id ?? null);
  const active = messages.find(message => message.id === selected);
  return <div className="space-y-6"><div><p className="text-sm text-muted-foreground">Boîte de réception</p><h2 className="mt-1 font-display text-2xl font-semibold">Messages</h2></div><div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">{messages.length === 0 ? <p className="text-sm text-muted-foreground">Aucun message.</p> : <div className="admin-panel p-0 overflow-hidden">{messages.map(message => <button key={message.id} onClick={() => { setSelected(message.id); if (message.read === 0) onRead(message.id); }} className={`w-full border-b border-border/70 px-4 py-3 text-left ${selected === message.id ? "bg-muted/60" : ""}`}><div className="flex items-center justify-between gap-3"><span className="font-medium">{message.name}</span>{message.read === 0 && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}</div><p className="mt-1 text-xs text-muted-foreground">{message.subject}</p><p className="mt-2 text-xs text-muted-foreground">{new Date(message.createdAt).toLocaleDateString("fr-FR")}</p></button>)}</div>}{active ? <div className="admin-panel"><div className="flex items-start justify-between gap-4"><div><p className="eyebrow text-[10px]">{active.subject}</p><h3 className="mt-2 font-display text-xl font-semibold">{active.name}</h3></div><button className="button-outline text-destructive" onClick={() => onDelete(active.id)}>Supprimer</button></div><p className="mt-4 text-sm text-muted-foreground">{active.email}</p><div className="mt-6 rounded-md border border-border/70 bg-background/60 p-4 text-sm leading-7 text-foreground/90">{active.message}</div></div> : <div className="admin-panel"><p className="text-sm text-muted-foreground">Sélectionnez un message.</p></div>}</div></div>;
}
