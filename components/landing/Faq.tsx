"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    question: "Kak, bagaimana cara order websitenya?",
    answer:
      "Caranya mudah, kak. Buka situs kami lewat Google atau Safari, lalu pilih template yang kamu suka. Setelah itu edit sesuai keinginan, lakukan pembayaran, dan website siap dibagikan ke pasanganmu.",
  },
  {
    question: "Kak, menu pembayaran saya error.",
    answer:
      "Jika halaman pembayaran mengalami error, silakan buka kembali situs kami melalui Google atau browser lain seperti Safari atau Chrome. Hindari membuka website langsung dari link di media sosial karena terkadang dapat menyebabkan kendala saat pembayaran.",
  },
  {
    question: "Kak, saya sudah melakukan pembayaran. Bagaimana cara membagikan website ke pasangan saya?",
    answer:
      "Setelah pembayaran berhasil, buka halaman utama, lalu pilih Masuk. Setelah login, pilih menu Bagikan untuk melihat link dan QR Code yang bisa langsung kamu kirim ke pasanganmu.",
  },
  {
    question: "Benar ya, kak, harganya Rp8.900? Websitenya aktif sampai kapan?",
    answer:
      "Betul, kak. Harga setiap template hanya Rp8.900. Website yang sudah dibuat akan aktif selamanya, sedangkan akses untuk mengedit melalui dashboard tersedia selama 7 hari sejak pembayaran berhasil.",
  },
];

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number>(0);

  return (
    <section className="w-full relative bg-surface" id="faq">
      <div className="relative z-[1] px-5 md:px-16 max-w-4xl mx-auto py-20 md:py-[100px]">
        <div className="mb-12 text-center">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary/10 text-primary font-semibold text-body-sm mb-3">
            <HelpCircle className="h-[18px] w-[18px]" /> Q & A / FAQ
          </span>
          <h2 className="font-heading text-headline-lg text-primary text-center mb-4">
            Pertanyaan yang Sering Diajukan
          </h2>
          <p className="text-body-lg font-medium text-on-surface-variant max-w-2xl mx-auto">
            Masih punya pertanyaan seputar pemesanan, pembayaran, atau cara pakai?
            Kami punya jawabannya di sini.
          </p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, i) => {
            const open = openIndex === i;
            return (
              <div
                key={i}
                className={cn(
                  "bg-surface-container-low rounded-2xl border border-outline-variant/30 shadow-sm transition-all duration-300 overflow-hidden",
                  open && "shadow-md border-primary/40"
                )}
              >
                <button
                  type="button"
                  className="w-full px-6 py-5 flex items-center justify-between text-left gap-4 focus:outline-none rounded-2xl transition-colors hover:bg-surface-container/50"
                  aria-expanded={open}
                  onClick={() => setOpenIndex(open ? -1 : i)}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-body-sm transition-colors",
                        open ? "bg-primary text-white" : "bg-primary-fixed/20 text-primary"
                      )}
                    >
                      Q
                    </div>
                    <h3 className="font-body text-base md:text-lg text-on-surface font-semibold leading-snug">
                      {faq.question}
                    </h3>
                  </div>
                  <ChevronDown
                    className={cn(
                      "text-on-surface-variant transition-transform duration-300 shrink-0",
                      open && "rotate-180"
                    )}
                  />
                </button>
                {open && (
                  <div className="px-6 pb-6 pt-1 text-on-surface-variant text-body-md leading-relaxed border-t border-outline-variant/10">
                    <div className="pl-11">{faq.answer}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
