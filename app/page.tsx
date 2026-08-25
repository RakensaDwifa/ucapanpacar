import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Eye,
  Heart,
  Images,
  LayoutGrid,
  Music,
  PencilLine,
  QrCode,
  Rocket,
  User,
} from "lucide-react";
import PolaroidCarousel from "@/components/landing/PolaroidCarousel";
import Faq from "@/components/landing/Faq";
import { getActiveTemplates, templateEmoji } from "@/lib/templates";
import { CATEGORY_META } from "@/lib/types";

const STEPS = [
  {
    icon: LayoutGrid,
    title: "Pilih Template",
    desc: "Pilih template yang cocok untuk momen kalian.",
  },
  {
    icon: PencilLine,
    title: "Isi Konten",
    desc: "Ceritain hal yang kamu suka dari dia, lalu tulis pesan, dan upload foto kenangan kalian.",
  },
  {
    icon: Eye,
    title: "Preview Website",
    desc: "Cek tampilan ucapan digitalmu secara langsung, supaya hasil akhirnya sesuai dengan yang kamu inginkan.",
  },
  {
    icon: Rocket,
    title: "Kirim Kejutan",
    desc: "Bayar Rp. 8.900, website aktif dan langsung dikirim ke pacar kamu.",
  },
];

const FEATURES = [
  {
    icon: User,
    title: "Personalisasi Nama Pacar",
    desc: "Tampilkan nama pacar kamu langsung di website agar terasa dibuat khusus hanya untuk dia.",
  },
  {
    icon: Images,
    title: "Galeri Kenangan",
    desc: "Masukkan foto dan video terbaik yang pernah kalian abadikan bersama dalam satu halaman spesial.",
  },
  {
    icon: Heart,
    title: "Tulis Ucapan untuk Pacar Kamu",
    desc: "Ungkapkan rasa sayang, terima kasih, harapan, atau pesan yang ingin kamu sampaikan.",
  },
  {
    icon: Music,
    title: "Musik Favorit",
    desc: "Tambahkan musik yang punya cerita spesial agar suasana jadi lebih romantis saat website dibuka.",
  },
  {
    icon: QrCode,
    title: "Kirim dengan QR",
    desc: "Bagikan website melalui link atau QR Code dan biarkan pacar kamu menikmati kejutannya.",
  },
  {
    icon: Eye,
    title: "Jejak Kunjungan",
    desc: "Lihat waktu pertama kali website dibuka oleh pacar kamu secara real-time.",
  },
];

