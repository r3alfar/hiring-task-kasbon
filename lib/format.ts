export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(amount)
    .replace("IDR", "Rp")
    .trim();
}

export function formatRupiahNoSymbol(amount: number): string {
  return new Intl.NumberFormat("id-ID").format(amount);
}

/**
 * Format tanggal menjadi string relatif dalam Bahasa Indonesia.
 *
 * Penting: perhitungan selisih hari berbasis "kalender hari" (local midnight),
 * bukan timestamp mentah. String tanggal-only seperti "2026-06-22" di-parse
 * sebagai UTC midnight oleh `new Date()`, sedangkan `new Date()` memakai waktu
 * lokal — kalau langsung dikurangi, hasilnya bisa meleset satu hari tergantung
 * timezone browser. Normalisasi ke midnight lokal menghindari bug itu.
 *
 * Mendukung tanggal di masa lalu ("3 hari lalu") maupun masa depan ("3 hari lagi").
 */
export function formatRelativeDate(date: Date | string): string {
  const target = new Date(date);
  const now = new Date();

  const targetMidnight = new Date(
    target.getFullYear(),
    target.getMonth(),
    target.getDate(),
  );
  const nowMidnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );

  const diffDays = Math.round(
    (nowMidnight.getTime() - targetMidnight.getTime()) / (1000 * 60 * 60 * 24),
  );

  const abs = Math.abs(diffDays);
  const suffix = diffDays >= 0 ? "lalu" : "lagi";

  if (diffDays === 0) return "Hari ini";
  if (diffDays === 1) return "Kemarin";
  if (diffDays === -1) return "Besok";

  if (abs < 7) return `${abs} hari ${suffix}`;
  if (abs < 30) {
    const weeks = Math.floor(abs / 7);
    return `${weeks} minggu ${suffix}`;
  }
  if (abs < 365) {
    const months = Math.floor(abs / 30);
    return `${months} bulan ${suffix}`;
  }
  const years = Math.floor(abs / 365);
  return `${years} tahun ${suffix}`;
}
