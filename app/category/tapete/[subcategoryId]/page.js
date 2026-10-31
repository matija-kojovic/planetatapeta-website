import { notFound } from "next/navigation";
import fs from "fs";
import path from "path";
import SubcategoryGallery from "@/components/SubcategoryGallery";

// Subcategory definitions
const subcategoryMap = {
  decije: { label: "Dečije tapete", folder: "decije", prefix: "decijeTapete", description: "Veseli motivi za dečije sobe." },
  cvetne: { label: "Cvetne tapete", folder: "cvetne", prefix: "cvetnaTapeta", description: "Elegantni cvetni motivi." },
  "3d":   { label: "3D tapete", folder: "3d", prefix: "3Dtapete", description: "Moderan 3D dizajn." },
  grad:   { label: "Grad tapete", folder: "grad", prefix: "gradTapete", description: "Gradski pejzaži." },
  mermer: { label: "Mermer tapete", folder: "mermer", prefix: "mermerTapete", description: "Luksuzni mermer motivi." },
};

export async function generateMetadata({ params }) {
  const { subcategoryId } = await params;
  const sub = subcategoryMap[subcategoryId];
  if (!sub) return { title: "Tapete | PLANETATAPETA" };
  return {
    title: `${sub.label} | PLANETATAPETA`,
    description: sub.description,
  };
}

function getImagesForSubcategory(subcategoryId) {
  const sub = subcategoryMap[subcategoryId];
  if (!sub) return [];

  const dirPath = path.join(process.cwd(), "public", "tapete", sub.folder);
  
  try {
    const files = fs.readdirSync(dirPath)
      .filter(f => f.endsWith(".webp") || f.endsWith(".jpg") || f.endsWith(".png"))
      .sort((a, b) => {
        const numA = parseInt(a.replace(/\D/g, "")) || 0;
        const numB = parseInt(b.replace(/\D/g, "")) || 0;
        return numA - numB;
      });

    return files.map((filename, index) => ({
      id: `${subcategoryId}-${index + 1}`,
      filename,
      src: `/tapete/${sub.folder}/${filename}`,
      title: `${sub.label.replace(' tapete', '')} #${index + 1}`,
    }));
  } catch {
    return [];
  }
}

export default async function SubcategoryPage({ params }) {
  const { subcategoryId } = await params;
  const sub = subcategoryMap[subcategoryId];
  if (!sub) notFound();

  const images = getImagesForSubcategory(subcategoryId);

  return <SubcategoryGallery subcategoryId={subcategoryId} images={images} />;
}
