# Kawan Belajar

Web belajar Psikologi Pendidikan bertema Chiikawa. Aplikasi statis tanpa dependency build atau backend. Materi awal mengikuti topik RPS 2025 revisi 10 yang diberikan pengguna.

## Memakai web

1. Buka Latihan PPP, pilih mata kuliah, lalu pilih UTS, UAS, atau Mix, kesulitan dan jumlah soal.
2. Kerjakan tanpa membuka bahan. Jawaban terkirim terkunci; soal boleh dilewati atau ditandai.
3. Akhiri sesi untuk membaca pembahasan, hasil per topik, dan rekomendasi bacaan.
4. Buka ruang belajar atau flip card, kemudian ulang jawaban yang salah.

Ada 14 topik, 112 konsep/kartu, dan 448 varian soal: 112 easy, 112 medium, 224 hard. Dua varian hard menggunakan kasus konsep yang sama untuk analisis dan evaluasi. Soal disusun untuk latihan ini, bukan past paper resmi.

Soal latihan baru memakai kalimat yang lebih langsung dan label konsep dengan padanan Inggris, seperti pengondisian klasik (classical conditioning) dan memori kerja (working memory). Revisi bahasa mencakup petunjuk, definisi, 112 kesimpulan, 336 pilihan pengecoh, serta 22 contoh yang memerlukan perumusan ulang. Materi, ID, dan makna kunci tetap sama. Sesi aktif, riwayat, serta pengulangan jawaban salah mempertahankan snapshot bahasa saat sesi dibuat.

UTS dan UAS masing-masing memiliki 112 varian hard. Pilihan 200 hard tersedia pada Mix atau UAS kumulatif. Tidak ada pengulangan ID dalam satu sesi, tetapi konsep dan kasus bisa muncul dalam bentuk pertanyaan berbeda. Kesulitan menggambarkan tuntutan tugas, belum dikalibrasi dengan data respons peserta.

RPS menuliskan UAS pertemuan 9–15 pada tabel, sementara uraian penilaian menyebut seluruh materi. Checkbox UAS kumulatif membuat perbedaan ini terlihat. Bacaan web mendukung latihan konsep; tugas lapangan, presentasi, ulasan artikel, dan uraian tetap perlu dilatih tersendiri.

Progres memakai localStorage browser: sesi aktif, 20 hasil terakhir, tanda bacaan, dan penilaian diri kartu. Tidak ada sinkronisasi antarperangkat. Waktu aktif adalah perkiraan dari interval halaman yang terlihat.

Latihan PPP, Ruang belajar, dan Flip card masing-masing mempunyai pilihan mata kuliah, pencarian, serta tombol Ganti mata kuliah. Saat ini Psikologi Pendidikan tersedia. Daftar pilihan membaca data `courses`; mata kuliah tanpa materi tidak ditampilkan. Tautan materi prioritas dari hasil tetap langsung membuka bacaan yang sesuai.

Halaman evaluasi memutar lagu yang diberikan pengguna dari detik 6 sebagai musik latar. Musik masuk selama 2,8 detik dan memudar selama 1,6 detik ketika keluar atau halaman disembunyikan. Volume awal 20%, dibatasi 35%. Web Audio memakai kompresor untuk meredam puncak sinyal; ini bukan normalisasi loudness seluruh lagu. Panel pemutar, status musik, dan slider dihapus sesuai permintaan pengguna. Preferensi musik lama tetap dihormati bila ada. Bila autoplay ditolak, musik tetap diam. Membuka pembahasan tidak mengulang lagu. Lagu tidak diulang otomatis setelah selesai.

## Menjalankan lokal

Gunakan Node.js yang mendukung ES modules dan `node:test`.

```sh
npm run dev
npm run check
npm test
```

Server lokal: `http://127.0.0.1:4173`; variabel lingkungan `PORT` bisa dipakai untuk preview terpisah. Server mendukung byte range MP3 agar seek ke detik 6 bekerja. Jangan membuka `index.html` langsung karena modul JavaScript memerlukan HTTP. Publikasi memakai project Sites yang tercatat di `.openai/hosting.json`.

## Mengembangkan

Baca `AGENTS.md` dan [panduan konten](docs/CONTENT_GUIDE.md) untuk mengubah soal atau menambahkan mata kuliah. [Pemeriksaan awal](docs/QA.md) mencatat alur, hasil, dan keterbatasan yang telah diperiksa. Semua sumber materi bisa dibuka pada halaman Sumber & cakupan web.

Ilustrasi merupakan fan art yang dibuat untuk tema yang diminta pengguna. Google Fonts bersifat tambahan; fallback sistem tetap tersedia. Isi materi, gambar, CSS, dan JavaScript disajikan dari `dist/`.
