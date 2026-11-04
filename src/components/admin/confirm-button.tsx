"use client";

import { useFormStatus } from "react-dom";

/** Bouton d'envoi qui demande confirmation (actions définitives). */
export function ConfirmButton({ message, children }: { message: string; children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      onClick={event => {
        if (!window.confirm(message)) event.preventDefault();
      }}
      className="btn border border-danger/50 text-danger hover:bg-danger/10 disabled:opacity-60"
    >
      {pending ? "Suppression…" : children}
    </button>
  );
}