export default function HomePage() {
  const templates = getActiveTemplates();

  return (
    <>
      {/* HERO */}
      <section className="w-full relative bg-surface overflow-hidden">
        <div className="relative z-[1] px-5 md:px-16 max-w-[1200px] mx-auto pt-[120px] pb-20 lg:pt-[160px] lg:pb-[120px] flex flex-col lg:flex-row items-center gap-12 lg:justify-center">
          <div className="flex-1 text-center lg:text-left z-10">
            <span className="inline-block max-w-full px-4 py-1.5 bg-primary-container text-on-primary-container text-label-md lg:text-label-lg font-semibold text-center rounded-full mb-6 border border-primary-fixed-dim/30 shadow-sm whitespace-normal">
              Pionir #1 Platform Love Letter Digital Indonesia
            </span>
            <h1 className="font-heading text-display-md lg:text-display-lg text-primary text-center lg:text-left mb-6 leading-tight">
              <span className="italic">Sampaikan Perasaan dengan Cara yang Berbeda!</span>
            </h1>
            <p className="text-label-lg font-semibold text-primary mb-6 tracking-widest uppercase">
              Love Letter • Anniversary • Birthday • Special Moments
            </p>
            <p className="text-body-lg font-medium text-on-surface-variant mb-8 max-w-lg mx-auto lg:mx-0">
              Pacar kamu layak dapat lebih dari sekedar chat. Buat website ucapan
              personal yang bikin dia tersenyum.
            </p>
            <div className="flex flex-col items-center lg:items-start gap-2">
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 w-full sm:w-auto">
                <Link
                  href="/templates"
                  className="w-full sm:w-auto px-16 py-4 bg-primary text-white text-label-lg font-semibold rounded-full shadow-[0_8px_30px_rgba(217,108,138,0.3)] hover:-translate-y-1 transition-all duration-300 text-center inline-block"
                >
                  Buat Kejutan Sekarang
                </Link>
              </div>
              <p className="text-[12px] font-medium text-on-surface-variant/80 mt-1 italic">
                * Link Ucapan Digital Aktif Selamanya
              </p>
            </div>
          </div>
          <div className="flex-1 w-full max-w-[500px] mt-12 lg:mt-0 flex flex-col items-center">
            <PolaroidCarousel />
          </div>
        </div>
      </section>

      {/* CARA KERJA */}
      <section className="w-full relative bg-primary" id="cara-kerja">
        <div className="relative z-[1] px-5 md:px-16 max-w-[1200px] mx-auto py-20 md:py-[120px]">
          <div className="mb-12 text-center">
            <h2 className="font-heading text-headline-lg text-white text-center mb-4 drop-shadow-sm">
              Cara Buat Kejutan untuk Pacar Kamu
            </h2>
            <p className="text-body-lg font-medium text-white/90">
              Cuma butuh <span className="font-semibold text-white">5 menit</span>,
              kejutan kamu sudah siap dikirim ke dia.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div className="space-y-12">
              {STEPS.map((step, i) => (
                <div key={i} className="flex gap-6 items-start">
                  <div className="w-20 h-20 flex-shrink-0 bg-white/20 rounded-xl flex items-center justify-center shadow-sm backdrop-blur-sm">
                    <step.icon className="text-white h-8 w-8" />
                  </div>
                  <div>
                    <p className="text-body-lg font-medium text-white/90">
                      <span className="font-semibold text-white">
                        {i + 1}. {step.title}
                      </span>{" "}
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="relative">
              <div className="mb-6">
                <h3 className="font-heading text-headline-md text-white drop-shadow-sm">
                  Lihat Video
                </h3>
                <p className="text-label-lg font-semibold text-white/80">
                  (Buat Kejutan Dengan Mudah)
                </p>
              </div>
              <div className="relative rounded-[2rem] overflow-hidden shadow-card border border-outline-variant/30 aspect-video group bg-white/10 flex items-center justify-center">
                <div className="text-center text-white/80">
                  <Rocket className="h-14 w-14 mx-auto mb-3 text-white/60" />
                  <p className="text-body-md font-medium">Demo video menyusul</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FITUR */}
      <section className="w-full relative bg-surface" id="fitur">
        <div className="relative z-[1] px-5 md:px-16 max-w-[1200px] mx-auto py-20 md:py-[120px]">
          <div className="mb-12 text-center">
            <h2 className="font-heading text-headline-lg text-primary text-center mb-4">
              Semua yang Kamu Butuhkan untuk Bikin Dia Tersenyum
            </h2>
            <p className="text-body-lg font-medium text-on-surface-variant">
              Fitur yang dirancang bukan hanya menyesuaikan kebutuhan, namun
              menjadikan momen kalian makin berkesan.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/30 shadow-card hover:-translate-y-1 hover:shadow-card-hover transition-all duration-300"
              >
                <div className="w-12 h-12 bg-primary-fixed/20 rounded-full flex items-center justify-center text-primary mb-4">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="font-heading text-xl text-on-surface mb-2">{feature.title}</h3>
                <p className="text-body-md text-on-surface-variant">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* KOLEKSI TEMPLATE */}
      <section className="w-full relative bg-primary overflow-hidden" id="koleksi">
        <div className="relative z-[1] px-5 md:px-16 max-w-[1200px] mx-auto py-16 md:py-24">
          <div className="text-center mb-6 md:mb-8">
            <h2 className="font-heading text-headline-md md:text-headline-lg text-white text-center mb-3 drop-shadow-sm">
              Pilih Template yang Cocok untuk Momen Kalian
            </h2>
            <p className="text-body-md md:text-body-lg font-medium text-white/90 max-w-2xl mx-auto">
              Setiap template punya kesan yang berbeda, pilih yang paling cocok untuk
              cerita kalian.
            </p>
          </div>

          <div className="flex justify-center gap-2 md:gap-3 mb-10 flex-wrap">
            {Object.values(CATEGORY_META)
              .filter((c) => c.active)
              .map((cat) => (
                <Link
                  key={cat.label}
                  href={`/templates?kategori=${cat.label.toLowerCase().replace(" ", "-")}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-label-md font-semibold transition-all bg-white/15 text-white hover:bg-white/25"
                >
                  <span>{cat.emoji}</span>
                  <span>{cat.label}</span>
                </Link>
              ))}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((t) => (
              <Link
                key={t.slug}
                href={`/buat/${t.slug}`}
                className="group bg-white rounded-3xl overflow-hidden shadow-card hover:-translate-y-1.5 hover:shadow-card-hover transition-all duration-300"
              >
                <div
                  className={`relative h-44 bg-gradient-to-br ${t.gradient} flex items-center justify-center`}
                >
                  <span className="text-7xl drop-shadow-lg group-hover:scale-110 transition-transform duration-300">
                    {templateEmoji(t.slug)}
                  </span>
                  <span className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm rounded-full px-3 py-1 text-label-md font-semibold text-on-surface-variant">
                    {CATEGORY_META[t.type].emoji} {CATEGORY_META[t.type].label}
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="font-heading text-xl text-on-surface mb-1.5">{t.name}</h3>
                  <p className="text-body-md text-on-surface-variant mb-4">{t.description}</p>
                  <span className="inline-flex items-center gap-1.5 text-label-lg font-semibold text-primary">
                    Buat Sekarang <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/templates"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-primary text-label-lg font-semibold rounded-full hover:bg-gray-50 transition-all duration-300 shadow-md hover:-translate-y-0.5"
            >
              Lihat Semua Template
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <Faq />

      {/* CTA */}
      <section className="w-full relative bg-surface overflow-hidden">
        <div className="relative z-[1] px-5 md:px-16 max-w-[1200px] mx-auto py-20 md:py-[100px] text-center">
          <div className="w-full md:max-w-4xl mx-auto px-2 md:px-0">
            <h2 className="font-heading text-[32px] md:text-headline-lg text-primary text-center mb-4 px-2">
              Siap buat pacar kamu tersenyum hari ini?
            </h2>
            <p className="text-body-lg font-medium text-on-surface-variant mb-10">
              Nggak perlu mahal untuk bikin dia ngerasa spesial.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/templates"
                className="w-full sm:w-auto px-12 py-5 bg-primary text-white text-body-lg font-semibold rounded-full shadow-[0_8px_30px_rgba(217,108,138,0.3)] hover:shadow-[0_12px_40px_rgba(217,108,138,0.4)] hover:-translate-y-1 transition-all duration-300 inline-block"
              >
                Buat Kejutan Sekarang Rp 8.900
              </Link>
            </div>
            <p className="mt-6 text-label-md font-bold text-on-surface-variant flex items-center justify-center gap-2">
              <BadgeCheck className="h-[18px] w-[18px] text-primary" /> Pembayaran aman & proses instan
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
