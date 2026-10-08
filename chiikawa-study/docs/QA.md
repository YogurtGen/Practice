# Pemeriksaan versi awal

Tanggal: 8 Oktober 2026. Versi konten: `2026-10-08.1`. Preview lokal diuji lewat Codex in-app browser. Data sesi yang dibuat agen untuk pengujian telah dibersihkan melalui tombol aplikasi; browser awal tidak memiliki progres pengguna.

## Hasil yang diverifikasi

| Pemeriksaan | Bukti |
| --- | --- |
| Struktur konten | `scripts/check-content.mjs` berhasil: 14 topik, 112 konsep, 448 varian, 224 hard, 27 sumber, ID dan opsi unik. |
| Mesin latihan | Lima tes `node:test` lulus: 200 hard mencakup semua topik, batas ujian/kumulatif, streak dan kunci jawaban, evaluasi parsial, antrean ulang salah. |
| Pengerjaan lewat UI | Memulai Mix hard 200, mengirim 10 jawaban benar, melihat Horay 10, reload dan melanjutkan, lalu mengirim satu jawaban salah. Jawaban terkirim terkunci dan streak menjadi 0. |
| Evaluasi parsial | 10/11 benar menghasilkan 91%; 189 soal belum dijawab tetap terpisah. Topik memori 1/2 menghasilkan 50%; topik tanpa respons bertanda belum ada jawaban. |
| Pembahasan | Filter salah berisi tepat satu soal, tidak memasukkan 189 soal kosong. Tampilkan semua membuka seluruh 200 varian. |
| Belajar setelah latihan | Materi prioritas membuka memori, tanda baca tersimpan, tautan konsep dan sumber tersedia. |
| Ulang salah | Sesi ulang memuat satu jawaban salah saja. Setelah dijawab benar, hasil 100%. Riwayat sesi awal tetap menampilkan 91%. |
| Hasil kosong | Mengakhiri sesi 10 tanpa jawaban menampilkan belum ada skor, 10 belum dijawab, dan 0 konsep disentuh. |
| Pengaturan ujian | UTS/UAS hard menyediakan 112; radio 200 disabled. Mix dan UAS kumulatif menyediakan 224 serta mengaktifkan 200. Radio keyboard ArrowLeft memindah hard ke medium dan mempertahankan fokus. |
| Peta soal | Menandai, melepas tanda, melewati, memilih nomor, dan kembali ke soal sebelumnya bekerja. |
| Dialog | Konfirmasi akhir dapat dibatalkan dengan Escape. Dialog hapus dapat dibatalkan; konfirmasi hapus berhasil mereset data QA milik agen. |
| Katalog | Pencarian tidak ditemukan menampilkan pesan dan tombol pulihkan. Pencarian Piaget di ruang belajar menyisakan topik kognitif. Filter UAS pada pencarian tersebut menampilkan kosong dengan tindakan hapus pencarian. |
| Bacaan | Seluruh 14 tombol topik dibuka dan judul artikelnya cocok. Latih topik membuka pengaturan khusus topik; kembali ke semua topik dan resume bekerja. |
| Flip card | Flip lewat klik dan Space, nilai ingat/belum, filter ujian/topik/belum ingat, putaran selesai, acak ulang, dan ulang satu kartu yang belum ingat bekerja. Semua kartu sudah ingat menghasilkan pesan kosong dan tombol tampilkan semua. |
| Sumber | 14 baris cakupan dan 27 referensi ditampilkan. Link cakupan membuka bacaan yang sesuai. URL sumber ditinjau saat riset; metadata dan penjelasan tidak mengklaim akses penuh buku RPS. |
| Penyimpanan | Reload mempertahankan soal aktif, 10 jawaban terkirim, best streak, riwayat, serta tanda baca/kartu. |
| WebMCP | Catalog mengembalikan 14/112/448; open_study_topic ekologis membuka judul artikel yang benar. ID tak dikenal ditolak. Fitur browser yang tidak mendukung modelContext tetap menjalankan UI biasa. |
| Console | Pembacaan log browser untuk error/warn setelah alur utama menghasilkan array kosong. |
| Layout | Desktop 1280, tablet 768, HP 390/320, dan reflow 640 diperiksa. scrollWidth dokumen tidak melebihi innerWidth. Hasil, soal, bacaan, sumber, kartu, dan pengaturan tidak menimbulkan overflow halaman. |
| Target sentuh | Tombol utama/select pada HP minimal 44 px. Peta soal pada 320 px diperbaiki dari lebar 34 px menjadi 51 px; tingginya 44 px. |
| Gerak | CSS reduced-motion mematikan animasi/transisi. Selebrasi bisa ditutup, fokusnya terkurung pada tombol lanjut dan kembali ke soal. |
| State | Loading awal/noscript ada di HTML; empty state diuji; error render dan kegagalan penyimpanan memiliki pesan dan pemulihan dalam kode. Error storage tidak dipaksakan pada browser pengguna. |

