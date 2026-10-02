import { COOKIE_NAME } from "@shared/const";
import { hashPassword, signSession, verifyPassword } from "./_core/auth";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";
import { getDb, getSiteProfile, getUserByEmail, listAboutCards, listCertifications, listMessages, listProjects, listSkills } from "./db";
import { messages, projects, skills, siteProfile, aboutCards, certifications, users } from "../drizzle/schema";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, like, or } from "drizzle-orm";
import { z } from "zod";

const urlSchema = z.union([z.string().url().max(500), z.literal("")]).optional();
const projectFields = z.object({
  title: z.string().trim().min(3).max(180),
  slug: z.string().trim().min(3).max(180).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug invalide"),
  shortDescription: z.string().trim().min(20).max(500),
  description: z.string().trim().min(40).max(10000),
  imageUrl: urlSchema,
  githubUrl: urlSchema,
  liveUrl: urlSchema,
  category: z.string().trim().min(2).max(100),
  technologies: z.string().trim().min(2).max(500),
  featured: z.number().int().min(0).max(1).default(0),
  published: z.number().int().min(0).max(1).default(1),
});
const skillFields = z.object({
  name: z.string().trim().min(2).max(120),
  category: z.string().trim().min(2).max(100),
  level: z.enum(["Beginner", "Intermediate", "Advanced"]),
  icon: z.string().trim().max(80).optional(),
  description: z.string().trim().max(500).optional(),
  displayOrder: z.number().int().min(0).max(999),
});
const messageFields = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().email().max(320),
  subject: z.string().trim().min(3).max(180),
  message: z.string().trim().min(20).max(4000),
  honeypot: z.string().max(0).optional(),
});

const siteProfileFields = z.object({
  displayName: z.string().trim().min(1).max(80),
  fullName: z.string().trim().min(2).max(180),
  role: z.string().trim().min(2).max(255),
  heroEyebrow: z.string().trim().min(1).max(180),
  heroLocation: z.string().trim().min(1).max(180),
  heroTitle: z.string().trim().min(1).max(255),
  heroTitleAccent: z.string().trim().min(1).max(120),
  heroSubtitle: z.string().trim().min(1).max(255),
  heroDescription: z.string().trim().min(10).max(2000),
  heroTags: z.string().trim().min(1).max(500),
  codeFocus: z.string().trim().min(1).max(80),
  codeMindset: z.string().trim().min(1).max(80),
  codeStack: z.string().trim().min(1).max(255),
  codeStatus: z.string().trim().min(1).max(80),
  aboutEyebrow: z.string().trim().min(1).max(120),
  aboutTitle: z.string().trim().min(1).max(255),
  aboutDescription: z.string().trim().min(10).max(4000),
  skillsEyebrow: z.string().trim().min(1).max(120),
  skillsTitle: z.string().trim().min(1).max(255),
  skillsDescription: z.string().trim().min(1).max(2000),
  certificationsEyebrow: z.string().trim().min(1).max(120),
  certificationsTitle: z.string().trim().min(1).max(255),
  certificationsDescription: z.string().trim().min(1).max(2000),
  projectsEyebrow: z.string().trim().min(1).max(120),
  projectsTitle: z.string().trim().min(1).max(255),
  projectsDescription: z.string().trim().min(1).max(2000),
  contactEyebrow: z.string().trim().min(1).max(120),
  contactTitle: z.string().trim().min(1).max(255),
  contactDescription: z.string().trim().min(1).max(2000),
  email: z.string().email().max(320),
  phone: z.string().trim().min(2).max(50),
  availability: z.string().trim().min(1).max(120),
  githubUrl: z.string().trim().min(1).max(500),
  linkedinUrl: z.string().trim().min(1).max(500),
  cvUrl: z.string().trim().min(1).max(500),
  footerBio: z.string().trim().min(1).max(2000),
});

const aboutCardFields = z.object({
  label: z.string().trim().min(1).max(10),
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().min(5).max(2000),
  displayOrder: z.number().int().min(0).max(999),
});

