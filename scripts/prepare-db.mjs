// Picks the Prisma datasource provider from DATABASE_URL, then runs `prisma generate`.
//   file:...        -> sqlite      (local development)
//   postgres://...  -> postgresql  (Vercel / Neon / Supabase / VPS)
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

function loadDotEnv() {
  const file = path.join(root, ".env");
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (!m || process.env[m[1]] !== undefined) continue;
    process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

loadDotEnv();
const url = process.env.DATABASE_URL || "file:./dev.db";
process.env.DATABASE_URL = url;
const provider = /^postgres(ql)?:/i.test(url) ? "postgresql" : "sqlite";

const schemaPath = path.join(root, "prisma", "schema.prisma");
const schema = fs.readFileSync(schemaPath, "utf8");
const next = schema.replace(/(datasource db \{[^}]*provider\s*=\s*)"[a-z]+"/, `$1"${provider}"`);
if (next !== schema) fs.writeFileSync(schemaPath, next);
console.log(`[prepare-db] provider = ${provider}`);

if (!process.argv.includes("--no-generate")) {
  try {
    execSync("npx prisma generate", { stdio: "inherit", env: process.env });
  } catch (err) {
    const clientPath = path.join(root, "node_modules", ".prisma", "client", "index.js");
    if (fs.existsSync(clientPath)) {
      console.warn("[prepare-db] Notice: Prisma engine file is locked by an active dev server; using existing generated client.");
    } else {
      throw err;
    }
  }
}