Reflow 640 px mewakili ruang CSS desktop 1280 px pada zoom 200%. Zoom browser fisik dan keyboard layar perangkat nyata belum diuji. Bukti desktop dan HP tersimpan di `docs/qa/`; ini pemeriksaan browser, bukan sertifikasi aksesibilitas atau validasi psikometrik.

## Kontras

Perhitungan memakai luminansi sRGB WCAG. Checker skill juga dijalankan untuk pasangan utama. Angka di bawah adalah rasio kontras final.

| Pasangan | Rasio | Hasil |
| --- | ---: | --- |
| Tinta pada kertas | 10.60 | PASS |
| Teks sekunder pada putih | 5.70 | PASS |
| Teks sekunder pada biru | 5.07 | PASS |
| Teks sekunder pada kuning | 4.70 | PASS |
| Putih pada tombol biru | 7.10 | PASS |
| Merah muda gelap pada tint | 5.45 | PASS |
| Kuning gelap pada tint | 6.09 | PASS |
| Teks jawaban tepat pada putih | 7.52 | PASS |
| Teks koreksi pada putih | 6.71 | PASS |
| Batas kontrol pada kertas/putih | 3.42 / 3.60 | PASS non-text |
| Fokus biru pada tint biru/kuning | 6.31 / 5.86 | PASS non-text |

Teks nonaktif mendapat pengecualian state disabled. Garis panel abu-abu muda bersifat pemisah dekoratif; batas input/opsi/peta/topik memakai control atau warna pilihan yang memenuhi 3:1. Status benar/salah, belum dijawab, dan ditandai juga memiliki label teks.

## Delivery Gate antislop

Mode during dipilih pengguna. Arah pengguna Chiikawa dan tujuan belajar menjadi brief sebelum implementasi; alasan visual dan dials dicatat di `DESIGN.md`. Semua hasil berikut merujuk pemeriksaan dan file di atas.

### Hard Gate

- R-02 PASS: pencarian source dan copy aplikasi tidak menemukan em dash.
- R-03 PASS: ukuran 320/390/640/768/1280 tidak melampaui viewport; peta soal kecil diperbaiki.
- R-17 PASS: jumlah topik/kartu/varian berasal dari data; statistik dari jawaban sesi tersimpan.
- R-18 PASS: tidak ada testimonial atau profil pengguna rekaan.
- R-23 PASS: tema Chiikawa, ilustrasi pendamping, navigasi mode, dan evaluasi berasal dari permintaan pengguna; gambar berlabel ilustrasi penggemar.
- R-24 PASS: lima tujuan navigasi, sumber, dan link cakupan memiliki tampilan nyata yang dibuka lewat UI.
- R-25 PASS: pasangan teks dan kontrol final memenuhi rasio dalam tabel kontras.
- R-26 PASS: submit, filter, peta, pembahasan, retry, bacaan, kartu, dan riwayat memiliki handler nyata serta respons yang diperiksa.
- R-27 PASS: loading/noscript/error terlihat dalam source; empty katalog, kartu, riwayat, dan skor diuji lewat UI.
- R-28 PASS: tidak ada FAQ template yang tidak terkait.
- R-32 PASS: radio ArrowLeft, flip Space, dialog Escape, dan focus-visible diperiksa; filter mempertahankan fokus setelah render.
- R-33 PASS: perubahan kode/CSS ditulis langsung melalui patch source, tanpa skrip penambal source.
- R-34 PASS: tema terang tetap sesuai identitas kertas; tidak ada toggle dengan mode rusak.
- R-35 PASS: aplikasi dijalankan, tes lulus, dan seluruh jenis kontrol utama termasuk reset diuji pada preview dengan data QA sendiri.
- R-36 PASS: tidak ada klaim uptime, keamanan, kepatuhan, atau peningkatan hasil belajar yang direkayasa.
- R-37 PASS: arah Chiikawa datang dari brief pengguna; interpretasi ruang belajar, dials, dan alasan keputusan tercatat di DESIGN.md.
- R-38 PASS: referensi/kurikulum nyata; soal kasus asli diberi label latihan; mata kuliah tambahan disebut belum tersedia.

