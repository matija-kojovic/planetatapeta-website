"use client";

import { useState } from "react";

const faqData = [
  {
    question: "Kako da naručim?",
    answer:
      "Naručivanje je jednostavno — možete nas kontaktirati putem e-maila ili telefonskim putem. Nakon što nam opišete šta vam je potrebno, mi ćemo vam dostaviti ponudu i dogovoriti sve detalje kako bismo vaš projekat realizovali u najkraćem roku.",
  },
  {
    question: "Koliko traje dostava?",
    answer:
      "Ukoliko ste odabrali opciju ugradnje, dostavu i montažu vršimo mi lično. U slučaju da ugradnja nije uključena, isporuku realizujemo u najbržem mogućem roku. Takođe nudimo mogućnost hitne dostave koja se dodatno naplaćuje — kontaktirajte nas za više detalja.",
  },
  {
    question: "Da li mogu da pošaljem svoj dizajn?",
    answer:
      "Naravno! Prihvatamo vektorski obrađene slike ili gotove pripreme za štampu. Ukoliko nemate pripremljen materijal, slobodno nas kontaktirajte — opišite nam svoju ideju, a naš dizajner će se potruditi da je zajedno sa vama realizuje u potpunosti.",
  },
  {
    question: "Kako se vrši plaćanje?",
    answer:
      "Plaćanje se vrši putem interneta, što omogućava brzu i sigurnu transakciju. Ukoliko imate specifične zahteve ili poteškoće sa online plaćanjem, javite nam se i potrudićemo se da pronađemo alternativno rešenje koje vam odgovara.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-3">
      {faqData.map((item, index) => (
        <div
          key={index}
          className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
            openIndex === index
              ? "bg-white/[0.06] border-amber-500/30 shadow-lg shadow-amber-500/5"
              : "bg-white/[0.03] border-white/10 hover:border-amber-500/20"
          }`}
        >
          <button
            onClick={() => toggle(index)}
            className="w-full flex items-center justify-between px-6 py-5 text-left group"
          >
            <span
              className={`font-semibold text-base transition-colors ${
                openIndex === index ? "text-amber-400" : "text-white group-hover:text-amber-400"
              }`}
            >
              {item.question}
            </span>
            <div
              className={`flex-shrink-0 ml-4 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                openIndex === index
                  ? "bg-amber-500/20 text-amber-300 rotate-180"
                  : "bg-white/10 text-gray-400 group-hover:bg-amber-500/10 group-hover:text-amber-400"
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>

          {/* Answer panel */}
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              openIndex === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="px-6 pb-5 text-gray-300 leading-relaxed text-sm border-t border-white/5 pt-4">
              {item.answer}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
