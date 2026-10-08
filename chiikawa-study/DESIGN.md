# Arah visual

Brief pengguna: web latihan dan bacaan psikologi, tema **Chiikawa**, ramah untuk sesi panjang, tersedia pilihan UTS/UAS/Mix, streak dan selebrasi Horay. Bahasa Indonesia santai pada navigasi, lebih presisi pada konsep akademik.

Interpretasi desain: ruang belajar kecil bergaya buku ilustrasi, ENERGY 2 / RHYTHM 2 / MOTION 2. Gerak dibatasi transisi pendek, hover kartu, dan selebrasi jawaban; membaca serta menjawab tetap tenang.

## Keputusan implementasi

| Keputusan | Tujuan |
| --- | --- |
| Kertas terang `#faf9f6` dan putih | Mengikuti buku komik serta memberi permukaan baca yang nyaman. |
| Biru lembut dengan tinta biru gelap | Menghubungkan suasana ilustrasi Hachiware dengan pilihan aktif dan tindakan utama yang terbaca. |
| Merah muda untuk tanda atau identitas kecil | Mengambil warna pipi karakter; tidak menjadi latar utama teks. |
| Kuning sebagai aksen terbatas | Menandai petunjuk belajar dan streak, selaras dengan Usagi. |
| Tema terang tetap | Produk memakai identitas halaman komik dan ilustrasi di atas kertas; tidak ada toggle tema yang belum berfungsi. |
| Nunito untuk judul, DM Sans untuk bacaan | Judul membulat mendukung karakter; huruf bacaan lebih tenang untuk paragraf panjang. Font sistem menjadi fallback. |
| Sidebar desktop, empat tombol bawah di HP | Perpindahan mode selalu tersedia tanpa mengambil banyak ruang soal. Riwayat HP dibuka dari beranda. |
| Halaman bacaan berupa kolom teks dan daftar topik | Pengelompokan mengikuti RPS; tidak memecah setiap paragraf menjadi kartu dekoratif. |
| Peta soal dengan status teks pada label aksesibel | Membantu melewati, menandai, dan kembali pada sesi panjang tanpa bergantung pada warna. |
| Banner hasil dan tabel topik | Skor terlihat dahulu, lalu petunjuk belajar yang dapat ditindaklanjuti. |
| Pilihan mata kuliah sebelum PPP, bacaan, dan kartu | Memberi tempat yang jelas untuk memilih bidang belajar saat katalog bertambah; pencarian dan jumlah berasal dari data. |
| Nama mata kuliah dan tombol ganti di setiap mode | Menjaga konteks materi dan memudahkan pindah pilihan tanpa menghapus riwayat. |
| Musik latar pelan pada evaluasi tanpa panel pemutar | Pengguna meminta panel musik dihapus; skor langsung diikuti analisis materi, dengan fade masuk/keluar tetap dipertahankan. |
| Radius 5–23 px sesuai fungsi | Tag kecil, kontrol, panel, dan kartu ingatan mempunyai hierarki bentuk. |
| Satu bayangan tipis di flip card | Menunjukkan kartu yang bisa dibalik, bukan membuat semua panel melayang. |
| Jarak 20–34 px pada panel | Memisahkan tujuan, pilihan, dan pembahasan; pada HP jarak menyusut tanpa memperkecil target sentuh. |
| Ilustrasi tiga teman belajar | Memenuhi tema pengguna, menemani beranda dan selebrasi; diberi label ilustrasi penggemar. |
| Ikon buku, pena, kartu, grafik, pencarian | Masing-masing menunjuk tindakan atau isi yang konkret. SVG dibuat langsung sebagai bagian antarmuka. |
| Tag UTS/UAS, jumlah konsep, dan RPS dipetakan | Semua label berasal dari data nyata, bukan klaim pemasaran. |
| Bahasa soal langsung dengan istilah Inggris dalam kurung | Pengguna meminta pilihan ganda yang lebih mudah dipahami; kesulitan berasal dari kasus dan konsep, bukan kalimat rumit. |
| Panah hanya di tombol mulai sesi | Menandai transisi dari pengaturan ke pengerjaan. |
| Horay pada kelipatan 10 benar | Mengakui streak tanpa mengganggu setiap jawaban. Bisa ditutup dengan Escape. |
| Reduced motion | Animasi dan transisi dihentikan ketika perangkat meminta gerak minimal. |

Tidak ada testimonial, angka pengguna, klaim efektivitas hasil belajar, logo institusi, atau tautan mata kuliah fiktif. Semua jumlah materi dihitung dari data aplikasi.
