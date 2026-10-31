import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "Zidni stikeri — Izaberite Kategoriju | PLANETATAPETA",
  description: "Odaberite vrstu stikera: dečiji stikeri ili stikeri za sobu. Premium kvalitet štampe.",
};

const subcategories = [
  {
    id: "decije",
    label: "Dečiji stikeri",
    description: "Veseli motivi za dečije sobe — životinje, oblaci, crtani likovi.",
    coverImage: "/stikeri/decije/stikerDeca1.webp",
    gradient: "from-amber-500/25 to-orange-500/25",
    accent: "orange",
  },
  {
    id: "soba",
    label: "Stikeri za sobu",
    description: "Elegantni i moderni stikeri za dnevnu sobu, spavaću sobu i druge prostore.",
    coverImage: "/stikeri/soba/stikeriSoba1.webp",
    gradient: "from-amber-500/25 to-orange-500/25",
    accent: "orange",
  },
];

export default function StikeriCategoryPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12 md:mb-16">
        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-6">
          <Link href="/" className="text-gray-400 hover:text-white text-sm transition-colors">Početna</Link>
          <svg className="w-3.5 h-3.5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-white text-sm font-medium">Zidni stikeri</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
          Izaberite vrstu stikera
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Premium dekorativni stikeri vrhunskog kvaliteta — odaberite kategoriju koja vam se sviđa.
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

      {/* Subcategory Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto">
        {subcategories.map((sub, index) => (
          <Link
            href={`/category/zidni_stikeri/${sub.id}`}
            key={sub.id}
            className="group relative bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl overflow-hidden hover:-translate-y-2 transition-all duration-500 hover:border-white/25 hover:shadow-2xl hover:shadow-amber-500/10 flex flex-col"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Hover Gradient Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br ${sub.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-[1]`} />
            
            {/* Cover Image */}
            <div className="relative aspect-[4/3] overflow-hidden">
              <Image
                src={sub.coverImage}
                alt={sub.label}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
              />
              {/* Dark gradient overlay at bottom for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-[2]" />
            </div>

            {/* Text Info */}
            <div className="p-6 relative z-[3] flex-grow flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-bold text-white mb-2 group-hover:text-amber-400 transition-colors duration-300">
                  {sub.label}
                </h2>
                <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-300 transition-colors">
                  {sub.description}
                </p>
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-gray-500 group-hover:text-gray-400 transition-colors">
                  Pogledajte sve →
                </span>
                <div className="bg-white/10 group-hover:bg-amber-500/20 group-hover:text-amber-300 text-white border border-white/20 group-hover:border-amber-500/30 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300">
                  <svg className="w-5 h-5 group-hover:translate-x-0.5 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
