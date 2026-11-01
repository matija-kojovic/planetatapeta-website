import ContentForm from "@/components/admin/ContentForm";
import { getContent } from "@/lib/db";

export const metadata = { title: "Sadržaj sajta" };

export default function AdminContentPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="t-page">Sadržaj sajta</h1>
      <p className="measure mt-3 text-ink-2">Tekstovi i kontakt podaci koje možete menjati bez programera. Cene i opisi proizvoda deo su koda sajta.</p>
      <ContentForm initialContent={getContent()} />
    </div>
  );
}