const certificationFields = z.object({
  title: z.string().trim().min(2).max(255),
  issuer: z.string().trim().min(2).max(255),
  dateLabel: z.string().trim().min(1).max(80),
  type: z.string().trim().min(1).max(80),
  description: z.string().trim().min(10).max(5000),
  linkUrl: z.union([z.string().url().max(500), z.literal("")]).optional(),
  displayOrder: z.number().int().min(0).max(999),
});

async function requireDb() {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Base de données indisponible." });
  return db;
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    login: publicProcedure
      .input(z.object({ email: z.string().email(), password: z.string().min(6) }))
      .mutation(async ({ input, ctx }) => {
        const db = await requireDb();
        const user = await getUserByEmail(input.email);
        if (!user || !user.passwordHash) throw new TRPCError({ code: "UNAUTHORIZED", message: "Identifiants invalides." });
        const ok = await verifyPassword(input.password, user.passwordHash);
        if (!ok) throw new TRPCError({ code: "UNAUTHORIZED", message: "Identifiants invalides." });
        const token = signSession(user);
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
        return { success: true as const, user: { id: user.id, email: user.email, role: user.role, name: user.name } };
      }),
    register: publicProcedure
      .input(z.object({ email: z.string().email(), password: z.string().min(6).max(72), name: z.string().trim().min(1).max(100).optional() }))
      .mutation(async ({ input }) => {
        const db = await requireDb();
        const existing = await getUserByEmail(input.email);
        if (existing) throw new TRPCError({ code: "CONFLICT", message: "Email déjà utilisé." });
        const passwordHash = await hashPassword(input.password);
        const [row] = await db.insert(users).values({ openId: `user-${Date.now()}`, email: input.email, passwordHash, name: input.name ?? null, role: "user" }).returning({ id: users.id });
        return { success: true as const, id: row.id };
      }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  public: router({
    projects: publicProcedure.input(z.object({ search: z.string().trim().optional(), category: z.string().trim().optional() }).optional()).query(async ({ input }) => {
      const db = await requireDb();
      const filters = [eq(projects.published, 1)];
      if (input?.category && input.category !== "Tous") filters.push(eq(projects.category, input.category));
      if (input?.search) filters.push(or(like(projects.title, `%${input.search}%`), like(projects.technologies, `%${input.search}%`))!);
      return db.select().from(projects).where(and(...filters)).orderBy(desc(projects.featured), desc(projects.createdAt));
    }),
    projectBySlug: publicProcedure.input(z.object({ slug: z.string().min(1) })).query(async ({ input }) => {
      const db = await requireDb();
      const result = await db.select().from(projects).where(and(eq(projects.slug, input.slug), eq(projects.published, 1))).limit(1);
      if (!result[0]) throw new TRPCError({ code: "NOT_FOUND", message: "Projet introuvable." });
      return result[0];
    }),
    skills: publicProcedure.query(() => listSkills()),
    siteProfile: publicProcedure.query(async () => {
      const profile = await getSiteProfile();
      return profile ?? null;
    }),
    aboutCards: publicProcedure.query(() => listAboutCards()),
    certifications: publicProcedure.query(() => listCertifications()),
    createMessage: publicProcedure.input(messageFields).mutation(async ({ input }) => {
      if (input.honeypot) return { success: true };
      const db = await requireDb();
      await db.insert(messages).values({ name: input.name, email: input.email, subject: input.subject, message: input.message, read: 0 });
      return { success: true } as const;
    }),
  }),
  admin: router({
    overview: adminProcedure.query(async () => {
      const [projectRows, skillRows, messageRows] = await Promise.all([listProjects(false), listSkills(), listMessages()]);
      return {
        projects: projectRows.length,
        skills: skillRows.length,
        messages: messageRows.length,
        unread: messageRows.filter(message => message.read === 0).length,
        recentProjects: projectRows.slice(0, 4),
        recentMessages: messageRows.slice(0, 4),
      };
    }),
    projects: adminProcedure.query(() => listProjects(false)),
    createProject: adminProcedure.input(projectFields).mutation(async ({ input }) => {
      const db = await requireDb();
      const [created] = await db.insert(projects).values(input).returning({ id: projects.id });
      return created;
    }),
    updateProject: adminProcedure.input(projectFields.extend({ id: z.number().int().positive() })).mutation(async ({ input }) => {
      const db = await requireDb();
      const { id, ...values } = input;
      await db.update(projects).set(values).where(eq(projects.id, id));
      return { success: true } as const;
    }),
    deleteProject: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ input }) => {
      const db = await requireDb();
      await db.delete(projects).where(eq(projects.id, input.id));
      return { success: true } as const;
    }),
    skills: adminProcedure.query(() => listSkills()),
    createSkill: adminProcedure.input(skillFields).mutation(async ({ input }) => {
      const db = await requireDb();
      await db.insert(skills).values(input);
      return { success: true } as const;
    }),
    updateSkill: adminProcedure.input(skillFields.extend({ id: z.number().int().positive() })).mutation(async ({ input }) => {
      const db = await requireDb();
      const { id, ...values } = input;
      await db.update(skills).set(values).where(eq(skills.id, id));
      return { success: true } as const;
    }),
    deleteSkill: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ input }) => {
      const db = await requireDb();
      await db.delete(skills).where(eq(skills.id, input.id));
      return { success: true } as const;
    }),
    messages: adminProcedure.query(() => listMessages()),
    markMessageAsRead: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ input }) => {
      const db = await requireDb();
      await db.update(messages).set({ read: 1 }).where(eq(messages.id, input.id));
      return { success: true } as const;
    }),
    deleteMessage: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ input }) => {
      const db = await requireDb();
      await db.delete(messages).where(eq(messages.id, input.id));
      return { success: true } as const;
    }),

    // ── CMS: siteProfile (singleton row id=1)
    siteProfile: adminProcedure.query(async () => {
      const profile = await getSiteProfile();
      return profile ?? null;
    }),
    upsertSiteProfile: adminProcedure.input(siteProfileFields).mutation(async ({ input }) => {
      const db = await requireDb();
      const existing = await db.select().from(siteProfile).limit(1);
      if (existing.length) {
        await db.update(siteProfile).set(input).where(eq(siteProfile.id, existing[0].id));
      } else {
        await db.insert(siteProfile).values(input);
      }
      return { success: true } as const;
    }),

    // ── CMS: aboutCards
    aboutCards: adminProcedure.query(() => listAboutCards()),
    createAboutCard: adminProcedure.input(aboutCardFields).mutation(async ({ input }) => {
      const db = await requireDb();
      await db.insert(aboutCards).values(input);
      return { success: true } as const;
    }),
    updateAboutCard: adminProcedure.input(aboutCardFields.extend({ id: z.number().int().positive() })).mutation(async ({ input }) => {
      const db = await requireDb();
      const { id, ...values } = input;
      await db.update(aboutCards).set(values).where(eq(aboutCards.id, id));
      return { success: true } as const;
    }),
    deleteAboutCard: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ input }) => {
      const db = await requireDb();
      await db.delete(aboutCards).where(eq(aboutCards.id, input.id));
      return { success: true } as const;
    }),

    // ── CMS: certifications
    certifications: adminProcedure.query(() => listCertifications()),
    createCertification: adminProcedure.input(certificationFields).mutation(async ({ input }) => {
      const db = await requireDb();
      const payload = { ...input, linkUrl: input.linkUrl || null };
      await db.insert(certifications).values(payload as any);
      return { success: true } as const;
    }),
    updateCertification: adminProcedure.input(certificationFields.extend({ id: z.number().int().positive() })).mutation(async ({ input }) => {
      const db = await requireDb();
      const { id, ...rest } = input;
      const payload = { ...rest, linkUrl: rest.linkUrl || null };
      await db.update(certifications).set(payload as any).where(eq(certifications.id, id));
      return { success: true } as const;
    }),
    deleteCertification: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ input }) => {
      const db = await requireDb();
      await db.delete(certifications).where(eq(certifications.id, input.id));
      return { success: true } as const;
    }),
  }),
});

export type AppRouter = typeof appRouter;
