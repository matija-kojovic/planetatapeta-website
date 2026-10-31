"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartProvider";
import menuData from "@/components/MenuData";
import ProductSlider from "@/components/ProductSlider";
import FAQ from "@/components/FAQ";

export default function Home() {
  const router = useRouter();
  const [content, setContent] = useState(null);
  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  useEffect(() => {
    // Fetch Global Site Content
    fetch('/api/content')
      .then(res => res.json())
      .then(data => setContent(data))
      .catch(console.error);
      
    // Fetch Live Products Catalog
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setIsLoadingProducts(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoadingProducts(false);
      });
  }, []);
  
  // Metadata enhancement map for styling the dynamically extracted menu items
  const componentMetadata = {
    // Digitalna stampa
    'tapete':               { icon: "🖼️",  price: 1200, color: "from-teal-700 to-teal-900", accent: "teal",  desc: "Personalizovane tapete vrhunskog kvaliteta za vaš prostor." },
    'slike_na_platnu':      { icon: "🎨",  price: 2500, color: "from-amber-700 to-amber-900", accent: "amber", desc: "Zidna umetnost na dugotrajnom slikarskom platnu." },
    'zidni_stikeri':        { icon: "✂️",   price: 800,  color: "from-teal-800 to-teal-950", accent: "teal",  desc: "Brza i efektna dekoracija za zidove i staklo." },
    'izrada_nalepnica':     { icon: "🏷️",  price: 400,  color: "from-amber-600 to-amber-800", accent: "amber", desc: "Brendirane nalepnice za sve vrste podloga." },
    'slike_na_pleksiglasu': { icon: "💎",  price: 3500, color: "from-teal-900 to-black",       accent: "teal",  desc: "Moderan luksuzni prikaz, štampa na akrilnom staklu." },
  };

  // Transform CMS products into the format required by ProductSlider
  const siteProducts = products.map(item => {
    const meta = componentMetadata[item.itemId] || { icon: item.image || "📦", color: "from-slate-600 to-slate-800", accent: "slate", desc: "Zatražite ponudu za više detalja." };
    return { ...item, ...meta, delay: "delay-100", productId: item.id, categoryId: item.categoryId };
  });

  return (
    <div className="flex flex-col items-center justify-center pb-32">
      {/* Hero Section */}
      <section className="text-center px-4 max-w-4xl mx-auto mb-16 md:mb-24 mt-4 md:mt-8 min-h-[300px] flex flex-col justify-center">
        {content ? (
          <>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-tight mb-6 md:mb-8 drop-shadow-lg">
              {content.hero.titleLine1} <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600">{content.hero.titleLine2}</span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-200 mb-10 max-w-2xl mx-auto font-light leading-relaxed drop-shadow-sm px-2">
              {content.hero.subtitle}
            </p>
            <div className="flex justify-center items-center w-full px-4 sm:px-0 mt-4">
              <Link href="/contact" className="w-full sm:w-auto px-10 py-4 bg-white text-slate-900 rounded-full font-bold text-xl hover:scale-105 transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.4)] hover:shadow-[0_0_45px_rgba(255,255,255,0.6)] text-center flex items-center justify-center gap-3">
                {content.hero.buttonText}
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </>
        ) : (
           <div className="animate-pulse">
             <div className="h-20 bg-slate-800 rounded mb-6 w-3/4 mx-auto"></div>
             <div className="h-6 bg-slate-800 rounded mb-10 w-1/2 mx-auto"></div>
             <div className="h-14 bg-slate-800 rounded-full w-64 mx-auto"></div>
           </div>
        )}
      </section>

      {/* Featured Products (Advanced Slider) */}
      <section className="w-full max-w-7xl mx-auto mt-4 mb-24 relative">
        <div className="flex justify-between items-end mb-4 px-4 sm:px-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Katalog Proizvoda</h2>
            <p className="text-gray-300 text-lg">Kompletna ponuda naših premium usluga štampe.</p>
          </div>
        </div>

        <ProductSlider products={siteProducts} />
        
      </section>

      {/* FAQ Section */}
      <section className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 md:mt-24 mb-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Često postavljana pitanja</h2>
          <p className="text-gray-400">Sve što treba da znate pre nego što naručite.</p>
        </div>
        <FAQ />
      </section>
    </div>
  );
}
