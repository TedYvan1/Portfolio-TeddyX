"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { MAX_UPLOAD_BYTES, MEDIA_BUCKET, type Field } from "@/lib/admin/collections";
import { mediaUrl } from "@/lib/media";
import { createAdminBrowserClient } from "@/lib/supabase/browser";

type FileFieldConfig = Extract<Field, { type: "file" | "files" }>;

const initialPaths = (value: unknown) => (Array.isArray(value) ? value.map(String) : value ? [String(value)] : []);

/**
 * Fichier(s) d'un élément : envoyés directement du navigateur vers Supabase Storage (session admin, RLS),
 * puis transmis au formulaire sous forme de chemins dans des champs cachés.
 * Un fichier envoyé puis retiré avant l'enregistrement est supprimé aussitôt du stockage.
 */
export function FileField({ field, value, onUploading }: { field: FileFieldConfig; value: unknown; onUploading: (delta: number) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [paths, setPaths] = useState(() => initialPaths(value));
  const [fresh, setFresh] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const multiple = field.type === "files";
  const isImage = field.accept.startsWith("image/");

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setError(null);
    const accepted = [...files].filter(file => field.accept.split(",").includes(file.type) && file.size <= MAX_UPLOAD_BYTES);
    if (accepted.length < files.length) setError("Certains fichiers ont été ignorés : format non accepté ou plus de 10 Mo.");
    if (!accepted.length) return;

    setBusy(true);
    onUploading(1);
    try {
      const storage = createAdminBrowserClient().storage.from(MEDIA_BUCKET);
      const added: string[] = [];
      for (const file of multiple ? accepted : accepted.slice(0, 1)) {
        const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 5) || "bin";
        const path = `${field.folder}/${crypto.randomUUID()}.${extension}`;
        const { error: uploadError } = await storage.upload(path, file, { contentType: file.type, upsert: false });
        if (uploadError) throw uploadError;
        added.push(path);
      }
      // Remplacer un fichier unique déjà envoyé dans cette session : l'ancien ne servira plus.
      if (!multiple) await discard(paths.filter(path => fresh.has(path)));
      setFresh(current => new Set([...current, ...added]));
      setPaths(current => (multiple ? [...current, ...added] : added));
    } catch (uploadError) {
      setError(`Envoi impossible : ${(uploadError as Error).message}`);
    } finally {
      setBusy(false);
      onUploading(-1);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const discard = async (toRemove: string[]) => {
    if (toRemove.length) await createAdminBrowserClient().storage.from(MEDIA_BUCKET).remove(toRemove);
  };

  const remove = async (path: string) => {
    setPaths(current => current.filter(item => item !== path));
    // Les fichiers déjà enregistrés ne sont supprimés du stockage qu'à l'enregistrement du formulaire.
    if (fresh.has(path)) await discard([path]);
  };

  return (
    <div className="grid gap-3">
      {paths.map(path => <input key={path} type="hidden" name={field.name} value={path} />)}

      {paths.length > 0 && (
        <ul className={isImage ? "flex flex-wrap gap-3" : "grid gap-2"}>
          {paths.map(path => {
            const url = mediaUrl(path);
            return (
              <li key={path} className={isImage ? "w-40" : "flex items-center gap-3"}>
                {isImage && url ? (
                  <a href={url} target="_blank" rel="noreferrer" className="relative block aspect-[16/10] overflow-hidden rounded-(--radius) border border-border bg-surface">
                    <Image src={url} alt="" fill sizes="160px" className="object-cover" />
                  </a>
                ) : (
                  <a href={url ?? "#"} target="_blank" rel="noreferrer" className="tag link-underline text-foreground">{path.split("/").pop()}</a>
                )}
                <button type="button" onClick={() => remove(path)} className="mt-1 text-[13px] text-muted hover:text-danger">
                  Retirer<span className="sr-only"> {path.split("/").pop()}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => inputRef.current?.click()} disabled={busy} className="btn btn-secondary disabled:opacity-60">
          {busy ? "Envoi…" : paths.length && !multiple ? "Remplacer" : multiple ? "Ajouter des fichiers" : "Choisir un fichier"}
        </button>
        <input ref={inputRef} type="file" accept={field.accept} multiple={multiple} hidden tabIndex={-1} onChange={event => upload(event.currentTarget.files)} />
        <span className="text-[13px] text-muted">{isImage ? "PNG, JPEG, WebP ou AVIF" : "PDF"} · 10 Mo max.</span>
      </div>
      {error && <p role="alert" className="text-[13px] text-danger">{error}</p>}
    </div>
  );
}
