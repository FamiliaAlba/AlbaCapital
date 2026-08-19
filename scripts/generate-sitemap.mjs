import fs from "node:fs";
import path from "node:path";

const SITE_URL = process.env.VITE_SITE_URL || "https://albacapital.com";

const staticRoutes = [
  { path: "/", priority: "1.0", changefreq: "weekly" },
  { path: "/oportunidades", priority: "0.9", changefreq: "weekly" },
  { path: "/invertir", priority: "0.9", changefreq: "monthly" },
  { path: "/work", priority: "0.7", changefreq: "monthly" },
  { path: "/services", priority: "0.7", changefreq: "monthly" },
  { path: "/about", priority: "0.6", changefreq: "monthly" },
  { path: "/contact", priority: "0.6", changefreq: "monthly" },
  { path: "/blog", priority: "0.7", changefreq: "weekly" },
];

// Import dinámico simplificado: se listan los IDs de posts a mano acá
// porque este script corre con tsx/node fuera del pipeline de Vite.
// Si se agregan posts nuevos, agregar su id a esta lista.
const blogPostIds = [
  "sustainable-architecture-future",
  "minimalism-modern-living",
  "urban-planning-community-spaces",
];

const today = new Date().toISOString().split("T")[0];

const urls = [
  ...staticRoutes.map((r) => ({ loc: `${SITE_URL}${r.path}`, priority: r.priority, changefreq: r.changefreq })),
  ...blogPostIds.map((id) => ({ loc: `${SITE_URL}/blog/${id}`, priority: "0.5", changefreq: "monthly" })),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>
`;

fs.writeFileSync(path.resolve("public/sitemap.xml"), xml);
console.log(`sitemap.xml generado con ${urls.length} URLs`);
