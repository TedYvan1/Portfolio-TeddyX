import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from '@shared/const';
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
  // En production, ne jamais renvoyer au navigateur le détail d'une erreur interne (SQL, stack…).
  errorFormatter({ shape, error }) {
    if (process.env.NODE_ENV === "production" && error.code === "INTERNAL_SERVER_ERROR") {
      return { ...shape, message: "Erreur interne du serveur.", data: { ...shape.data, stack: undefined } };
    }
    return shape;
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;

// Limiteur en mémoire par IP et par procédure (suffisant pour une seule instance du serveur).
const rateLimitHits = new Map<string, { count: number; resetAt: number }>();

export function rateLimit({ max, windowMs }: { max: number; windowMs: number }) {
  return t.middleware(async ({ ctx, path, next }) => {
    const now = Date.now();
    const key = `${path}:${ctx.req.ip ?? "unknown"}`;
    const entry = rateLimitHits.get(key);
    if (!entry || entry.resetAt <= now) {
      rateLimitHits.set(key, { count: 1, resetAt: now + windowMs });
    } else if (++entry.count > max) {
      throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Trop de tentatives. Réessayez dans quelques minutes." });
    }
    if (rateLimitHits.size > 10_000) {
      rateLimitHits.forEach((value, k) => value.resetAt <= now && rateLimitHits.delete(k));
    }
    return next();
  });
}

const requireUser = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(requireUser);

export const adminProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    if (!ctx.user || ctx.user.role !== 'admin') {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  }),
);
