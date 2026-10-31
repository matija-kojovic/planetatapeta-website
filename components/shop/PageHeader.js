import Breadcrumbs from "./Breadcrumbs";

/** Page opening: breadcrumbs, H1, short intro, optional aside (e.g. a price table). */
export default function PageHeader({ crumbs, title, intro, aside, children }) {
  return (
    <header className="page pb-10 pt-8 lg:pb-14 lg:pt-12">
      {crumbs ? <Breadcrumbs items={crumbs} /> : null}
      <div className={`mt-6 grid gap-8 ${aside ? "lg:grid-cols-12 lg:items-end" : ""}`}>
        <div className={aside ? "lg:col-span-7" : ""}>
          <h1 className="t-page">{title}</h1>
          {intro ? <p className="t-lead measure mt-5 text-ink-2">{intro}</p> : null}
          {children}
        </div>
        {aside ? <div className="lg:col-span-5">{aside}</div> : null}
      </div>
    </header>
  );
}
