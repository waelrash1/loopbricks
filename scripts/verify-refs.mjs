// Checks every DOI in the application library against Crossref: the work must exist, and its title and year
// must appear in our reference text. Network-bound, so it is run by hand: node scripts/verify-refs.mjs [file...]
import { readFileSync, readdirSync } from "node:fs";
const files = process.argv.slice(2).length ? process.argv.slice(2) : readdirSync("src/data/apps", { recursive: true }).filter((f) => f.endsWith(".ts")).map((f) => `src/data/apps/${f}`);
const norm = (s) => s.toLowerCase().normalize("NFKD").replace(/<[^>]+>/g, "").replace(/[^a-z0-9]+/g, " ").trim();
let bad = 0, n = 0;
for (const f of files) {
  const src = readFileSync(f, "utf8");
  for (const m of src.matchAll(/(\w+): \{ text: "((?:[^"\\]|\\.)*)",\s*doi: "([^"]+)"/g)) {
    const [, key, text, doi] = m;
    n++;
    const res = await fetch(`https://api.crossref.org/works/${encodeURIComponent(doi)}`, { headers: { "User-Agent": "loopbricks-ref-check (mailto:none@example.org)" } });
    if (!res.ok) { console.log(`✗ ${f} ${key}: DOI ${doi} not found (${res.status})`); bad++; continue; }
    const w = (await res.json()).message;
    const title = norm(w.title?.[0] ?? "");
    const years = [w.issued, w["published-print"], w["published-online"]].map((d) => String(d?.["date-parts"]?.[0]?.[0] ?? ""));
    const t = norm(text);
    const titleOk = title !== "" && t.includes(title.split(" ").slice(0, 6).join(" "));
    const yearOk = years.some((y) => y && text.includes(`(${y})`));
    if (!titleOk || !yearOk) { console.log(`✗ ${f} ${key}: ${!titleOk ? `title mismatch, Crossref: "${w.title?.[0]}"` : ""} ${!yearOk ? `year mismatch, Crossref: ${years.join("/")}` : ""}`); bad++; }
  }
}
console.log(`${n} DOIs checked, ${bad} problems`);
process.exit(bad ? 1 : 0);
