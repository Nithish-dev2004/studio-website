// Label + input wrapper + error message, shared by the Booking and Contact forms.

type FormFieldProps = {
  id: string;
  label: string;
  error?: string;
  /** Adds a small "(optional)" hint after the label. */
  optional?: boolean;
  children: React.ReactNode;
};

/** Tailwind classes shared by every input, select and textarea.
 * Uses text-base (16px) on mobile to prevent iOS Safari auto-zoom, and min-h-[44px] for touch targets. */
export const inputClass =
  "bg-background text-foreground border-border placeholder:text-muted-foreground focus-visible:border-accent w-full min-h-[44px] rounded-lg border px-3 py-2.5 text-base sm:text-sm transition-colors aria-[invalid=true]:border-destructive";

export default function FormField({
  id,
  label,
  error,
  optional,
  children,
}: FormFieldProps) {
  return (
    <div className="w-full">
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-foreground">
        {label}
        {optional && (
          <span className="text-muted-foreground font-normal"> (optional)</span>
        )}
      </label>
      {children}
      {/* The input points to this message with aria-describedby so screen readers read it. */}
      {error && (
        <p id={`${id}-error`} className="text-destructive mt-1.5 text-xs sm:text-sm">
          {error}
        </p>
      )}
    </div>
  );
}
