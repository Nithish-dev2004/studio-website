// One Button for the whole site.
// Pass `href` to render a link (<a>), or leave it out to render a real <button>.

import Link from "next/link";
import { cn } from "@/lib/utils";

// "inverse" is an outlined button that takes the text color of its surroundings.
// Use it on top of photos or dark banners.
type Variant = "primary" | "accent" | "outline" | "ghost" | "inverse";
type Size = "md" | "lg";

type ButtonProps = {
  children: React.ReactNode;
  href?: string;
  variant?: Variant;
  size?: Size;
  className?: string;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">;

const variants: Record<Variant, string> = {
  primary: "bg-primary text-primary-foreground hover:opacity-90",
  accent: "bg-accent text-accent-foreground hover:opacity-90",
  outline: "border border-border bg-transparent text-foreground hover:bg-muted",
  ghost: "bg-transparent text-foreground hover:bg-muted",
  inverse: "border border-current bg-transparent text-inherit hover:opacity-75",
};

const sizes: Record<Size, string> = {
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-7 text-base",
};

export default function Button({
  children,
  href,
  variant = "primary",
  size = "md",
  className,
  ...buttonProps
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-md font-medium transition",
    "disabled:pointer-events-none disabled:opacity-60",
    variants[variant],
    sizes[size],
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...buttonProps}>
      {children}
    </button>
  );
}
