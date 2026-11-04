"use client";

import { useActionState, useEffect, useRef } from "react";
import { sendMessage, type ContactField, type ContactState } from "@/app/actions/contact";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";

const FIELDS: ContactField[] = ["name", "email", "subject", "message"];

export function ContactForm({ locale, t }: { locale: Locale; t: Dictionary["contact"] }) {
  const [state, action, pending] = useActionState<ContactState, FormData>(sendMessage, { status: "idle" });
  const summaryRef = useRef<HTMLDivElement>(null);
  const invalid = state.status === "invalid" ? state.fields : [];
  const values = "values" in state ? state.values : undefined;
  const errorOf = (field: ContactField) => (invalid.includes(field) ? t.errors[field] : null);

  // Après un envoi refusé, le focus va au récapitulatif des erreurs (lecteurs d'écran et clavier).
  useEffect(() => {
    if (state.status === "invalid" || state.status === "error") summaryRef.current?.focus();
  }, [state]);

  if (state.status === "success") {
    return (
      <div role="status" className="panel rise flex flex-col items-start gap-3 p-8">
        <span aria-hidden="true" className="flex h-11 w-11 items-center justify-center rounded-(--radius) border border-border text-xl text-skill">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path className="check-draw" d="M5 12.5l4.5 4.5L19 7" /></svg>
        </span>
        <p className="text-lg font-bold">{t.success}</p>
      </div>
    );
  }

  return (
    <form action={action} noValidate className="panel grid gap-5 p-6 sm:p-8">
      <input type="hidden" name="locale" value={locale} />
      {/* Piège à robots : invisible et hors du parcours clavier */}
      <div aria-hidden="true" className="hidden">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {(state.status === "invalid" || state.status === "error") && (
        <div ref={summaryRef} tabIndex={-1} role="alert" className="rounded-(--radius) border border-danger/40 bg-danger/10 p-4 text-sm text-danger outline-none">
          {state.status === "error" ? (
            t.errors[state.reason]
          ) : (
            <>
              <p className="font-bold">{t.errors.summary}</p>
              <ul className="mt-2 list-disc pl-5">
                {invalid.map(field => (
                  <li key={field}>
                    <a href={`#contact-${field}`} className="underline">{t.errors[field]}</a>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        {FIELDS.slice(0, 2).map(field => (
          <Field key={field} field={field} t={t} error={errorOf(field)} defaultValue={values?.[field]} />
        ))}
      </div>
      <Field field="subject" t={t} error={errorOf("subject")} defaultValue={values?.subject} />
      <Field field="message" t={t} error={errorOf("message")} defaultValue={values?.message} multiline />

      <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">* {t.required}</p>
        <button type="submit" className="btn btn-primary disabled:opacity-60" disabled={pending}>
          {pending ? t.sending : t.send}
        </button>
      </div>
    </form>
  );
}

function Field({ field, t, error, defaultValue, multiline = false }: { field: ContactField; t: Dictionary["contact"]; error: string | null; defaultValue?: string; multiline?: boolean }) {
  const id = `contact-${field}`;
  const placeholder = t[`${field}Placeholder` as const];
  const common = {
    id,
    name: field,
    required: true,
    defaultValue,
    placeholder,
    "aria-invalid": Boolean(error),
    "aria-describedby": error ? `${id}-error` : undefined,
  };
  return (
    <div className="field">
      <label htmlFor={id}>
        {t[field]} <span aria-hidden="true" className="text-contact">*</span>
      </label>
      {multiline ? (
        <textarea {...common} rows={5} />
      ) : (
        <input {...common} type={field === "email" ? "email" : "text"} autoComplete={field === "name" ? "name" : field === "email" ? "email" : "off"} />
      )}
      {error && <p id={`${id}-error`} className="error">{error}</p>}
    </div>
  );
}