### Purpose Gate

- R-01 PASS: tint biru/pink berasal dari karakter dan hierarki; tidak ada gradien atau glow default.
- R-04 PASS: buku/pena/kartu/grafik/search menunjuk isi dan tindakan; relevansi tercatat di DESIGN.md.
- R-06 PASS: Nunito mendukung judul komik dan DM Sans mendukung bacaan; bukan estetika terminal.
- R-07 PASS: latar kertas polos memberi ruang membaca; tidak ada pola dekoratif tanpa tujuan.
- R-08 PASS: panah tunggal pada mulai sesi menandai perpindahan ke pengerjaan.
- R-09 PASS: tag menandai cakupan ujian dan data RPS yang benar; tidak ada badge pemasaran.
- R-10 PASS: tidak ada blur/glass yang menumpuk.
- R-12 PASS: bayangan tipis hanya memberi bentuk pada flip card; panel lain memakai garis.
- R-13 PASS: tidak ada glow berulang.
- R-14 PASS: katalog, bacaan, latihan, dan evaluasi memakai komposisi sesuai isi; bukan grid fitur seragam.
- R-19 PASS: transisi singkat dan Horay mengarahkan respons; reduced-motion mematikannya.
- R-22 PASS: ilustrasi Chiikawa terkait langsung dengan tema yang diminta dan ruang belajar.

### Liveliness

- Dials PASS: ENERGY 2 / RHYTHM 2 / MOTION 2 tertulis dalam DESIGN.md.
- Konsistensi PASS: ilustrasi ramah, variasi panel/bacaan/soal, dan gerak sesaat sesuai dials.
- Titik fokus PASS: mulai latihan di beranda, pilihan di setup, soal di sesi, skor di evaluasi, artikel di bacaan, kartu di flash.
- Whitespace PASS: jarak memisahkan judul, keputusan, opsi, dan pembahasan; reflow HP menjaga hierarki.
- Aksen PASS: kuning terbatas pada petunjuk dan streak.
- Motif PASS: tiga teman belajar, judul membulat, dan bahasa yang menerima kesalahan mengulang identitas Chiikawa.
- Design Read PASS: brief pengguna menentukan ruang belajar psikologi bertema Chiikawa; pembacaan refinemen dan dials dijelaskan serta direkam.

### Craftsmanship dan Quality Locks

- C-1 PASS: alasan warna, font, bentuk, jarak, ikon, dan ilustrasi tercatat satu baris per keputusan.
- C-2 PASS: kontrol memberi hasil yang nyata sesuai tabel click-through.
- C-3 PASS: katalog, pengaturan, hasil, bacaan, kartu, dan sumber melayani alur belajar yang diminta.
- C-4 PASS: reflow, sesi parsial/kosong, resume, keyboard, dan error recovery mempunyai perilaku yang ditinjau.
- C-5 PASS: angka berasal dari bank/jawaban; tidak ada testimonial atau statistik pasar.
- R-05 PASS: komposisi dashboard belajar, artikel, kuis, dan evaluasi mengikuti tugas masing-masing.
- R-11 PASS: radius tag, tombol, panel, dan kartu bervariasi sesuai fungsi.
- R-15 PASS: CTA menyebut tindakan seperti mulai soal, pelajari materi, balik kartu, dan ulang jawaban salah.
- R-16 PASS: pencarian source tidak menemukan buzzword pemasaran AI.
- R-20 PASS: ilustrasi dan suara pendamping belajar mempertahankan identitas khusus.
- R-21 PASS: terang dipilih untuk identitas buku komik dan bacaan; keputusan tetap terang tercatat.
- R-29 PASS: biru dan pink inti, kuning aksen, serta netral; success/danger hanya status jawaban.
- R-30 PASS: tidak meniru identitas Linear, Vercel, Stripe, atau Notion.
- R-31 PASS: seluruh keputusan besar memiliki alasan dalam DESIGN.md.

## Batas akademik versi ini

Semua butir topik RPS dipetakan, tetapi bank belum melewati review dosen atau kalibrasi respons peserta. Hard menunjukkan analisis/evaluasi yang diminta soal. Dua varian hard bisa memakai kasus yang sama. Ambang prioritas belajar dan penilaian diri flip card bukan ukuran kemampuan yang tervalidasi. Bacaan tugas lapangan, presentasi, uraian, serta pencarian artikel mutakhir tetap memerlukan latihan di luar pilihan ganda.

