import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { Request } from "express";
import type { User } from "../../drizzle/schema";
import { getUserByOpenId } from "../db";
import { ENV } from "./env";
import { COOKIE_NAME } from "@shared/const";

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
  return jwt.sign({ sub: String(user.id), openId: user.openId, role: user.role }, getJwtSecret(), { expiresIn: "7d" });
}

export function verifySession(token: string): { sub: string; openId: string; role: string } | null {
  try {
    const payload = jwt.verify(token, getJwtSecret()) as any;
    if (!payload?.openId) return null;
    return payload;
  } catch {
    return null;
  }
}

export function getSessionTokenFromRequest(req: Request): string | null {
  const cookieHeader = req.headers.cookie ?? "";
  const match = cookieHeader.split(";").find(s => s.trim().startsWith(`${COOKIE_NAME}=`));
  if (match) return match.trim().slice(COOKIE_NAME.length + 1);
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
