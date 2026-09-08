import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

  const routes = [
    { path: "", priority: 1 },
    { path: "/a-propos", priority: 0.6 },
    { path: "/login", priority: 0.3 },
    { path: "/signup", priority: 0.5 },
    { path: "/mentions-legales", priority: 0.1 },
    { path: "/cgu-cgv", priority: 0.1 },
    { path: "/politique-confidentialite", priority: 0.1 },
    { path: "/sous-traitants", priority: 0.1 },
    { path: "/dpa", priority: 0.1 },
  ];

  return routes.map((r) => ({
    url: `${baseUrl}${r.path}`,
    lastModified: new Date(),
    priority: r.priority,
  }));
}
