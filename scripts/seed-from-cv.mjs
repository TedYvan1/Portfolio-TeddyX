// Remplit la base v2 avec le contenu de secours repris du CV (src/lib/fallback-content.ts).
//   npm run seed:cv -- --dry-run   → affiche ce qui serait écrit
//   npm run seed:cv                → remplace le contenu (les messages et les admins sont conservés)
// Variable (.env) : DATABASE_URL (URI Postgres du projet Supabase, rôle postgres : contourne RLS).
import postgres from "postgres";
import { fallbackContent as content } from "../src/lib/fallback-content.ts";

const dryRun = process.argv.includes("--dry-run");
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL manquante dans .env");

const ordered = (rows, extra = () => ({})) => rows.map((row, index) => ({ ...row, ...extra(row), sort_order: (index + 1) * 10 }));

const projects = ordered(content.projects, () => ({ published: true }));
const labs = ordered(content.labs, () => ({ published: true }));

console.log(
  `Contenu du CV : ${projects.length} projets, ${labs.length} labs, ${content.skills.length} catégories / ` +
    `${content.skills.reduce((total, category) => total + category.skills.length, 0)} compétences, ${content.educations.length} formations, ` +
    `${content.certifications.length} certifications, ${content.languages.length} langues, ${content.strengths.length} atouts, ${content.principles.length} principes.`,
);
if (!dryRun) await write();

async function write() {
  const sql = postgres(process.env.DATABASE_URL, { prepare: false, max: 1 });
  await sql.begin(async tx => {
    await tx`truncate public.projects, public.labs, public.skills, public.skill_categories, public.educations,
             public.certifications, public.languages, public.strengths, public.principles`;

    const profile = { id: 1, ...content.profile };
    await tx`insert into public.profile ${tx(profile)} on conflict (id) do update set ${tx(content.profile)}`;
    if (projects.length) await tx`insert into public.projects ${tx(projects)}`;
    if (labs.length) await tx`insert into public.labs ${tx(labs)}`;

    for (const [index, category] of content.skills.entries()) {
      const [row] = await tx`insert into public.skill_categories ${tx({ name: category.name, sort_order: (index + 1) * 10 })} returning id`;
      if (category.skills.length) {
        await tx`insert into public.skills ${tx(category.skills.map((skill, position) => ({ ...skill, category_id: row.id, sort_order: (position + 1) * 10 })))}`;
      }
    }
    for (const table of ["educations", "certifications", "languages", "strengths", "principles"]) {
      if (content[table].length) await tx`insert into ${tx("public." + table)} ${tx(ordered(content[table]))}`;
    }
  });
  await sql.end();
  console.log("Contenu enregistré dans la base.");
}
