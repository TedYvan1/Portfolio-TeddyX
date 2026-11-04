-- =====================================================================
-- Portfolio v2 — schéma initial (Supabase)
-- ---------------------------------------------------------------------
-- Contenu bilingue : chaque texte traduisible est un jsonb { "fr": "...", "en": "..." }.
-- Sécurité : RLS sur toutes les tables.
--   * public (anon)  : lecture du contenu publié uniquement ;
--   * admin          : tout, via la table admins (un compte Supabase Auth) ;
--   * messages       : jamais lisibles publiquement, écrits via submit_message().
-- =====================================================================

-- ---------------------------------------------------------------------
-- Administrateurs
-- ---------------------------------------------------------------------
create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;

-- security definer : lit admins sans dépendre des droits de l'appelant (évite toute récursion RLS).
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = (select auth.uid()));
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

create policy "admins: un admin se voit" on public.admins
  for select to authenticated using (user_id = (select auth.uid()));

-- Contrôle d'un texte bilingue : objet ne contenant que fr/en, chaînes de longueur raisonnable.
create or replace function public.is_localized(value jsonb, max_len int default 20000)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select jsonb_typeof(value) = 'object'
     and not exists (select 1 from jsonb_object_keys(value) k where k not in ('fr', 'en'))
     and coalesce(length(value ->> 'fr'), 0) <= max_len
     and coalesce(length(value ->> 'en'), 0) <= max_len;
$$;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- Profil (une seule ligne, id = 1)
-- ---------------------------------------------------------------------
create table public.profile (
  id smallint primary key default 1 check (id = 1),
  full_name text not null default '',
  display_name text not null default '',
  role jsonb not null default '{}' check (public.is_localized(role, 200)),
  headline jsonb not null default '{}' check (public.is_localized(headline, 300)),
  bio jsonb not null default '{}' check (public.is_localized(bio, 4000)),
  location text not null default '',
  email text not null default '',
  phone text,
  availability jsonb not null default '{}' check (public.is_localized(availability, 200)),
  -- « Ce que je cherche » : type de stage, période, durée, modalités
  seeking jsonb not null default '{}' check (public.is_localized(seeking, 1000)),
  github_url text,
  linkedin_url text,
  cv_path text,
  photo_path text,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Projets (études de cas)
-- ---------------------------------------------------------------------
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title jsonb not null default '{}' check (public.is_localized(title, 120)),
  summary jsonb not null default '{}' check (public.is_localized(summary, 400)),
  context jsonb not null default '{}' check (public.is_localized(context)),
  my_role jsonb not null default '{}' check (public.is_localized(my_role)),
  challenges jsonb not null default '{}' check (public.is_localized(challenges)),
  solution jsonb not null default '{}' check (public.is_localized(solution)),
  results jsonb not null default '{}' check (public.is_localized(results)),
  category text not null default '',
  tech text[] not null default '{}',
  cover_path text,
  gallery text[] not null default '{}',
  github_url text,
  live_url text,
  status text not null default 'done' check (status in ('in_progress', 'done')),
  year smallint,
  featured boolean not null default false,
  published boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Labs réseau & sécurité (exercices, comptes-rendus)
-- ---------------------------------------------------------------------
create table public.labs (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title jsonb not null default '{}' check (public.is_localized(title, 160)),
  summary jsonb not null default '{}' check (public.is_localized(summary, 400)),
  body jsonb not null default '{}' check (public.is_localized(body, 50000)),
  platform text not null default '',
  tools text[] not null default '{}',
  cover_path text,
  done_on date,
  published boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Compétences, parcours, certifications, langues, atouts, principes
-- ---------------------------------------------------------------------
create table public.skill_categories (
  id uuid primary key default gen_random_uuid(),
  name jsonb not null default '{}' check (public.is_localized(name, 80)),
  sort_order int not null default 0
);

create table public.skills (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.skill_categories (id) on delete cascade,
  name text not null check (length(name) between 1 and 120),
  level smallint not null default 2 check (level between 1 and 3),
  sort_order int not null default 0
);

create table public.educations (
  id uuid primary key default gen_random_uuid(),
  title jsonb not null default '{}' check (public.is_localized(title, 255)),
  institution text not null default '',
  location text,
  period jsonb not null default '{}' check (public.is_localized(period, 120)),
  description jsonb not null default '{}' check (public.is_localized(description, 2000)),
  sort_order int not null default 0
);

create table public.certifications (
  id uuid primary key default gen_random_uuid(),
  title jsonb not null default '{}' check (public.is_localized(title, 255)),
  issuer text not null default '',
  year smallint,
  kind jsonb not null default '{}' check (public.is_localized(kind, 80)),
  url text,
  sort_order int not null default 0
);

create table public.languages (
  id uuid primary key default gen_random_uuid(),
  name jsonb not null default '{}' check (public.is_localized(name, 80)),
  level jsonb not null default '{}' check (public.is_localized(level, 120)),
  sort_order int not null default 0
);

create table public.strengths (
  id uuid primary key default gen_random_uuid(),
  label jsonb not null default '{}' check (public.is_localized(label, 120)),
  sort_order int not null default 0
);

create table public.principles (
  id uuid primary key default gen_random_uuid(),
  title jsonb not null default '{}' check (public.is_localized(title, 120)),
  body jsonb not null default '{}' check (public.is_localized(body, 1000)),
  sort_order int not null default 0
);

-- ---------------------------------------------------------------------
-- Messages du formulaire de contact
-- ---------------------------------------------------------------------
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(name) between 2 and 120),
  email text not null check (length(email) between 3 and 320 and email like '%_@_%'),
  subject text not null check (length(subject) between 3 and 180),
  body text not null check (length(body) between 20 and 4000),
  locale text not null default 'fr' check (locale in ('fr', 'en')),
  sender_hash text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);
