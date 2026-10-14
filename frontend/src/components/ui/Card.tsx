// A simple bordered box used for services, testimonials and more.

import { cn } from "@/lib/utils";

type CardProps = {
  children: React.ReactNode;
  className?: string;
};

export default function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        "bg-card text-card-foreground border-border rounded-lg border p-6",
        className,
      )}
    >
      {children}
    </div>
  );
}
