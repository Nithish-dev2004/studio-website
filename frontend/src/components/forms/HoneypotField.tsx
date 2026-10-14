// Hidden "honeypot" field for spam protection.
// Real visitors never see it (it is moved far off-screen and skipped by the Tab key).
// Spam bots read the HTML and often fill every input they find. The API ignores any
// submission where this field has text.
//
// We do NOT use display:none, because some bots skip fields hidden that way.

type HoneypotFieldProps = {
  /** Makes the id unique per form, e.g. "booking" or "contact". */
  idPrefix: string;
  value: string;
  onChange: (value: string) => void;
};

export default function HoneypotField({ idPrefix, value, onChange }: HoneypotFieldProps) {
  return (
    // aria-hidden hides it from screen readers; tabIndex -1 keeps keyboard users out of it.
    <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
      <label htmlFor={`${idPrefix}-website`}>Leave this field empty</label>
      <input
        id={`${idPrefix}-website`}
        name="website"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
