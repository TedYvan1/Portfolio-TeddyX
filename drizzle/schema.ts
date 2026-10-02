import { integer, pgEnum, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["user", "admin"]);
export const levelEnum = pgEnum("level", ["Beginner", "Intermediate", "Advanced"]);

export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  passwordHash: varchar("passwordHash", { length: 255 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const projects = pgTable("projects", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  title: varchar("title", { length: 180 }).notNull(),
  slug: varchar("slug", { length: 180 }).notNull().unique(),
  shortDescription: text("shortDescription").notNull(),
  description: text("description").notNull(),
  imageUrl: varchar("imageUrl", { length: 500 }),
  githubUrl: varchar("githubUrl", { length: 500 }),
  liveUrl: varchar("liveUrl", { length: 500 }),
  category: varchar("category", { length: 100 }).notNull(),
  technologies: text("technologies").notNull(),
  featured: integer("featured").default(0).notNull(),
  published: integer("published").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const skills = pgTable("skills", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 120 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  level: levelEnum("level").default("Intermediate").notNull(),
  icon: varchar("icon", { length: 80 }),
  description: text("description"),
  displayOrder: integer("displayOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 120 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  subject: varchar("subject", { length: 180 }).notNull(),
  message: text("message").notNull(),
  read: integer("read").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const siteProfile = pgTable("siteProfile", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  displayName: varchar("displayName", { length: 80 }).notNull().default("yvan.dev"),
  fullName: varchar("fullName", { length: 180 }).notNull().default("Konin Ted Yvan Axel Kamanan"),
  role: varchar("role", { length: 255 }).notNull().default("Étudiant en Réseaux & Sécurité Informatique et en Génie Logiciel"),
  heroEyebrow: varchar("heroEyebrow", { length: 180 }).notNull().default("À la recherche d'un stage"),
  heroLocation: varchar("heroLocation", { length: 180 }).notNull().default("Abidjan · Bouaké"),
  heroTitle: varchar("heroTitle", { length: 255 }).notNull().default("Je développe des solutions"),
  heroTitleAccent: varchar("heroTitleAccent", { length: 120 }).notNull().default("clairs."),
  heroSubtitle: varchar("heroSubtitle", { length: 255 }).notNull().default("Je sécurise mes applications."),
  heroDescription: text("heroDescription").notNull().default("Étudiant en Réseaux & Sécurité Informatique et en Génie Logiciel. Je conçois des applications web performantes et sécurisées, avec une forte capacité d'analyse et d'adaptation."),
  heroTags: varchar("heroTags", { length: 500 }).notNull().default("HTML · CSS · JavaScript,Node · MySQL,Réseaux · JWT"),
  codeFocus: varchar("codeFocus", { length: 80 }).notNull().default("full-stack"),
  codeMindset: varchar("codeMindset", { length: 80 }).notNull().default("secure-by-design"),
  codeStack: varchar("codeStack", { length: 255 }).notNull().default("React,Node.js,PostgreSQL,Linux"),
  codeStatus: varchar("codeStatus", { length: 80 }).notNull().default("building"),
  aboutEyebrow: varchar("aboutEyebrow", { length: 120 }).notNull().default("01 / À propos"),
  aboutTitle: varchar("aboutTitle", { length: 255 }).notNull().default("Une approche hybride, entre produit et infrastructure."),
  aboutDescription: text("aboutDescription").notNull().default("Je suis Konin Ted Yvan Axel Kamanan, étudiant en Licence 3 Réseaux et Sécurité Informatique à l'UVCI et en Licence 2 Génie Logiciel à l'Université Nord-Sud de Bouaké. J'allie analyse, adaptabilité et curiosité pour concevoir des applications web performantes et sécurisées."),
  skillsEyebrow: varchar("skillsEyebrow", { length: 120 }).notNull().default("02 / Compétences"),
  skillsTitle: varchar("skillsTitle", { length: 255 }).notNull().default("Les outils que j'utilise pour passer de l'idée au produit."),
  skillsDescription: text("skillsDescription").notNull().default("Une base technique en progression constante, organisée autour de la qualité, de la simplicité et de la sécurité."),
  certificationsEyebrow: varchar("certificationsEyebrow", { length: 120 }).notNull().default("03 / Certifications"),
  certificationsTitle: varchar("certificationsTitle", { length: 255 }).notNull().default("Des bases solides, toujours en mouvement."),
  certificationsDescription: text("certificationsDescription").notNull().default("Des certifications et formations qui reflètent mon parcours entre réseaux, cybersécurité et génie logiciel."),
  projectsEyebrow: varchar("projectsEyebrow", { length: 120 }).notNull().default("04 / Projets sélectionnés"),
  projectsTitle: varchar("projectsTitle", { length: 255 }).notNull().default("Quelques problèmes transformés en interfaces."),
  projectsDescription: text("projectsDescription").notNull().default("Des projets d'apprentissage et de production qui illustrent ma manière de penser le produit de bout en bout."),
  contactEyebrow: varchar("contactEyebrow", { length: 120 }).notNull().default("05 / Contact"),
  contactTitle: varchar("contactTitle", { length: 255 }).notNull().default("Construisons quelque chose d'utile."),
  contactDescription: text("contactDescription").notNull().default("Vous avez un projet web, une idée à prototyper ou simplement envie d'échanger ? Écrivez-moi, je réponds sous 48 heures."),
  email: varchar("email", { length: 320 }).notNull().default("y.vannky10@gmail.com"),
  phone: varchar("phone", { length: 50 }).notNull().default("07 58 11 79 44"),
  availability: varchar("availability", { length: 120 }).notNull().default("Stage recherché"),
  githubUrl: varchar("githubUrl", { length: 500 }).notNull().default("https://github.com/"),
  linkedinUrl: varchar("linkedinUrl", { length: 500 }).notNull().default("https://linkedin.com/"),
  cvUrl: varchar("cvUrl", { length: 500 }).notNull().default("/cv.pdf"),
  footerBio: text("footerBio").notNull().default("Étudiant en réseaux, sécurité informatique et génie logiciel, à la recherche d'un stage."),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const aboutCards = pgTable("aboutCards", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  label: varchar("label", { length: 10 }).notNull(),
  title: varchar("title", { length: 120 }).notNull(),
  description: text("description").notNull(),
  displayOrder: integer("displayOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const certifications = pgTable("certifications", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  title: varchar("title", { length: 255 }).notNull(),
  issuer: varchar("issuer", { length: 255 }).notNull(),
  dateLabel: varchar("dateLabel", { length: 80 }).notNull(),
  type: varchar("type", { length: 80 }).notNull(),
  description: text("description").notNull(),
  linkUrl: varchar("linkUrl", { length: 500 }),
  displayOrder: integer("displayOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;
export type Skill = typeof skills.$inferSelect;
export type InsertSkill = typeof skills.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;
export type SiteProfile = typeof siteProfile.$inferSelect;
export type InsertSiteProfile = typeof siteProfile.$inferInsert;
export type AboutCard = typeof aboutCards.$inferSelect;
export type InsertAboutCard = typeof aboutCards.$inferInsert;
export type Certification = typeof certifications.$inferSelect;
export type InsertCertification = typeof certifications.$inferInsert;
