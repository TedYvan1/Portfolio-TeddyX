import type { Metadata } from "next";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { requireAdmin } from "@/lib/admin/auth";
import { deleteMessage, setMessageRead } from "../../actions";

export const metadata: Metadata = { title: "Messages" };

type Message = { id: string; name: string; email: string; subject: string; body: string; locale: string; read: boolean; created_at: string };

const dateFormat = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Abidjan" });

export default async function MessagesPage() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("messages").select("id,name,email,subject,body,locale,read,created_at").order("read").order("created_at", { ascending: false }).limit(200);
  if (error) throw new Error(`Lecture impossible : ${error.message}`);
  const messages = (data ?? []) as Message[];
  const unread = messages.filter(message => !message.read).length;

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
      <p className="mt-2 text-muted">
        {messages.length === 0 ? "Aucun message pour l'instant." : `${messages.length} message${messages.length > 1 ? "s" : ""}, dont ${unread} non lu${unread > 1 ? "s" : ""}.`}
      </p>

      <ol className="mt-10 border-t border-border">
        {messages.map(message => (
          <li key={message.id} className="border-b border-border">
            <details className="group py-4">
              <summary className="flex cursor-pointer list-none items-start gap-3 [&::-webkit-details-marker]:hidden">
                <span aria-hidden="true" className={`mt-2 h-2 w-2 shrink-0 rounded-full ${message.read ? "bg-border" : "bg-contact"}`} />
                <span className="min-w-0 flex-1">
                  <span className={`block truncate ${message.read ? "" : "font-semibold"}`}>
                    {message.subject}
                    {!message.read && <span className="sr-only"> (non lu)</span>}
                  </span>
                  <span className="block truncate text-sm text-muted">{message.name} · {message.email}</span>
                </span>
                <time dateTime={message.created_at} className="tag shrink-0">{dateFormat.format(new Date(message.created_at))}</time>
              </summary>

              <div className="mt-4 pl-5">
                <p className="max-w-prose text-[15px] leading-7 whitespace-pre-line">{message.body}</p>
                <p className="tag mt-3">Écrit en {message.locale === "en" ? "anglais" : "français"}</p>
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <a href={`mailto:${message.email}?subject=${encodeURIComponent(`Re: ${message.subject}`)}`} className="btn btn-primary">Répondre</a>
                  <form action={setMessageRead.bind(null, message.id, !message.read)}>
                    <button type="submit" className="btn btn-secondary">{message.read ? "Marquer non lu" : "Marquer lu"}</button>
                  </form>
                  <form action={deleteMessage.bind(null, message.id)}>
                    <ConfirmButton message={`Supprimer le message de ${message.name} ?`}>Supprimer</ConfirmButton>
                  </form>
                </div>
              </div>
            </details>
          </li>
        ))}
      </ol>
    </div>
  );
}
