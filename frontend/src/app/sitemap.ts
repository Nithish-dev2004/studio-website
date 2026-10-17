import type { MetadataRoute } from "next";
import { siteConfig } from "@/data/site";
import { services } from "@/data/services";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteConfig.url;

  // Base public pages
  const staticPages = [
    "",
    "/portfolio",
    "/services",
    "/about",
    "/booking",
    "/contact",
    "/brands/sivagangai-digital-marketing",
    "/brands/sivagangai-events",
    "/brands/sivagangai-sign-board",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  // Service specific pages
  const servicePages = services.map((service) => ({
    url: `${baseUrl}/services#${service.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Notice: /admin routes are strictly excluded from the sitemap
  return [...staticPages, ...servicePages];
}
