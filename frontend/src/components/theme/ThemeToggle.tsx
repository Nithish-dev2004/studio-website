"use client";

import React, { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

const emptySubscribe = () => () => {};

export default function ThemeToggle({ className, showLabel = false }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click or Escape
  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  // Prevent hydration mismatch by rendering a neutral placeholder until mounted
  if (!mounted) {
    return (
      <div
        className={cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 bg-muted/40 text-muted-foreground",
          className,
        )}
        aria-hidden="true"
      >
        <span className="h-4 w-4" />
      </div>
    );
  }

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setMenuOpen((prev) => !prev)}
        aria-label={`Current theme: ${theme}. Click to change theme`}
        aria-haspopup="true"
        aria-expanded={menuOpen}
        className={cn(
          "group relative inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-border/80 bg-card/80 px-2.5 text-foreground shadow-xs transition-all duration-200 hover:border-accent/60 hover:bg-muted active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-accent",
          showLabel ? "px-3" : "w-9",
          className,
        )}
      >
        {resolvedTheme === "dark" ? (
          <Moon className="h-4 w-4 text-accent transition-transform duration-300 group-hover:-rotate-12" />
        ) : (
          <Sun className="h-4 w-4 text-accent transition-transform duration-300 group-hover:rotate-45" />
        )}

        {showLabel && (
          <span className="text-xs font-medium capitalize select-none">
            {theme === "system" ? "System" : theme}
          </span>
        )}
      </button>

      {/* Accessible Theme Selector Dropdown */}
      {menuOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          aria-label="Select theme mode"
          className="absolute right-0 z-50 mt-2 w-36 origin-top-right rounded-xl border border-border bg-popover p-1.5 shadow-xl backdrop-blur-md animate-in fade-in-50 zoom-in-95"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setTheme("light");
              setMenuOpen(false);
            }}
            className={cn(
              "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors cursor-pointer",
              theme === "light"
                ? "bg-accent/15 text-accent font-semibold"
                : "text-foreground hover:bg-muted",
            )}
          >
            <Sun className="h-3.5 w-3.5" />
            <span>Light</span>
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setTheme("dark");
              setMenuOpen(false);
            }}
            className={cn(
              "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors cursor-pointer",
              theme === "dark"
                ? "bg-accent/15 text-accent font-semibold"
                : "text-foreground hover:bg-muted",
            )}
          >
            <Moon className="h-3.5 w-3.5" />
            <span>Dark</span>
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setTheme("system");
              setMenuOpen(false);
            }}
            className={cn(
              "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors cursor-pointer",
              theme === "system"
                ? "bg-accent/15 text-accent font-semibold"
                : "text-foreground hover:bg-muted",
            )}
          >
            <Laptop className="h-3.5 w-3.5" />
            <span>System</span>
          </button>
        </div>
      )}
    </div>
  );
}
