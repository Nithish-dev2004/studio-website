// Label + input wrapper + error message, shared by the Booking and Contact forms.

type FormFieldProps = {
  id: string;
  label: string;
  error?: string;
  /** Adds a small "(optional)" hint after the label. */
  optional?: boolean;
  children: React.ReactNode;
};

/** Tailwind classes shared by every input, select and textarea. */
export const inputClass =
  "bg-card text-foreground border-border placeholder:text-muted-foreground focus-visible:border-accent w-full rounded-md border px-3 py-2.5 text-base aria-[invalid=true]:border-destructive";

export default function FormField({
  id,
  label,
  error,
  optional,
  children,
}: FormFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
        {optional && (
          <span className="text-muted-foreground font-normal"> (optional)</span>
        )}
      </label>
      {children}
      {/* The input points to this message with aria-describedby so screen readers read it. */}
      {error && (
        <p id={`${id}-error`} className="text-destructive mt-1.5 text-sm">
          {error}
        </p>
      )}
    </div>
  );
}
