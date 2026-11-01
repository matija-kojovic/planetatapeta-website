/** Section heading row: the title on the left, an optional note or link on the right. */
export default function SectionHead({ id, title, children }) {
  return (
    <div className="mb-6 flex flex-col items-start gap-2.5 lg:mb-8 lg:flex-row lg:flex-wrap lg:items-end lg:justify-between lg:gap-x-8 lg:gap-y-4">
      <h2 id={id} className="t-section">
        {title}
      </h2>
      {children}
    </div>
  );
}
