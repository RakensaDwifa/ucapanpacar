export const metadata = {
  title: "Kebijakan Privasi",
  description: "Kebijakan privasi UcapanPacar.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-surface pt-32 pb-20">
      <div className="max-w-3xl mx-auto px-5 md:px-16">
        <h1 className="font-heading text-headline-lg text-primary mb-6">Kebijakan Privasi</h1>
        <div className="bg-white rounded-3xl border border-outline-variant/30 shadow-card p-8 space-y-5 text-body-md leading-relaxed text-on-surface">
          <p>
            <strong>Data yang kami kumpulkan.</strong> Kami hanya menyimpan data yang kamu
            masukkan saat membuat ucapan: nama, pesan, foto, dan preferensi template.
          </p>
          <p>
            <strong>Pembayaran.</strong> Transaksi diproses oleh penyedia pembayaran pihak
            ketiga. Kami tidak pernah menyimpan data kartu atau kata sandi.
          </p>
          <p>
            <strong>Jejak kunjungan.</strong> Dengan izin, kami mencatat waktu dan lokasi
            perkiraan saat link ucapan dibuka, agar kamu tahu kapan kejutanmu dilihat.
          </p>
          <p>
            <strong>Cookie & penyimpanan lokal.</strong> Kami menggunakan penyimpanan lokal
            browser agar draf ucapanmu tidak hilang saat berpindah halaman.
          </p>
          <p>
            <strong>Berbagi data.</strong> Kami tidak menjual data pribadimu ke pihak mana pun.
          </p>
        </div>
      </div>
    </div>
  );
}
