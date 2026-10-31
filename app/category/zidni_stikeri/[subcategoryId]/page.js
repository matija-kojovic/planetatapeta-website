import { notFound } from "next/navigation";
import fs from "fs";
import path from "path";
import StickerSubcategoryGallery from "@/components/StickerSubcategoryGallery";

// Subcategory definitions for stickers
const subcategoryMap = {
  decije: { label: "Dečiji stikeri", folder: "decije", prefix: "stikerDeca", description: "Veseli motivi za dečije sobe." },
  soba:   { label: "Stikeri za sobu", folder: "soba", prefix: "stikeriSoba", description: "Elegantni i moderni stikeri za sobu." },
};

export async function generateMetadata({ params }) {
  const { subcategoryId } = await params;
  const sub = subcategoryMap[subcategoryId];
  if (!sub) return { title: "Zidni stikeri | PLANETATAPETA" };
  return {
    title: `${sub.label} | PLANETATAPETA`,
    description: sub.description,
  };
}

function getImagesForSubcategory(subcategoryId) {
  const sub = subcategoryMap[subcategoryId];
  if (!sub) return [];

  const dirPath = path.join(process.cwd(), "public", "stikeri", sub.folder);
  
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
      src: `/stikeri/${sub.folder}/${filename}`,
      title: `${sub.label.replace(' stikeri', '').replace('Stikeri za ', '')} #${index + 1}`,
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

  return <StickerSubcategoryGallery subcategoryId={subcategoryId} images={images} />;
}
