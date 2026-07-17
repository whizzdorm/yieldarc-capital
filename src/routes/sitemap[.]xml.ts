import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { vaults } from "@/lib/vaults";

const BASE_URL = "";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const paths = [
          { path: "/", priority: "1.0", changefreq: "weekly" },
          { path: "/dashboard", changefreq: "weekly" },
          { path: "/vaults", changefreq: "daily" },
          { path: "/portfolio", changefreq: "weekly" },
          { path: "/history", changefreq: "weekly" },
          { path: "/stats", changefreq: "daily" },
          { path: "/docs", changefreq: "weekly" },
          ...vaults.map((v) => ({ path: `/vault/${v.id}`, changefreq: "daily" as const })),
        ];
        const urls = paths.map((e) =>
          `  <url>\n    <loc>${BASE_URL}${e.path}</loc>\n    <changefreq>${e.changefreq}</changefreq>${(e as { priority?: string }).priority ? `\n    <priority>${(e as { priority?: string }).priority}</priority>` : ""}\n  </url>`,
        );
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>`;
        return new Response(xml, {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
