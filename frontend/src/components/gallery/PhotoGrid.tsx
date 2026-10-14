// Masonry-style photo gallery.
// The browser's CSS "columns" feature stacks photos of different heights neatly,
// so we don't need any extra library. Pass in a list of portfolio items.

import Image from "next/image";
import FadeIn from "@/components/ui/FadeIn";
import type { PortfolioItem } from "@/types";

type PhotoGridProps = {
  items: PortfolioItem[];
};

export default function PhotoGrid({ items }: PhotoGridProps) {
  return (
    <ul className="columns-1 gap-4 sm:columns-2 lg:columns-3">
      {items.map((item) => (
        <li key={item.id} className="mb-4 break-inside-avoid">
          <FadeIn>
            <figure>
              <div className="bg-muted overflow-hidden rounded-lg">
                <Image
                  src={item.src}
                  alt={item.alt}
                  width={item.width}
                  height={item.height}
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="h-auto w-full transition-transform duration-500 hover:scale-105"
                />
              </div>
              <figcaption className="mt-2 flex items-baseline justify-between text-sm">
                <span>{item.title}</span>
                <span className="text-muted-foreground text-xs tracking-widest uppercase">
                  {item.category}
                </span>
              </figcaption>
            </figure>
          </FadeIn>
        </li>
      ))}
    </ul>
  );
}