create index messages_sender_recent on public.messages (sender_hash, created_at desc);

-- Envoi d'un message : 5 par heure et par expéditeur (empreinte calculée côté serveur, ex. IP hachée).
create or replace function public.submit_message(
  p_name text, p_email text, p_subject text, p_body text, p_locale text, p_sender_hash text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if length(coalesce(p_sender_hash, '')) < 16 then
    raise exception 'empreinte expéditeur invalide' using errcode = '22023';
  end if;
  if (select count(*) from public.messages
      where sender_hash = p_sender_hash and created_at > now() - interval '1 hour') >= 5 then
    raise exception 'trop de messages, réessayez plus tard' using errcode = 'P0429';
  end if;
  insert into public.messages (name, email, subject, body, locale, sender_hash)
  values (trim(p_name), trim(p_email), trim(p_subject), trim(p_body), coalesce(p_locale, 'fr'), p_sender_hash);
end;
$$;
revoke all on function public.submit_message(text, text, text, text, text, text) from public;
grant execute on function public.submit_message(text, text, text, text, text, text) to anon, authenticated;

-- ---------------------------------------------------------------------
-- Déclencheurs updated_at
-- ---------------------------------------------------------------------
create trigger profile_touch before update on public.profile for each row execute function public.touch_updated_at();
create trigger projects_touch before update on public.projects for each row execute function public.touch_updated_at();
create trigger labs_touch before update on public.labs for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------
alter table public.profile enable row level security;
alter table public.projects enable row level security;
alter table public.labs enable row level security;
alter table public.skill_categories enable row level security;
alter table public.skills enable row level security;
alter table public.educations enable row level security;
alter table public.certifications enable row level security;
alter table public.languages enable row level security;
alter table public.strengths enable row level security;
alter table public.principles enable row level security;
alter table public.messages enable row level security;

-- Lecture publique : tout le contenu toujours visible…
create policy "lecture publique" on public.profile for select to anon, authenticated using (true);
create policy "lecture publique" on public.skill_categories for select to anon, authenticated using (true);
create policy "lecture publique" on public.skills for select to anon, authenticated using (true);
create policy "lecture publique" on public.educations for select to anon, authenticated using (true);
create policy "lecture publique" on public.certifications for select to anon, authenticated using (true);
create policy "lecture publique" on public.languages for select to anon, authenticated using (true);
create policy "lecture publique" on public.strengths for select to anon, authenticated using (true);
create policy "lecture publique" on public.principles for select to anon, authenticated using (true);
-- …sauf projets et labs, visibles seulement une fois publiés (l'admin voit tout).
create policy "lecture publique si publié" on public.projects for select to anon, authenticated using (published or (select public.is_admin()));
create policy "lecture publique si publié" on public.labs for select to anon, authenticated using (published or (select public.is_admin()));

-- Écriture : admin uniquement, sur toutes les tables de contenu.
create policy "admin écrit" on public.profile for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admin écrit" on public.projects for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admin écrit" on public.labs for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admin écrit" on public.skill_categories for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admin écrit" on public.skills for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admin écrit" on public.educations for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admin écrit" on public.certifications for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admin écrit" on public.languages for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admin écrit" on public.strengths for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admin écrit" on public.principles for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

-- Messages : seul l'admin les lit, les marque lus ou les supprime (l'insertion passe par submit_message).
create policy "admin lit" on public.messages for select to authenticated using ((select public.is_admin()));
create policy "admin modifie" on public.messages for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admin supprime" on public.messages for delete to authenticated using ((select public.is_admin()));

-- ---------------------------------------------------------------------
-- Stockage : bucket public « media » (photo, captures, CV), écriture admin
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 10485760, array['image/png', 'image/jpeg', 'image/webp', 'image/avif', 'application/pdf'])
on conflict (id) do nothing;

create policy "media: admin ajoute" on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and (select public.is_admin()));
create policy "media: admin modifie" on storage.objects for update to authenticated
  using (bucket_id = 'media' and (select public.is_admin()));
create policy "media: admin supprime" on storage.objects for delete to authenticated
  using (bucket_id = 'media' and (select public.is_admin()));

-- Profil vide pour que la ligne unique existe dès le départ.
insert into public.profile (id) values (1) on conflict do nothing;
