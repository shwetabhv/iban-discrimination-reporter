// Convenience CLI for FR-E2: reset demo data in seconds between rehearsals.
// Usage: npm run seed  (targets http://localhost:7071 by default)
//        API_BASE=https://<your-app>.azurestaticapps.net SEED_SECRET=... npm run seed
const base = process.env.API_BASE || "http://localhost:7071";
const secret = process.env.SEED_SECRET || "letmeseed-dev";

const res = await fetch(`${base}/seed?secret=${encodeURIComponent(secret)}`, { method: "POST" });
const body = await res.json().catch(() => ({}));

if (!res.ok) {
  console.error(`Seed failed (${res.status}):`, body.error || body);
  process.exit(1);
}

console.log(`Seeded ${body.seeded} demo reports at ${base}`);
