"use client";

// Masonry-style photo gallery with touch-friendly swipeable lightbox.
// Responsive columns (1 mobile, 2 tablet, 3 desktop) with keyboard and swipe navigation.

import { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import FadeIn from "@/components/ui/FadeIn";
import type { PortfolioItem } from "@/types";

type PhotoGridProps = {
  items: PortfolioItem[];
};

export default function PhotoGrid({ items }: PhotoGridProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  const selectedItem = selectedIndex !== null ? items[selectedIndex] : null;

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (selectedIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedIndex(null);
      } else if (e.key === "ArrowRight") {
        setSelectedIndex((prev) => (prev !== null ? (prev + 1) % items.length : null));
      } else if (e.key === "ArrowLeft") {
        setSelectedIndex((prev) =>
          prev !== null ? (prev - 1 + items.length) % items.length : null,
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, items.length]);

  // Touch handlers for mobile swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEndX(null);
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    const distance = touchStartX - touchEndX;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) {
      // Swiped left -> Next photo
      setSelectedIndex((prev) => (prev !== null ? (prev + 1) % items.length : null));
    } else if (distance < -minSwipeDistance) {
      // Swiped right -> Previous photo
      setSelectedIndex((prev) =>
        prev !== null ? (prev - 1 + items.length) % items.length : null,
      );
    }
  };

  return (
    <>
      <ul className="columns-1 gap-4 sm:columns-2 lg:columns-3">
        {items.map((item, index) => (
          <li key={item.id} className="mb-4 break-inside-avoid">
            <FadeIn delay={(index % 3) * 0.06}>
              <figure>
                <button
                  type="button"
                  onClick={() => setSelectedIndex(index)}
                  className="group relative block w-full overflow-hidden rounded-xl border border-border/60 bg-muted text-left transition-all duration-300 hover:border-accent/50 hover:shadow-md cursor-pointer focus-visible:ring-2 focus-visible:ring-accent"
                  aria-label={`View ${item.title} full size`}
                >
                  <Image
                    src={item.src}
                    alt={item.alt}
                    width={item.width}
                    height={item.height}
                    quality={75}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="h-auto w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                  {/* Subtle hover gradient */}
                  <div
                    className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/15"
                    aria-hidden="true"
                  />
                </button>
                <figcaption className="mt-2.5 flex items-baseline justify-between px-1 text-sm">
                  <span className="font-medium text-foreground">{item.title}</span>
                  <span className="text-muted-foreground text-xs font-mono tracking-widest uppercase">
                    {item.category}
                  </span>
                </figcaption>
              </figure>
            </FadeIn>
          </li>
        ))}
      </ul>

      {/* Full-screen Lightbox with Touch/Swipe & Keyboard Support */}
      {selectedItem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${selectedItem.title} lightbox`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Top Bar: Title & Close Button */}
          <div className="absolute top-0 inset-x-0 z-10 flex items-center justify-between p-4 sm:p-6 bg-gradient-to-b from-black/80 to-transparent">
            <div className="text-white">
              <h3 className="font-heading text-lg sm:text-xl font-bold">{selectedItem.title}</h3>
              <p className="text-xs text-white/70">
                {selectedItem.category} &bull; {(selectedIndex ?? 0) + 1} of {items.length}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedIndex(null)}
              aria-label="Close lightbox"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 active:scale-95 cursor-pointer"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Previous Button (desktop & tablet) */}
          <button
            type="button"
            onClick={() =>
              setSelectedIndex((prev) =>
                prev !== null ? (prev - 1 + items.length) % items.length : null,
              )
            }
            aria-label="Previous photo"
            className="absolute left-3 sm:left-6 z-10 hidden sm:flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 active:scale-95 cursor-pointer"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          {/* Main Photo Container */}
          <div className="relative max-h-[82vh] max-w-[92vw] p-2 flex items-center justify-center">
            <Image
              src={selectedItem.src}
              alt={selectedItem.alt}
              width={selectedItem.width}
              height={selectedItem.height}
              quality={85}
              priority
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px"
              className="max-h-[80vh] w-auto max-w-full rounded-lg object-contain shadow-2xl select-none"
            />
          </div>

          {/* Next Button (desktop & tablet) */}
          <button
            type="button"
            onClick={() =>
              setSelectedIndex((prev) => (prev !== null ? (prev + 1) % items.length : null))
            }
            aria-label="Next photo"
            className="absolute right-3 sm:right-6 z-10 hidden sm:flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 active:scale-95 cursor-pointer"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Bottom Swipe Hint on Mobile */}
          <div className="absolute bottom-4 inset-x-0 text-center sm:hidden">
            <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] text-white/70">
              Swipe left / right to navigate
            </span>
          </div>
        </div>
      )}
    </>
  );
}
