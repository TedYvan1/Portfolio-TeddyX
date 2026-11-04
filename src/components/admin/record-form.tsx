"use client";

import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import type { FormState } from "@/app/admin/actions";
import type { Field } from "@/lib/admin/collections";
import { FileField } from "./file-field";

export type Option = { value: string; label: string };
type Values = Record<string, unknown>;

const localized = (value: unknown, locale: "fr" | "en") => ((value ?? {}) as Record<string, string>)[locale] ?? "";
const asText = (value: unknown) => (value === null || value === undefined ? "" : String(value));

/**
 * Formulaire générique de l'admin, construit à partir de la description des champs.
 * Les textes bilingues s'éditent côte à côte (FR | EN) ; la validation fait foi côté serveur.
 */
export function RecordForm({
  fields,
  values,
  action,
  references = {},
  submitLabel = "Enregistrer",
}: {
  fields: Field[];
  values: Values;
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  references?: Record<string, Option[]>;
  submitLabel?: string;
}) {
  const [state, formAction, pending] = useActionState(action, { status: "idle" });
  const summaryRef = useRef<HTMLDivElement>(null);
  const [uploading, setUploading] = useState(0);
  const errors = state.status === "error" ? state.fields : {};

  useEffect(() => {
    if (state.status === "error") summaryRef.current?.focus();
  }, [state]);

  return (
    <form
      noValidate
      className="grid gap-8"
      // Envoi manuel plutôt que <form action> : React viderait le formulaire après chaque envoi, même refusé.
      onSubmit={event => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        startTransition(() => formAction(formData));
      }}
    >
      {state.status === "error" && (
        <div ref={summaryRef} tabIndex={-1} role="alert" className="border-l-2 border-danger pl-4 text-sm text-danger outline-none">
          <p className="font-semibold">{state.message}</p>
          {Object.keys(errors).length > 0 && (
            <ul className="mt-2 grid gap-1">
              {Object.entries(errors).map(([name, message]) => (
                <li key={name}>
                  <a href={`#field-${name}`} className="underline">{fields.find(field => field.name === name)?.label ?? name}</a> : {message}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {fields.map(field => (
        <FieldInput key={field.name} field={field} value={values[field.name]} error={errors[field.name]} options={references[field.name]} onUploading={delta => setUploading(count => count + delta)} />
      ))}

      <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center gap-4 border-t border-border bg-background px-4 py-4 sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12">
        <button type="submit" className="btn btn-primary disabled:opacity-60" disabled={pending || uploading > 0}>
          {pending ? "Enregistrement…" : uploading > 0 ? "Envoi des fichiers…" : submitLabel}
        </button>
        <p role="status" className="text-sm text-muted">
          {state.status === "saved" && !pending ? `Enregistré à ${new Date(state.at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })} — le site est à jour.` : ""}
        </p>
      </div>
    </form>
  );
}

function FieldInput({ field, value, error, options, onUploading }: { field: Field; value: unknown; error?: string; options?: Option[]; onUploading: (delta: number) => void }) {
  const id = `field-${field.name}`;
  const describedBy = [field.type !== "boolean" && "hint" in field && field.hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(" ") || undefined;
  const required = "required" in field && field.required;
  const hint = "hint" in field ? field.hint : undefined;

  const label = (
    <span className="text-sm font-semibold">
      {field.label}
      {required && <span aria-hidden="true" className="text-contact"> *</span>}
    </span>
  );
  const footer = (
    <>
      {hint && <p id={`${id}-hint`} className="text-[13px] text-muted">{hint}</p>}
      {error && <p id={`${id}-error`} className="text-[13px] text-danger">{error}</p>}
    </>
  );

  if (field.type === "localized") {
    const Control = field.multiline ? "textarea" : "input";
    return (
      <fieldset id={id} className="field gap-2" aria-describedby={describedBy}>
        <legend className="mb-2">{label}</legend>
        <div className="grid gap-3 md:grid-cols-2">
          {(["fr", "en"] as const).map(locale => (
            <label key={locale} className="grid gap-1">
              <span className="tag uppercase">{locale === "fr" ? "Français" : "English"}</span>
              <Control name={`${field.name}.${locale}`} defaultValue={localized(value, locale)} maxLength={field.max} rows={field.multiline ? field.rows ?? 4 : undefined} lang={locale} aria-invalid={Boolean(error)} />
            </label>
          ))}
        </div>
        {footer}
      </fieldset>
    );
  }

  if (field.type === "boolean") {
    return (
      <div className="flex items-start gap-3">
        <input id={id} name={field.name} type="checkbox" defaultChecked={Boolean(value)} className="mt-1 h-4 w-4 accent-(--accent)" aria-describedby={field.hint ? `${id}-hint` : undefined} />
        <div className="grid gap-1">
          <label htmlFor={id} className="text-sm font-semibold">{field.label}</label>
          {field.hint && <p id={`${id}-hint`} className="text-[13px] text-muted">{field.hint}</p>}
        </div>
      </div>
    );
  }

  if (field.type === "file" || field.type === "files") {
    return (
      <fieldset id={id} className="field gap-2" aria-describedby={describedBy}>
        <legend className="mb-2">{label}</legend>
        <FileField field={field} value={value} onUploading={onUploading} />
        {footer}
      </fieldset>
    );
  }

  let control: React.ReactNode;
  const common = { id, name: field.name, "aria-invalid": Boolean(error), "aria-describedby": describedBy, required };
  switch (field.type) {
    case "select":
    case "reference": {
      const choices = field.type === "select" ? field.options : options ?? [];
      control = (
        <select {...common} defaultValue={asText(value) || choices[0]?.value}>
          {choices.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      );
      break;
    }
    case "tags":
      control = <input {...common} type="text" defaultValue={Array.isArray(value) ? value.join(", ") : ""} />;
      break;
    case "number":
      control = <input {...common} type="number" inputMode="numeric" min={field.min} max={field.max} defaultValue={asText(value)} />;
      break;
    case "date":
      control = <input {...common} type="date" defaultValue={asText(value)} />;
      break;
    case "url":
      control = <input {...common} type="url" inputMode="url" placeholder="https://" defaultValue={asText(value)} />;
      break;
    case "email":
      control = <input {...common} type="email" autoComplete="off" defaultValue={asText(value)} />;
      break;
    case "slug":
      control = <input {...common} type="text" spellCheck={false} autoCapitalize="none" placeholder="déduite du titre si vide" defaultValue={asText(value)} />;
      break;
    default:
      control = <input {...common} type="text" maxLength={"max" in field ? field.max : undefined} defaultValue={asText(value)} />;
  }

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {control}
      {footer}
    </div>
  );
}
