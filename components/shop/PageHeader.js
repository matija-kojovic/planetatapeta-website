import Breadcrumbs from "./Breadcrumbs";

/**
 * Page opening (A): breadcrumbs, the title, a short intro and an optional aside
 * (the price list). `size="page"` is the large catalogue heading over a rule;
 * `size="section"` is the smaller heading used on contact and similar pages.
 */
export default function PageHeader({ crumbs, title, intro, aside, asideClassName = "", size = "page", children }) {
  const large = size === "page";
  return (
    <header className="page">
      {crumbs ? <Breadcrumbs items={crumbs} /> : null}
      <div
        className={`grid gap-6 pt-5 ${large ? "border-b border-ink pb-9" : "pb-8"} ${aside ? "lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end lg:gap-14" : ""}`}
      >
        <div>
          <h1 className={large ? "t-page" : "t-section"}>{title}</h1>
          {intro ? <p className="mt-5 max-w-[54ch] text-[1.0625rem]">{intro}</p> : null}
          {children}
        </div>
        {aside ? <div className={asideClassName}>{aside}</div> : null}
      </div>
    </header>
  );
}
