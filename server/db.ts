import { asc, desc, eq } from "drizzle-orm";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { InsertUser, User, users, projects, skills, messages, siteProfile, aboutCards, certifications } from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;
let _client: ReturnType<typeof postgres> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _client = postgres(process.env.DATABASE_URL, { prepare: false });
      _db = drizzle(_client);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  type TextField = (typeof textFields)[number];
  const assignNullable = (field: TextField) => {
    const value = user[field];
    if (value === undefined) return;
    const normalized = value ?? null;
    (values as any)[field] = normalized;
    updateSet[field] = normalized;
  };
  textFields.forEach(assignNullable);
  if (user.passwordHash !== undefined) {
    (values as any).passwordHash = user.passwordHash;
    updateSet.passwordHash = user.passwordHash;
  }
  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  }
  values.lastSignedIn ??= new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onConflictDoUpdate({ target: users.openId, set: updateSet as any });
}

export async function getUserByOpenId(openId: string): Promise<User | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result[0];
}

export async function listProjects(publishedOnly = false) {
  const db = await getDb();
  if (!db) return [];
  if (publishedOnly) return db.select().from(projects).where(eq(projects.published, 1)).orderBy(desc(projects.createdAt));
  return db.select().from(projects).orderBy(desc(projects.createdAt));
}

export async function listSkills() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(skills).orderBy(skills.displayOrder, skills.name);
}

export async function listMessages() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(messages).orderBy(desc(messages.createdAt));
}

export async function getSiteProfile() {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(siteProfile).limit(1);
  return rows[0] ?? null;
}

export async function listAboutCards() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(aboutCards).orderBy(asc(aboutCards.displayOrder), asc(aboutCards.id));
}

export async function listCertifications() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(certifications).orderBy(asc(certifications.displayOrder), asc(certifications.id));
}
