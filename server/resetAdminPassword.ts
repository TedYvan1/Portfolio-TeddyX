import "dotenv/config";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { and, eq } from "drizzle-orm";
import { users } from "../drizzle/schema";
import { hashPassword } from "./_core/auth";

// Met à jour le mot de passe du compte admin existant à partir de ADMIN_EMAIL / ADMIN_PASSWORD (.env).
// Le seed ne modifie jamais un compte déjà créé : utilise `npm run admin:password` après un changement.
async function main() {
  const email = process.env.ADMIN_EMAIL?.trim();
  const password = process.env.ADMIN_PASSWORD ?? "";
  if (!email || password.length < 8) {
    throw new Error("Renseigne ADMIN_EMAIL et ADMIN_PASSWORD (8 caractères minimum) dans .env.");
  }

  const client = postgres(process.env.DATABASE_URL!, { prepare: false });
  try {
    const db = drizzle(client);
    const updated = await db
      .update(users)
      .set({ passwordHash: await hashPassword(password), updatedAt: new Date() })
      .where(and(eq(users.email, email), eq(users.role, "admin")))
      .returning({ id: users.id });
    if (!updated.length) {
      throw new Error(`Aucun compte admin pour ${email}. Lance d'abord \`npm run seed\`.`);
    }
    console.log(`Mot de passe admin mis à jour pour ${email}.`);
  } finally {
    await client.end();
  }
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
