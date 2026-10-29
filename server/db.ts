import { asc, desc, eq } from "drizzle-orm";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { User, users, projects, skills, messages, siteProfile, aboutCards, certifications, strengths, languages, educations } from "../drizzle/schema";

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

export async function listStrengths() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(strengths).orderBy(asc(strengths.displayOrder), asc(strengths.id));
}

export async function listLanguages() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(languages).orderBy(asc(languages.displayOrder), asc(languages.id));
}

export async function listEducations() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(educations).orderBy(asc(educations.displayOrder), asc(educations.id));
}
