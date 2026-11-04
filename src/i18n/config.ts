export const locales = ["fr", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "fr";

export const hasLocale = (value: string): value is Locale => (locales as readonly string[]).includes(value);

/** Texte bilingue stocké en base : { fr: "...", en: "..." }. */
export type Localized = Partial<Record<Locale, string>>;

/** Texte dans la langue demandée, avec repli sur l'autre langue tant qu'une traduction manque. */
export function pick(value: Localized | null | undefined, locale: Locale): string {
  if (!value) return "";
  return value[locale]?.trim() || value[locale === "fr" ? "en" : "fr"]?.trim() || "";
}