## Pembaruan pilihan mata kuliah dan musik evaluasi

Tanggal: 8 Oktober 2026. Versi konten tetap `2026-10-08.1`: ID, kunci, dan isi akademik tidak berubah. Pengujian tambahan memakai origin `127.0.0.1:4174` dengan sesi agen sendiri. Sesi pengguna pada `4173` tidak dibuka, dihapus, atau diubah.

| Pemeriksaan | Bukti tambahan |
| --- | --- |
| Tes otomatis | 16 tes lulus: enam mesin latihan dan sepuluh musik. Termasuk course tak dikenal, seek gagal tetap diam, autoplay ditolak, keluar saat play masih pending, pembalikan fade, pindah sesi, volume maksimum, timer browser, dan Web Audio tidak tersedia. |
| Pilihan tiap mode | Navigasi PPP, Ruang belajar, dan Flip card membuka picker. Pilih Pendidikan membuka pengaturan, 14 topik bacaan, atau 112 kartu. Tombol Ganti mata kuliah kembali ke picker pada ketiga mode. |
| Pencarian | Query `klinis` menampilkan kosong; Hapus pencarian mengembalikan Pendidikan. Course tambahan belum ditampilkan sebagai tersedia. |
| Konteks hasil | Materi prioritas hasil QA membuka Teori belajar kognitif langsung dengan mata kuliah Pendidikan. |
| Sesi aktif | Sesi baru sepuluh soal ditinggalkan ke picker PPP; banner Lanjutkan sesi itu mengembalikan soal pertama dan opsi yang sama. |
| Audio masuk | Hasil QA membuka audio dengan currentTime 6,01161, readyState 4. Seekable mencakup 0–219,253 detik. Gain tetap nol sampai seek dikonfirmasi dalam modul. |
| Audio keluar | Keluar hasil menunjukkan paused=false selama fade; pembacaan berikutnya paused=true dengan waktu berhenti 121,771791. Saat sesi soal dibuka audio tetap paused=true. |
| Kontrol audio | Jeda memudar kemudian paused=true; Putar lewat Enter melanjutkan posisi 15,64 detik. Tampilkan semua pembahasan melanjutkan posisi, tidak seek ulang ke 6. Slider End=35%, Home=0%, ArrowRight=1%, lalu dikembalikan ke 20%. Preferensi jeda bertahan setelah reload. |
| HTTP media | HEAD MP3: 200, audio/mpeg, Content-Length 3551778, Accept-Ranges bytes. GET bytes=100-199: 206, Content-Range bytes 100-199/3551778, panjang 100. |
| Reflow | Picker dan kontrol evaluasi pada 320/390/768/1280 px tidak melampaui viewport. Tombol, search, dan range baru tinggi minimal 44 px; range pada 320 px masih lebar 112 px. |
| Keyboard | Pilih Pendidikan lewat Enter; kartu dibalik Space; kontrol Putar lewat Enter; slider volume memakai Home/End/ArrowRight. |
| Console | Log error/warn setelah perbaikan timer dan byte range kosong. Error Illegal invocation yang ditemukan saat QA telah diperbaiki dan mendapat tes regresi. |
| Bukti visual | `qa/course-picker-desktop.jpg`, `qa/course-picker-mobile.jpg`, dan `qa/evaluation-music.jpg` menyimpan hasil render yang diperiksa. |

Pemeriksaan audio memastikan waktu, state pemutaran, konfigurasi kompresor/gain, dan ramp melalui browser serta tes. Loudness akustik keluaran speaker tidak diukur. Gain awal 20%, maksimum 35%, fade masuk 2,8 detik, fade keluar 1,6 detik. Berkas pengguna disalin tanpa mengubah rekamannya.

### Delivery Gate pembaruan

Gate lengkap di atas ditinjau ulang terhadap perubahan ini. Bukti untuk bagian yang tetap memakai laporan awal; bukti tambahan berikut mencakup picker dan audio.

