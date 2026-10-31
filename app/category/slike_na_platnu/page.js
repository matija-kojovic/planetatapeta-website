import Link from "next/link";
import fs from "fs";
import path from "path";
import CanvasGalleryClient from "./CanvasGalleryClient";

export const metadata = {
  title: "Slike na platnu — Višedelne Slike | PLANETATAPETA",
  description: "Moderni poliptisi i višedelne slike na platnu. Odaberite motiv i prilagodite dimenzije i broj panela.",
};

function getImages() {
  const dirPath = path.join(process.cwd(), "public", "slike-na-platnu");
  
  try {
    const files = fs.readdirSync(dirPath)
      .filter(f => f.endsWith(".jpg") || f.endsWith(".jpeg") || f.endsWith(".webp") || f.endsWith(".png"))
      .sort((a, b) => {
        const numA = parseInt(a.replace(/\D/g, "")) || 0;
        const numB = parseInt(b.replace(/\D/g, "")) || 0;
        return numA - numB;
      });

    return files.map((filename, index) => ({
      id: `platno-${index + 1}`,
      filename,
      src: `/slike-na-platnu/${filename}`,
      title: `Motiv #${index + 1}`,
    }));
  } catch {
    return [];
  }
}

export default async function CanvasCategoryPage() {
  const images = getImages();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12 md:mb-16">
        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-6">
          <Link href="/" className="text-gray-400 hover:text-white text-sm transition-colors">Početna</Link>
          <svg className="w-3.5 h-3.5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-white text-sm font-medium">Slike na platnu</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
          Slike na platnu — Višedelni Poliptisi
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Pretvorite vaše omiljene motive u moderne višedelne slike na platnu. Odaberite dizajn i konfigurišite broj panela.
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

      {/* Render Client Gallery */}
      <CanvasGalleryClient images={images} />
    </div>
  );
}
