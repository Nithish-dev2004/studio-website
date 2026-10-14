// Builds the SEO metadata (title, description, Open Graph) for a page.
// Every page calls createMetadata() so the setup stays identical everywhere.

import type { Metadata } from "next";
import { siteConfig } from "@/data/site";
import { placeholderImage } from "@/lib/utils";

type PageMetadataInput = {
  /** Leave empty for the home page. The site name is added automatically. */
  title?: string;
  description: string;
  /** The page path, e.g. "/portfolio" */
  path: string;
};

export function createMetadata({
  title,
  description,
  path,
}: PageMetadataInput): Metadata {
  const fullTitle = title ? `${title} | ${siteConfig.name}` : siteConfig.name;

  return {
    // For the home page, omit `title` so the layout's default title is used.
    ...(title ? { title } : {}),
    description,
    alternates: { canonical: path },
    openGraph: {
      title: fullTitle,
      description,
      url: path,
      siteName: siteConfig.name,
      type: "website",
      // TODO: replace with a real 1200x630 image (e.g. /public/og-image.jpg).
      images: [
        {
          url: placeholderImage("og-image", 1200, 630),
          width: 1200,
          height: 630,
          alt: siteConfig.name,
        },
      ],
    },
  };
}