- R-02 PASS: pencarian source/copy baru tidak menemukan em dash.
- R-03 PASS: picker dan kontrol musik tidak overflow pada 320/390/768/1280 px; target baru minimal 44 px.
- R-17 PASS: jumlah pilihan/topik/kartu/soal dihitung dari courses, topics, concepts, dan bank; skor tetap dari sesi.
- R-18 PASS: tidak ada testimonial atau profil rekaan pada perubahan.
- R-23 PASS: pengguna meminta bagian pilihan mata kuliah dan lagu evaluasi; tidak ada aset tambahan tanpa brief.
- R-24 PASS: tiga mode dibuka lewat navigasi dan menghasilkan picker serta halaman materi nyata.
- R-25 PASS: komponen baru memakai ink/muted pada paper/putih dan kontrol biru yang telah dihitung pada tabel kontras.
- R-26 PASS: pencarian, hapus pencarian, pilih, ganti, resume, Putar/Jeda, dan slider menghasilkan respons yang diuji.
- R-27 PASS: picker mempunyai empty state; musik mempunyai loading, paused, blocked, ended, dan error, dengan kegagalan diuji otomatis.
- R-28 PASS: perubahan tidak menambah FAQ template.
- R-32 PASS: Enter pada pilihan dan musik, Space kartu, keyboard range bekerja; kontrol memakai focus-visible aplikasi.
- R-33 PASS: seluruh perubahan source/CSS ditulis langsung dengan patch, tanpa skrip penambal.
- R-34 PASS: tema terang tetap, tidak menambah toggle tema.
- R-35 PASS: preview dijalankan, 16 tes lulus, kontrol baru diuji dan bukti disimpan; timer dan seek yang gagal diperbaiki sebelum rilis.
- R-36 PASS: tidak ada klaim keamanan, performa, atau efektivitas baru.
- R-37 PASS: arah pilihan mata kuliah dan musik berasal dari permintaan pengguna, dicatat di DESIGN.md.
- R-38 PASS: hanya Pendidikan yang tersedia; klinis/perkembangan tetap contoh, tanpa materi atau fitur fiktif.
- R-01 PASS: permukaan tetap kertas/putih; tidak ada gradien/glow baru.
- R-04 PASS: ikon buku dan search menandai mata kuliah dan pencarian.
- R-06 PASS: tipografi memakai pasangan judul/bacaan yang alasannya tercatat dalam DESIGN.md.
- R-07 PASS: picker memakai latar kertas polos yang sama, tanpa pola baru.
- R-08 PASS: tombol pilihan/ganti tidak menambah panah dekoratif.
- R-09 PASS: angka jumlah materi adalah metadata nyata, tanpa badge pemasaran.
- R-10 PASS: tidak menambah glassmorphism.
- R-12 PASS: picker serta musik memakai garis pemisah, tanpa bayangan besar.
- R-13 PASS: tidak menambah glow.
- R-14 PASS: kartu course mempunyai struktur serupa karena mewakili pilihan setara; tujuan tercatat, materi tetap artikel/kartu/soal sesuai mode.
- R-19 PASS: gerak visual mengikuti CSS reduced-motion yang sudah ada; ramp audio hanya meratakan perpindahan volume yang diminta.
- R-22 PASS: lagu pengguna mendampingi evaluasi, dengan kontrol langsung dan tujuan tertulis.
- Dials PASS: ENERGY 2 / RHYTHM 2 / MOTION 2 tetap tercatat di DESIGN.md.
- Konsistensi PASS: picker memakai komponen belajar yang sama; audio pelan mendukung arah tenang.
- Titik fokus PASS: judul mode dan pilihan course terlihat dahulu; skor mendahului kontrol musik dan evaluasi materi.
- Whitespace PASS: picker satu kartu dibatasi 620 px dan grid menyesuaikan ruang; musik reflow pada HP.
- Aksen PASS: komponen baru tidak memperluas penggunaan aksen kuning/pink.
- Motif PASS: judul membulat, kertas terang, dan bahasa pilihan mempertahankan identitas belajar yang ada.
- Design Read PASS: perubahan melayani pilihan bidang belajar dan pendamping evaluasi yang diminta pengguna.
- C-1 PASS: alasan picker, konteks course, dan musik tercatat satu baris per keputusan dalam DESIGN.md.
- C-2 PASS: kontrol baru mempunyai hasil UI/media nyata sesuai tabel tambahan.
- C-3 PASS: pilihan berada sebelum setiap mode; tautan prioritas tetap langsung membuka materi.
- C-4 PASS: reflow, kosong, resume, keyboard, kegagalan seek/autoplay, dan keluar selama loading diperiksa.
- C-5 PASS: jumlah materi tetap dari data dan tidak ada course kosong yang diklaim tersedia.
- R-05 PASS: picker memilih bidang; setup, bacaan, kartu, dan evaluasi mempertahankan komposisi sesuai tugas.
- R-11 PASS: bentuk komponen mengikuti radius kontrol/panel yang sudah ada.
- R-15 PASS: CTA menyebut Pilih, Ganti, Lanjutkan, Putar, dan Jeda sesuai tindakan.
- R-16 PASS: copy baru menjelaskan tindakan tanpa jargon pemasaran AI.
- R-20 PASS: musik pengguna dan komponen belajar mempertahankan identitas tema yang diminta.
- R-21 PASS: tema terang untuk buku/bacaan tetap sesuai keputusan desain.
- R-29 PASS: komponen baru memakai palette yang sama, tanpa warna inti tambahan.
- R-30 PASS: perubahan mengikuti web belajar Chiikawa yang ada, tanpa meniru produk lain.
- R-31 PASS: keputusan picker dan kontrol audio mempunyai alasan tertulis dalam DESIGN.md.

