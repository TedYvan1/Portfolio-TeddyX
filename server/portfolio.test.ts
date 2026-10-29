import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function context(user: TrpcContext["user"] = null): TrpcContext {
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => undefined } as TrpcContext["res"],
  };
}

describe("portfolio access control", () => {
  it("rejects unauthenticated admin requests", async () => {
    const caller = appRouter.createCaller(context());
    await expect(caller.admin.overview()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("rejects malformed contact payloads before touching the database", async () => {
    const caller = appRouter.createCaller(context());
    await expect(caller.public.createMessage({ name: "A", email: "bad", subject: "x", message: "short" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rate-limits the contact form per IP", async () => {
    const ctx = context();
    (ctx.req as { ip?: string }).ip = "203.0.113.7";
    const caller = appRouter.createCaller(ctx);
    const invalid = { name: "A", email: "bad", subject: "x", message: "short" };
    for (let i = 0; i < 5; i++) {
      await expect(caller.public.createMessage(invalid)).rejects.toMatchObject({ code: "BAD_REQUEST" });
    }
    await expect(caller.public.createMessage(invalid)).rejects.toMatchObject({ code: "TOO_MANY_REQUESTS" });
  });
});
