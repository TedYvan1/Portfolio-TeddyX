import type { Metadata } from "next";
import { RecordForm } from "@/components/admin/record-form";
import { requireAdmin } from "@/lib/admin/auth";
import { profileFields } from "@/lib/admin/collections";
import { saveProfile } from "../../actions";

export const metadata: Metadata = { title: "Profil" };

export default async function ProfilePage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("profile").select("*").eq("id", 1).maybeSingle();

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold tracking-tight">Profil</h1>
      <p className="mt-2 mb-10 text-muted">Ton nom, ton accroche, tes liens et ton CV, repris sur tout le site.</p>
      <RecordForm fields={profileFields} values={data ?? {}} action={saveProfile} />
    </div>
  );
}
