import PageHeader from "./PageHeader";

/**
 * Structure for a legal page whose text has not been provided yet. It lists
 * what the document must cover without stating any policy, and shows how to
 * reach the business in the meantime.
 */
export default function LegalPlaceholder({ title, href, sections, contact }) {
  return (
    <>
      <PageHeader crumbs={[{ label: title, href }]} title={title} size="section" />
      <div className="page">
        <div className="measure grid gap-8">
          <p className="notice notice-quiet">
            Tekst ovog dokumenta je u pripremi. Za sva pitanja u vezi sa ovom temom pišite na{" "}
            <a className="link" href={`mailto:${contact.email}`}>
              {contact.email}
            </a>{" "}
            ili pozovite {contact.phone}.
          </p>
          <ol className="grid gap-3 border-t border-line pt-6 text-ink-2">
            {sections.map((section, index) => (
              <li key={section} className="flex gap-4">
                <span className="tabular w-6 shrink-0 text-gold">{index + 1}.</span>
                <span>{section}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </>
  );
}
