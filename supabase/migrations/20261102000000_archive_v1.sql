-- =====================================================================
-- Portfolio v2 — archivage des tables de la v1 (à exécuter AVANT 20261103000000_init.sql)
-- ---------------------------------------------------------------------
-- La v2 réutilise le même projet Supabase. Les tables de la v1 portent les mêmes noms
-- que celles de la v2 (projects, skills, messages…) : on les déplace dans le schéma
-- « legacy », sans rien supprimer. Le site v1 cesse de fonctionner à ce moment-là.
-- Retour arrière possible : alter table legacy.<table> set schema public;
-- Script idempotent : une table déjà déplacée (ou absente) est ignorée.
-- =====================================================================

create schema if not exists legacy;
-- Personne d'autre que le propriétaire n'accède à l'archive (ni anon ni authenticated).
revoke all on schema legacy from public;

do $$
declare
  t text;
begin
  foreach t in array array['users', 'projects', 'skills', 'messages', 'siteProfile', 'aboutCards',
                            'certifications', 'strengths', 'languages', 'educations']
  loop
    if to_regclass(format('public.%I', t)) is not null and to_regclass(format('legacy.%I', t)) is null then
      execute format('alter table public.%I set schema legacy', t);
    end if;
  end loop;

  -- Types énumérés de la v1 (Drizzle) : « role » et « level ».
  if to_regtype('public.role') is not null and to_regtype('legacy.role') is null then
    alter type public.role set schema legacy;
  end if;
  if to_regtype('public.level') is not null and to_regtype('legacy.level') is null then
    alter type public.level set schema legacy;
  end if;
end;
$$;

-- Journal des migrations Drizzle de la v1, désormais inutile côté public.
do $$
begin
  if to_regclass('drizzle.__drizzle_migrations') is not null then
    alter table drizzle.__drizzle_migrations set schema legacy;
  end if;
end;
$$;
drop schema if exists drizzle;
