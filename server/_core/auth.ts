import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { Request } from "express";
import type { User } from "../../drizzle/schema";
import { getUserByOpenId } from "../db";
import { ENV } from "./env";
import { COOKIE_NAME } from "@shared/const";

const SESSION_ISSUER = "portfolio-admin";
const SESSION_AUDIENCE = "portfolio-admin-dashboard";

export type SupabaseAuthUser = User;

function getJwtSecret(): string {
  if (!ENV.jwtSecret) throw new Error("JWT_SECRET is not set");
  return ENV.jwtSecret;
}

export function getSupabaseAdmin() {
  if (!ENV.supabaseUrl || !ENV.supabaseServiceKey) return null;
  return createClient(ENV.supabaseUrl, ENV.supabaseServiceKey, { auth: { persistSession: false } });
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signSession(user: Pick<User, "id" | "openId" | "role">): string {
  return jwt.sign({ sub: String(user.id), openId: user.openId, role: user.role }, getJwtSecret(), {
    algorithm: "HS256",
    audience: SESSION_AUDIENCE,
    expiresIn: "7d",
    issuer: SESSION_ISSUER,
  });
}

export function verifySession(token: string): { sub: string; openId: string; role: string } | null {
  try {
    const payload = jwt.verify(token, getJwtSecret(), {
      algorithms: ["HS256"],
      audience: SESSION_AUDIENCE,
      issuer: SESSION_ISSUER,
    }) as jwt.JwtPayload & { openId?: unknown; role?: unknown };
    if (typeof payload.sub !== "string" || typeof payload.openId !== "string" || typeof payload.role !== "string") return null;
    return { sub: payload.sub, openId: payload.openId, role: payload.role };
  } catch {
    return null;
  }
}

export function getSessionTokenFromRequest(req: Request): string | null {
  const cookieHeader = req.headers.cookie ?? "";
  const match = cookieHeader.split(";").map(value => value.trim()).find(value => value.startsWith(`${COOKIE_NAME}=`));
  if (match) {
    const value = match.slice(COOKIE_NAME.length + 1);
    try {
      return decodeURIComponent(value);
    } catch {
      return null;
    }
  }
  const auth = req.headers.authorization;
  if (typeof auth === "string" && auth.startsWith("Bearer ")) return auth.slice(7);
  return null;
}

export async function authenticateRequest(req: Request): Promise<User | null> {
  const token = getSessionTokenFromRequest(req);
  if (!token) return null;
  const payload = verifySession(token);
  if (!payload) return null;
  const user = await getUserByOpenId(payload.openId);
  return user ?? null;
}
