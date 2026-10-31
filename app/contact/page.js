export const metadata = {
  title: "Kontakt | Moderna Štamparija",
  description: "Stupite u kontakt sa nama za vaše potrebe digitalne štampe ili posetite našu radnju.",
};
import ContactForm from "@/components/ContactForm";

export default function ContactPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">Kontaktirajte Nas</h1>
        <p className="text-xl text-gray-300">Tu smo da pomognemo da vaše ideje zažive.</p>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl rounded-3xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Pošaljite Poruku</h2>
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
