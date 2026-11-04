import { lang } from "next/root-params";
import { notFound } from "next/navigation";
import { hasLocale, type Locale } from "./config";

const dictionaries = {
  fr: () => import("./dictionaries/fr.json").then(module => module.default),
  en: () => import("./dictionaries/en.json").then(module => module.default),
};

export type Dictionary = Awaited<ReturnType<(typeof dictionaries)["fr"]>>;

/** Langue de la route courante (segment racine [lang]) ; 404 si elle n'est pas prise en charge. */
export async function getLocale(): Promise<Locale> {
  const value = await lang();
  // undefined hors de l'arbre [lang] (l'admin a sa propre mise en page racine).
  if (!value || !hasLocale(value)) notFound();
  return value;
}

export async function getDictionary(): Promise<Dictionary> {
  return dictionaries[await getLocale()]();
}
