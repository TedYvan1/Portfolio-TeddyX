import "server-only";
import type { Field } from "./collections";

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export type FieldErrors = Record<string, string>;

const text = (formData: FormData, name: string) => String(formData.get(name) ?? "").trim();

/** « Étude de cas — v2 » → « etude-de-cas-v2 » */
export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

/**
 * Chemin de fichier acceptable : déjà enregistré pour cet élément, ou envoyé depuis l'admin dans le bon dossier du bucket
 * (les fichiers partent du navigateur directement vers Supabase Storage ; le formulaire ne transmet que leurs chemins).
 */
const filePath = (folder: string) => new RegExp(`^${folder}/[0-9a-f-]{36}\\.[a-z0-9]{1,5}$`);
const knownPaths = (value: unknown) => new Set((Array.isArray(value) ? value : value ? [value] : []).map(String));

/** Lit un formulaire de l'admin selon la description des champs. `before` : la ligne actuelle, pour reconnaître les fichiers déjà en place. */
export function readRecord(fields: Field[], formData: FormData, before: Record<string, unknown> | null = null) {
  const values: Record<string, unknown> = {};
  const errors: FieldErrors = {};

  for (const field of fields) {
    const { name } = field;
    switch (field.type) {
      case "localized": {
        const fr = text(formData, `${name}.fr`);
        const en = text(formData, `${name}.en`);
        if (field.required && !fr && !en) errors[name] = "Au moins une langue est obligatoire.";
        else if (fr.length > field.max || en.length > field.max) errors[name] = `${field.max} caractères maximum par langue.`;
        values[name] = { ...(fr ? { fr } : {}), ...(en ? { en } : {}) };
        break;
      }
      case "text": {
        const value = text(formData, name);
        if (field.required && !value) errors[name] = "Champ obligatoire.";
        else if (field.max && value.length > field.max) errors[name] = `${field.max} caractères maximum.`;
        values[name] = value;
        break;
      }
      case "slug": {
        const value = text(formData, name);
        if (value && !SLUG.test(value)) errors[name] = "Minuscules, chiffres et tirets uniquement (ex. : mon-projet).";
        values[name] = value;
        break;
      }
      case "email": {
        const value = text(formData, name);
        if ((field.required || value) && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) errors[name] = "Adresse e-mail invalide.";
        values[name] = value;
        break;
      }
      case "url": {
        const value = text(formData, name);
        if (value && !isHttpUrl(value)) errors[name] = "L'adresse doit commencer par https://";
        values[name] = value || null;
        break;
      }
      case "number": {
        const raw = text(formData, name);
        const value = raw === "" ? null : Number(raw);
        if (value === null) {
          if (field.required) errors[name] = "Champ obligatoire.";
        } else if (!Number.isInteger(value) || value < field.min || value > field.max) {
          errors[name] = `Nombre entier entre ${field.min} et ${field.max}.`;
        }
        values[name] = value;
        break;
      }
      case "date": {
        const value = text(formData, name);
        if (value && !/^\d{4}-\d{2}-\d{2}$/.test(value)) errors[name] = "Date invalide.";
        values[name] = value || null;
        break;
      }
      case "boolean":
        values[name] = formData.get(name) === "on";
        break;
      case "tags":
        values[name] = [...new Set(text(formData, name).split(/[,\n]/).map(item => item.trim()).filter(Boolean))];
        break;
      case "select": {
        const value = text(formData, name);
        if (!field.options.some(option => option.value === value)) errors[name] = "Choix invalide.";
        values[name] = field.numeric ? Number(value) : value;
        break;
      }
      case "reference": {
        const value = text(formData, name);
        if (!value) errors[name] = "Choisis une valeur.";
        values[name] = value;
        break;
      }
      case "file":
      case "files": {
        const known = knownPaths(before?.[name]);
        const paths = formData.getAll(name).map(String).filter(Boolean);
        if (paths.some(path => !known.has(path) && !filePath(field.folder).test(path))) errors[name] = "Fichier invalide : envoie-le de nouveau.";
        values[name] = field.type === "file" ? paths[0] ?? null : paths;
        break;
      }
    }
  }

  return { values, errors };
}

/** Fichiers du bucket qui ne sont plus référencés après une modification (les chemins /public et les URL ne sont pas touchés). */
export function orphanedFiles(fields: Field[], before: Record<string, unknown> | null, after: Record<string, unknown>) {
  if (!before) return [];
  const paths = (value: unknown) => (Array.isArray(value) ? value : value ? [value] : []).map(String).filter(path => !path.startsWith("/") && !/^https?:/.test(path));
  return fields
    .filter(field => field.type === "file" || field.type === "files")
    .flatMap(field => {
      const kept = new Set(paths(after[field.name]));
      return paths(before[field.name]).filter(path => !kept.has(path));
    });
}
