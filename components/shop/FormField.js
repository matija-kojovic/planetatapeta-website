/** Labelled input/textarea with hint and inline error wired to aria-describedby. */
export default function FormField({ id, label, hint, error, as = "input", className = "", ...props }) {
  const Control = as;
  const describedBy = [error ? `${id}-error` : null, hint ? `${id}-hint` : null].filter(Boolean).join(" ") || undefined;
  return (
    <div className={`field ${className}`}>
      {/* The error shares the label's row, so showing it never pushes the form down. */}
      <div className="field-head">
        <label htmlFor={id} className="label">
          {label}
          {props.required ? <RequiredMark /> : null}
        </label>
        {error ? (
          <p id={`${id}-error`} className="error-text">
            {error}
          </p>
        ) : null}
      </div>
      <Control id={id} name={id} className="input" aria-invalid={error ? true : undefined} aria-describedby={describedBy} {...props} />
      {hint ? (
        <p id={`${id}-hint`} className="hint">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/** Marks a required field; the input's own `required` attribute is what assistive technology announces. */
export function RequiredMark() {
  return (
    <span className="required-mark" aria-hidden="true">
      *
    </span>
  );
}

/** One-line note explaining the asterisk, placed at the top of a form. */
export function RequiredNote() {
  return <p className="t-micro text-ink-2">Polja označena zvezdicom (*) su obavezna.</p>;
}

/** Focusable error summary shown after a failed submit; each entry links to its field. */
export function ErrorSummary({ errors, labels, summaryRef }) {
  const entries = Object.entries(errors).filter(([field]) => labels[field]);
  if (entries.length === 0) return null;
  return (
    <div ref={summaryRef} tabIndex={-1} role="alert" aria-labelledby="error-summary-title" className="notice notice-error outline-none">
      <h2 id="error-summary-title" className="font-sans text-[0.9375rem] font-semibold">
        Proverite {entries.length === 1 ? "jedno polje" : `${entries.length} polja`}
      </h2>
      <ul className="mt-2 grid gap-1">
        {entries.map(([field, message]) => (
          <li key={field}>
            <a href={`#${field}`} className="underline underline-offset-4">
              {labels[field]}: {message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Hidden field that people never fill in; submissions that do are rejected as spam. */
export function Honeypot({ value, onChange }) {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label htmlFor="website">Ne popunjavajte ovo polje</label>
      <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
