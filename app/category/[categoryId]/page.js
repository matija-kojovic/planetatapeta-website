import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import menuData from "@/components/MenuData";
import { getProducts } from "@/lib/db";

export async function generateMetadata({ params }) {
  const { categoryId } = await params;
  
  // Redirect tapete to the new subcategory page
  if (categoryId === "tapete") return { title: "Tapete | PLANETATAPETA" };
  if (categoryId === "zidni_stikeri") return { title: "Zidni stikeri | PLANETATAPETA" };
  if (categoryId === "slike_na_platnu") return { title: "Slike na platnu | PLANETATAPETA" };

  const category = menuData.menu.categories.find((c) => c.id === categoryId);
  if (!category) return { title: "Kategorija | PLANETATAPETA" };

  return {
    title: `${category.label} | PLANETATAPETA`,
    description: `Pogledajte proizvode iz kategorije ${category.label}.`,
  };
}

export default async function CategoryPage({ params }) {
  const { categoryId } = await params;

  // Redirect tapete to the new subcategory selection page
  if (categoryId === "tapete") {
    redirect("/category/tapete");
  }
  // Redirect zidni_stikeri to the new subcategory selection page
  if (categoryId === "zidni_stikeri") {
    redirect("/category/zidni_stikeri");
  }
  // Redirect slike_na_platnu to the custom page
  if (categoryId === "slike_na_platnu") {
    redirect("/category/slike_na_platnu");
  }

  const category = menuData.menu.categories.find((c) => c.id === categoryId);
  if (!category) notFound();

  // Fetch live products from DB
  const siteProducts = getProducts();

  // Filter products by categoryId or itemId
  let displayedProducts = siteProducts.filter(p => p.categoryId === categoryId || p.itemId === categoryId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 mb-8">
        <Link href="/" className="text-gray-400 hover:text-white text-sm transition-colors">Početna</Link>
        <svg className="w-3.5 h-3.5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-white text-sm font-medium">{category.label}</span>
      </div>

      <div className="text-center mb-12 md:mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
          {category.label}
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Izaberite proizvod ili uslugu iz ove kategorije.
        </p>

        {/* Custom design callout */}
        <div className="mt-6 inline-flex items-center gap-3 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl px-6 py-4">
          <svg className="w-6 h-6 text-amber-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <p className="text-sm text-amber-400 text-left">
            Želite nešto jedinstveno? Odaberite bilo koji dizajn sa{" "}
            <a href="https://www.shutterstock.com/vectors" target="_blank" rel="noopener noreferrer" className="text-white hover:text-amber-200 underline underline-offset-2 font-bold transition-colors">
              Shutterstock galerije
            </a>{" "}
            i mi ćemo ga odštampati za vas!
          </p>
        </div>
      </div>

      {/* Render Product Cards */}
      {displayedProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
          {displayedProducts.map((product) => (
            <Link
              href={`/product/${product.id}`}
              key={product.id}
              className="group relative bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl overflow-hidden hover:-translate-y-2 transition-all duration-300 hover:border-white/20 hover:shadow-xl hover:shadow-amber-500/10 flex flex-col"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Product Image */}
              <div className="relative aspect-square bg-white/10 flex items-center justify-center border-b border-white/5 group-hover:scale-[1.02] transition-transform duration-300 overflow-hidden">
                {product.imageSrc && (
                  <Image
                    src={product.imageSrc}
                    alt={product.title}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    className="object-cover"
                  />
                )}
              </div>

              {/* Product Info */}
              <div className="p-6 relative z-10 flex-grow flex flex-col justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white mb-2 leading-tight group-hover:text-amber-400 transition-colors">
                    {product.title}
                  </h2>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xl font-extrabold text-white">
                    {product.price.toLocaleString('sr-RS')} RSD
                  </span>

                  <div className="bg-white/10 group-hover:bg-amber-500/20 group-hover:text-amber-300 text-white border border-white/20 group-hover:border-amber-500/30 w-10 h-10 rounded-xl flex items-center justify-center transition-all">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10">
          <div className="text-6xl mb-4 opacity-50">🛠️</div>
          <h3 className="text-2xl font-bold text-white mb-2">Proizvodi se pripremaju</h3>
          <p className="text-gray-400">Trenutno nemamo unetih proizvoda za ovu kategoriju.</p>
        </div>
      )}
    </div>
  );
}
