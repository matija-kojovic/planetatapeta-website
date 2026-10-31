import Link from "next/link";
import { absoluteUrl } from "@/lib/site";
import JsonLd from "./JsonLd";

/** items: [{ label, href }] — the last item is the current page. */
export default function Breadcrumbs({ items, className = "" }) {
  const trail = [{ label: "Početna", href: "/" }, ...items];
  return (
    <>
      <nav aria-label="Putanja" className={`t-small text-ink-2 ${className}`}>
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {trail.map((item, index) => {
            const last = index === trail.length - 1;
            return (
              <li key={item.href} className="flex items-center gap-2">
                {last ? (
                  <span aria-current="page" className="text-ink">
                    {item.label}
                  </span>
                ) : (
                  <>
                    <Link href={item.href} className="underline decoration-line underline-offset-4 hover:decoration-ink">
                      {item.label}
                    </Link>
                    <span aria-hidden="true" className="text-edge">
                      /
                    </span>
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: trail.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.label,
            item: absoluteUrl(item.href),
          })),
        }}
      />
    </>
  );
}
