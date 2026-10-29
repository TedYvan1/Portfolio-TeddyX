// Construit le site au format « Build Output API » de Vercel (.vercel/output) :
//   - static/        : le front Vite (dist/public)
//   - functions/api  : l'API Express + tRPC, regroupée en un seul fichier
//   - config.json    : /api/* vers la fonction, fichiers statiques, puis repli SPA sur index.html
// Usage : npm run build:vercel (lancé automatiquement par Vercel, voir vercel.json).
import { build } from "esbuild";
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";

const out = ".vercel/output";
const fn = `${out}/functions/api.func`;

rmSync(out, { recursive: true, force: true });

execSync("npx vite build", { stdio: "inherit" });
if (!existsSync("dist/public/index.html")) throw new Error("Le build Vite n'a pas produit dist/public/index.html");
mkdirSync(`${out}/static`, { recursive: true });
cpSync("dist/public", `${out}/static`, { recursive: true });

await build({
  entryPoints: ["server/_core/vercel.ts"],
  outfile: `${fn}/index.cjs`,
  bundle: true,
  platform: "node",
  target: "node22",
  format: "cjs",
  sourcemap: false,
  // La fonction exporte l'application Express par défaut : on l'expose comme module.exports pour Vercel.
  footer: { js: "module.exports = module.exports.default || module.exports;" },
  logLevel: "info",
});
writeFileSync(`${fn}/.vc-config.json`, JSON.stringify({ runtime: "nodejs22.x", handler: "index.cjs", launcherType: "Nodejs", shouldAddHelpers: false }, null, 2));

writeFileSync(
  `${out}/config.json`,
  JSON.stringify(
    {
      version: 3,
      routes: [
        { src: "^/api/(.*)$", dest: "/api" },
        { handle: "filesystem" },
        { src: "^/(.*)$", dest: "/index.html" },
      ],
    },
    null,
    2,
  ),
);

console.log(`Sortie Vercel prête dans ${out}`);