## Penghapusan panel musik evaluasi

Tanggal: 8 Oktober 2026. Pengguna memilih panel Musik evaluasi dan meminta bagian itu dihapus. Panel, status, tombol Putar/Jeda, slider, handler, dan CSS terkait dihapus dari aplikasi. Musik latar serta mesin fade dipertahankan. Bukti kontrol pemutar di bagian sebelumnya adalah catatan versi lama.

- Pemeriksaan source dan struktur konten berhasil; 16 tes yang diwajibkan proyek lulus.
- Preview `127.0.0.1:4174` memakai data QA agen. Sesi pengguna tidak diubah.
- DOM hasil memuat banner skor langsung diikuti result-layout. Jumlah `.music-bar`, `#music-toggle`, dan `#music-volume` adalah nol.
- Audio lokal mulai pada currentTime 6, kemudian mencapai 17,58 detik dengan readyState 4; membuka pembahasan tidak mengulang audio.
- Setelah membuka bacaan audio berhenti pada 19,92 detik dengan paused=true; log error/warn browser kosong.
- Tampilkan semua/Hanya yang salah bekerja. Buka materi prioritas lewat Enter membuka bacaan Teori belajar kognitif.
- Layar 320 dan 390 px tidak overflow. Bukti desktop dan HP: `qa/evaluation-without-music-panel.png` dan `qa/evaluation-without-music-panel-mobile.png`.
- Autoplay yang ditolak tetap diam tanpa memunculkan panel atau pesan. Preferensi musik lama tetap dihormati.

### Delivery Gate perubahan

Gate lengkap pada laporan sebelumnya ditinjau ulang. Arah visual, palette, materi, angka, navigasi, dan dials tetap sama; alasan penghapusan dicatat dalam DESIGN.md.

- R-03 PASS: hasil pada 320/390 px tidak melampaui viewport setelah panel dihapus.
- R-23 PASS: penghapusan panel berasal dari komentar langsung pengguna pada elemen Musik evaluasi.
- R-24 PASS: halaman hasil dan tujuan materi prioritas tetap dapat dibuka lewat UI.
- R-25 PASS: tidak ada warna/pasangan teks baru; hasil memakai palette terukur dalam tabel kontras.
- R-26 PASS: handler pemutar yang tidak lagi memiliki kontrol dihapus; pembahasan dan materi prioritas tetap bekerja.
- R-27 PASS: musik opsional yang gagal tetap diam sesuai permintaan tanpa panel; state data hasil tetap ditampilkan.
- R-32 PASS: tombol materi prioritas tetap dioperasikan dengan Enter; kontrol pemutar tidak meninggalkan fokus tersembunyi.
- R-33 PASS: perubahan aplikasi dan CSS ditulis langsung melalui patch source.
- R-35 PASS: aplikasi dijalankan pada preview terpisah, 16 tes lulus, DOM dan hasil desktop/HP diperiksa.
- R-37 PASS: DESIGN.md merekam pilihan pengguna untuk musik latar tanpa panel.
- R-31 PASS: alasan penghapusan adalah skor langsung diikuti analisis materi; fungsi audio tidak mengambil ruang baca.
- C-2 PASS: pembahasan dan tindakan belajar diuji setelah penghapusan.
- C-3 PASS: halaman hasil kembali memusatkan perhatian pada evaluasi dan materi yang perlu diulang.
- C-4 PASS: reflow HP, keyboard, state hasil, dan fade tetap mempunyai pemeriksaan yang tercatat.

## Penyederhanaan bahasa pilihan ganda

Tanggal: 9 Oktober 2026. Pengguna meminta bahasa soal yang lebih mudah dipahami dan padanan Inggris untuk istilah penting. `quizLanguageVersion` menjadi `2026-10-09.plain-1`; versi akademik tetap `2026-10-08.1`.

