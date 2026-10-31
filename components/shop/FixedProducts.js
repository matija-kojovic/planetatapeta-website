import Image from "next/image";
import Link from "next/link";
import { getProducts } from "@/lib/db";
import { formatRSD } from "@/lib/format";

/** Fixed-price products added in the admin for this category, if any. */
export default function FixedProducts({ category }) {
  const products = getProducts().filter((p) => p.category === category);
  if (products.length === 0) return null;
  return (
    <section aria-labelledby="ostali-proizvodi" className="page mt-20">
      <h2 id="ostali-proizvodi" className="t-section">
        Ostali proizvodi
      </h2>
      <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
        {products.map((product) => (
          <li key={product.id}>
            <Link href={`/product/${product.id}`} className="card-link block">
              <div className="board">
                {product.image ? <Image src={product.image} alt="" width={600} height={600} unoptimized /> : null}
              </div>
              <h3 className="card-title mt-3 text-[0.9375rem] font-semibold">{product.title}</h3>
              <p className="t-micro tabular mt-0.5 text-ink-2">{formatRSD(product.price)}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
