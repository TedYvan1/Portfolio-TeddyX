import { useState } from "react";
import { ArrowRight, Check, Eye, EyeOff, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useTheme } from "@/contexts/ThemeContext";

export default function Login() {
  const [, setLocation] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const login = trpc.auth.login.useMutation({
    onSuccess: () => {
      toast.success("Connexion réussie");
      setLocation("/admin/dashboard");
    },
    onError: error => toast.error(error.message || "Identifiants invalides."),
  });

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    login.mutate({ email: email.trim(), password });
  };

  return (
    <main className="login-page">
      <div className="login-grid" aria-label="Connexion à l’espace administrateur">
        <section className="login-aside">
          <div className="login-aside-glow login-aside-glow-one" />
          <div className="login-aside-glow login-aside-glow-two" />
          <div className="relative z-10 flex h-full flex-col">
            <a href="/" className="flex w-fit items-center gap-3 text-white" aria-label="Retour à l’accueil">
              <span className="login-logo"><Sparkles className="h-4 w-4" /></span>
              <span className="font-display text-lg font-semibold tracking-tight">teddy<span className="text-[#74e0c7]">.x</span></span>
            </a>

            <div className="my-auto max-w-md py-16">
              <p className="login-kicker"><span className="login-kicker-dot" /> Admin workspace</p>
              <h1 className="mt-6 font-display text-4xl font-semibold leading-[1.08] tracking-tight text-white md:text-5xl">
                Pilotez votre portfolio avec <span className="text-[#74e0c7]">clarté.</span>
              </h1>
              <p className="mt-6 max-w-sm text-sm leading-7 text-[#b1c9c2]">
                Un espace simple pour publier vos projets, mettre à jour votre profil et garder vos messages au même endroit.
              </p>

              <div className="mt-10 space-y-4">
                {["Contenu centralisé", "Publication en quelques clics", "Session sécurisée côté serveur"].map(item => (
                  <div key={item} className="flex items-center gap-3 text-sm text-[#d6e8e3]">
                    <span className="login-check"><Check className="h-3.5 w-3.5" /></span>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs text-[#86a69e]">© {new Date().getFullYear()} Teddy.x · Espace privé</p>
          </div>
        </section>

        <section className="login-panel">
          <div className="login-panel-topbar">
            <span className="login-mobile-logo"><Sparkles className="h-4 w-4" /></span>
            <span className="text-xs font-medium uppercase tracking-[.18em] text-muted-foreground">Espace privé</span>
            <button type="button" onClick={toggleTheme} className="login-theme-toggle" aria-label={`Passer au thème ${theme === "dark" ? "clair" : "sombre"}`}>
              {theme === "dark" ? "Clair" : "Sombre"}
            </button>
          </div>

          <div className="login-form-wrap">
            <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <LockKeyhole className="h-5 w-5" />
            </div>
            <p className="eyebrow">Content studio</p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight">Bon retour.</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">Connectez-vous pour accéder à votre panneau d’administration.</p>

            <form onSubmit={onSubmit} className="mt-8 space-y-5" noValidate>
              <label className="login-field">
                <span>Adresse email</span>
                <input type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="vous@exemple.com" autoComplete="username" autoFocus required />
              </label>

              <label className="login-field">
                <span>Mot de passe</span>
                <span className="login-password-wrap">
                  <input type={showPassword ? "text" : "password"} value={password} onChange={event => setPassword(event.target.value)} placeholder="Votre mot de passe" autoComplete="current-password" minLength={6} required />
                  <button type="button" className="login-password-toggle" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </span>
              </label>

              <button type="submit" className="button-primary login-submit w-full justify-center" disabled={login.isPending}>
                {login.isPending ? "Vérification..." : "Ouvrir le workspace"}
                {!login.isPending && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>

            <div className="login-security-note">
              <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
              <span>Connexion locale par email et mot de passe. Aucun compte externe requis.</span>
            </div>
            <a href="/" className="mt-8 block text-center text-sm text-muted-foreground transition-colors hover:text-primary">← Retour au portfolio</a>
          </div>
        </section>
      </div>
    </main>
  );
}