| Pemeriksaan | Bukti |
| --- | --- |
| Cakupan | 112 baris bahasa mencakup seluruh ID konsep; masing-masing berisi label, definisi, kesimpulan benar, dan tiga pengecoh. Ada 100 label dengan padanan Inggris serta 22 perumusan ulang contoh kasus. Bank tetap 448 varian, termasuk 224 hard. |
| Peninjauan makna | Perumusan dibandingkan dengan data konsep asli. Penguatan negatif tetap meningkatkan perilaku, hukuman negatif menurunkannya; UCS/UCR dan CS/CR dibedakan; self-regulated learning dijelaskan sebagai pengaturan diri dalam belajar. `content.js` serta pemetaan RPS/sumber tidak diubah. |
| Istilah | Padanan diperiksa melalui sumber konsep, termasuk OpenStax untuk conditioning, memori, Piaget, dan inteligensi; rujukan tercatat di CONTENT_GUIDE.md. |
| Struktur dan tes | Pemeriksaan konten berhasil: 14 topik, 112 konsep, 448 varian, 27 sumber. Seluruh 17 tes lulus: tujuh mesin latihan dan sepuluh musik. Validasi baru memeriksa cakupan bahasa, enam kolom, ID contoh, dan ID pertanyaan khusus. |
| Snapshot lama | Tes regresi mengirim jawaban dengan label lama, mendapat skor 100%, dan memastikan pertanyaan tersimpan tidak diubah. Jawaban berlabel baru ditolak untuk snapshot lama. Sesi aktif, riwayat, dan ulang salah tidak dimigrasi atau dihapus. |
| QA terpisah | Browser memakai origin `127.0.0.1:4175` dan data QA sendiri. Sesi pengguna pada `4173` dan website terbit tidak diubah selama QA. |
| Penerapan | Sepuluh pertanyaan behavioristik dibaca melalui peta soal. Kasus lembar ujian sekarang meminta proses belajar yang memicu kecemasan; pilihan memuat pengondisian klasik (classical conditioning) serta tiga istilah pembanding. |
| Analisis | Sepuluh pertanyaan hard memori diperiksa melalui UI, termasuk mengenali versus mengingat, phonological loop, beban informasi, dan latihan retrieval. Kalimat memakai pelaku/tindakan/akibat yang langsung. |
| Skor dan pembahasan | Jawaban klasik yang benar menghasilkan 100% dari satu jawaban terkirim. Sesi hard dengan satu benar dan satu salah menghasilkan 50%, delapan belum dijawab, dan satu prioritas ulang. Pembahasan berbahasa baru dan tautan sumber muncul. |
| Ulang salah | Enter pada Ulangi 1 jawaban salah membuka satu soal yang salah dengan pertanyaan, pilihan, serta kunci snapshot yang sama; urutan opsi diacak. |
| Keyboard | Pilihan pada frame HP dipilih lewat Space, dengan fokus terlihat; Kirim jawaban serta Ulangi dijalankan lewat Enter. |
| Reflow | Lebar aktual tab utama 870 px. Override viewport pada tab lama tidak diterapkan oleh browser; pengujian HP memakai iframe lokal berlebar 320/390 px. Lebar dokumen di dalamnya sama dengan clientWidth 305/375 px setelah scrollbar, tanpa luapan horizontal. Pilihan panjang membungkus; tinggi keempat target pilihan pada 390 px adalah 61–87 px. File iframe QA dihapus sebelum publikasi. |
| Console | Log error/warn aplikasi pada tab QA kosong. |
| Bukti visual | `qa/plain-quiz-desktop.png`, `qa/plain-quiz-mobile-320.png`, dan `qa/plain-quiz-mobile.png`. Gambar HP terakhir memperlihatkan pilihan, fokus keyboard, dan tombol kirim. |

Perubahan ini menyederhanakan perumusan dan menjaga makna konsep; pemeriksaan struktur bukan validasi psikometrik. Sesi baru memakai bahasa baru. Snapshot sesi yang telah dimulai atau selesai mempertahankan bahasa saat sesi dibuat.

### Delivery Gate perubahan bahasa

Gate lengkap ditinjau terhadap revisi ini. Bukti desain yang tidak berubah memakai pemeriksaan terdahulu; bukti baru ada pada tabel di atas. Antislop diterapkan untuk membantu kejelasan, mengikuti permintaan pengguna agar kalimat sederhana.

