import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../routers";
import { createContext } from "./context";

/** Application Express de l'API, partagée par le serveur Node (index.ts) et la fonction Vercel (api/index.js). */
export function createApp() {
  const app = express();
  // Derrière un proxy (Vercel, Render, Railway…), req.ip doit refléter l'IP du visiteur pour la limitation de requêtes.
  app.set("trust proxy", 1);
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ limit: "1mb", extended: true }));
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
      onError({ path, error }) {
        if (error.code === "INTERNAL_SERVER_ERROR") console.error(`[tRPC] ${path}:`, error);
      },
    }),
  );
  return app;
}
