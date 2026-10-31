import { notFound } from "next/navigation";
import { getProducts } from "@/lib/db";
import ProductConfigurator from "@/components/ProductConfigurator";
import Link from "next/link";

export async function generateMetadata({ params }) {
  const { productId } = await params;
  const products = getProducts();
  const product = products.find(p => p.id === productId);
  
  if (!product) return { title: "Proizvod | PLANETATAPETA" };

  return {
    title: `${product.title} | PLANETATAPETA`,
    description: `Konfigurišite i poručite ${product.title}.`,
  };
}

export default async function ProductPage({ params }) {
  const { productId } = await params;
  
  const products = getProducts();
  const product = products.find(p => p.id === productId);
  
  if (!product) notFound();

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        
       {/* Breadcrumbs / Back button */}
       <div className="max-w-6xl mx-auto mb-8">
           <Link 
               href={`/category/${product.itemId || product.categoryId}`}
               className="inline-flex items-center text-gray-400 hover:text-white transition-colors text-sm font-medium"
           >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Nazad na odabir dizajna
           </Link>
       </div>

       {/* Form Wrapper */}
       <ProductConfigurator product={product} />
       
    </div>
  );
}