- R-01 PASS: tidak menambah gradien; permukaan kertas tetap.
- R-02 PASS: modul bahasa baru tidak memakai em dash.
- R-03 PASS: opsi panjang reflow pada 320/390 px dengan target sentuh di atas 44 px.
- R-04 PASS: ikon navigasi tidak berubah dan tetap menandai fungsi belajar.
- R-05 PASS: struktur pengerjaan, peta soal, dan evaluasi tetap sesuai tugas belajar.
- R-06 PASS: pasangan font dan alasan tipografi dalam DESIGN.md tidak berubah.
- R-07 PASS: tidak menambah pola latar.
- R-08 PASS: tidak menambah panah dekoratif.
- R-09 PASS: tidak menambah badge pemasaran.
- R-10 PASS: tidak menambah glassmorphism.
- R-11 PASS: radius kontrol dan panel tetap menurut fungsi.
- R-12 PASS: tidak menambah bayangan.
- R-13 PASS: tidak menambah glow.
- R-14 PASS: pilihan setara memakai struktur yang sama; bacaan dan hasil tetap komposisi berbeda.
- R-15 PASS: tindakan Kirim jawaban dan Ulangi tetap menyebut hasil tindakan.
- R-16 PASS: kalimat akademik abstrak diganti penjelasan langsung; istilah penting tetap diberi arti.
- R-17 PASS: jumlah 14/112/448 berasal dari data; skor QA berasal dari jawaban terkirim.
- R-18 PASS: tidak menambah testimonial atau identitas rekaan.
- R-19 PASS: tidak menambah gerak; reduced-motion tetap dari pemeriksaan sebelumnya.
- R-20 PASS: motif teman belajar dan tema penggemar yang diminta pengguna tetap.
- R-21 PASS: tema terang yang telah dipilih tetap.
- R-22 PASS: tidak menambah ilustrasi atau musik baru.
- R-23 PASS: revisi kalimat dan padanan Inggris berasal dari permintaan pengguna.
- R-24 PASS: soal, peta, hasil, pembahasan, dan ulang salah dibuka melalui UI.
- R-25 PASS: warna serta pasangan kontras terukur sebelumnya tidak diubah.
- R-26 PASS: pilihan, kirim, akhir sesi, pembahasan, dan ulang menghasilkan respons nyata.
- R-27 PASS: jawaban terkirim/belum/salah serta hasil sampel kecil tampil pada QA.
- R-28 PASS: tidak menambah FAQ template.
- R-29 PASS: palette tidak diperluas.
- R-30 PASS: tidak mengganti desain dengan pola produk lain.
- R-31 PASS: alasan bahasa sederhana serta padanan istilah dicatat dalam DESIGN.md.
- R-32 PASS: Space dan Enter bekerja, dengan fokus pilihan terlihat pada bukti HP.
- R-33 PASS: source ditulis langsung melalui patch; tidak ada skrip penambal source.
- R-34 PASS: tidak menambah toggle tema.
- R-35 PASS: preview dijalankan, 17 tes lulus, hasil dan reflow diperiksa sebelum rilis.
- R-36 PASS: tidak menambah klaim efektivitas, keamanan, atau performa.
- R-37 PASS: permintaan bahasa dan keputusan penyederhanaan tercatat dalam DESIGN.md.
- R-38 PASS: seluruh 112 ID tetap dicakup, tanpa fitur/course atau materi fiktif.
- Dials PASS: ENERGY 2 / RHYTHM 2 / MOTION 2 tidak berubah.
- Konsistensi PASS: opsi memakai bahasa langsung yang sesuai bacaan ringkas dan arah tenang.
- Titik fokus PASS: pertanyaan dan empat pilihan tetap menjadi pusat pengerjaan.
- Whitespace PASS: ruang antar opsi tetap; teks panjang membungkus di HP.
- Aksen PASS: warna pilihan terpilih memakai aksen aplikasi yang sama.
- Motif PASS: tipografi, kertas, dan teman belajar mempertahankan identitas.
- Design Read PASS: keputusan bahasa mengikuti permintaan pengguna, dicatat sebelum rilis.
- C-1 PASS: padanan istilah membantu belajar istilah, bukan hiasan copy.
- C-2 PASS: seluruh tindakan pada alur yang berubah memberi hasil UI yang diuji.
- C-3 PASS: perubahan melayani pengerjaan dan pembahasan, tanpa section tambahan.
- C-4 PASS: reflow, keyboard, jawaban terkunci, dan kompatibilitas snapshot diperiksa.
- C-5 PASS: angka tetap dari data; tidak ada klaim penguasaan atau kesulitan tervalidasi.
