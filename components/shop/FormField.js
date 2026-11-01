/**
 * Input or textarea with a floating label: the label sits inside the empty field
 * and moves onto the top border on focus or once there is a value. The example
 * `placeholder` (e.g. "ime@primer.rs") shows only while the field has focus.
 * The error or hint below has a reserved line, so an error never pushes the form.
 */
export default function FormField({ id, label, hint, error, as = "input", className = "", placeholder = " ", ...props }) {
  const Control = as;
  return (
    <div className={`field ${className}`}>
      <div className={`float-field${as === "textarea" ? " is-textarea" : ""}`}>
        <Control
          id={id}
          name={id}
          className="input float-input"
          placeholder={placeholder}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? `${id}-msg` : undefined}
          {...props}
        />
        <FloatingLabel htmlFor={id} required={props.required}>
          {label}
        </FloatingLabel>
      </div>
      <FieldMessage id={`${id}-msg`} error={error} hint={hint} />
    </div>
  );
}

/** The label of a floating field; it must directly follow its control. */
export function FloatingLabel({ htmlFor, required, children }) {
  return (
    <label htmlFor={htmlFor} className="float-label">
      {children}
      {required ? <RequiredMark /> : null}
    </label>
  );
}

/** The reserved line under a field: the error when there is one, otherwise the hint. */
export function FieldMessage({ id, error, hint }) {
  return (
    <p id={id} className={`field-msg ${error ? "error-text" : "hint"}`}>
      {error || hint}
    </p>
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
