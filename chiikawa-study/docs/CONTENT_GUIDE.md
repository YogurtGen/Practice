# Memperbarui soal dan menambah mata kuliah

## Tentukan cakupan dari RPS

Periksa semua halaman RPS, termasuk tabel mingguan, indikator, tugas, dan uraian penilaian. Buat matriks topik, subtopik, pertemuan, ujian, halaman, sumber pendukung, konsep, serta bentuk latihan. Jangan menganggap judul bab sudah mencakup seluruh butir di bawahnya.

RPS awal dipetakan menjadi:

| Pertemuan | Topik data | Konsep |
| --- | --- | ---: |
| 1 | pengantar | 8 |
| 2 | behavioristik | 10 |
| 3 | kognitif | 10 |
| 4 | konstruktivistik | 8 |
| 5 | memori | 8 |
| 6 | humanistik | 6 |
| 7 | ekologis | 6 |
| 9 | inteligensi | 10 |
| 10 | domain | 8 |
| 11 | motivasi | 10 |
| 12 | kesulitan | 8 |
| 13 | desain | 8 |
| 14 | observasi | 6 |
| 15 | sintesis | 6 |

Minggu 8 dan 16 adalah ujian. Pemetaan butir serta halaman ada pada `topics[].coverage` dan `pages`, dan terlihat pada halaman sumber aplikasi. Cakupan UAS tabel halaman 11 dan uraian halaman 12 berbeda: simpan kedua informasi secara terbuka. Jangan menebak mana instruksi dosen yang berlaku. Kelengkapan yang bisa diaudit adalah seluruh butir RPS, bukan seluruh teori psikologi pendidikan yang pernah ada.

## Mencari sumber

1. Gunakan istilah RPS dan nama teori sebagai query. Cari sumber primer, buku ajar terbuka, penerbit akademik, universitas, atau lembaga pendidikan dengan rujukan yang jelas.
2. Buka halaman sebenarnya. Catat judul, penerbit/penulis, URL HTTPS, bagian yang mendukung konsep, tanggal akses, dan tahun bila tersedia. Hasil pencarian saja belum membuktikan isi.
3. Periksa klaim yang mudah salah: atribusi tokoh, urutan/tahap, istilah teknis, batas penerapan, dan status bukti. Bila temuan bertentangan, tunjukkan perbedaannya dalam bacaan.
4. Jangan menyalin paragraf atau soal berhak cipta. Tulis penjelasan dan kasus asli, lalu tautkan sumber. Jangan mengaku membaca buku referensi RPS jika full text tidak tersedia.
5. Gunakan OpenStax, OER SUNY, Open University, panduan universitas, publikasi primer, dan EEF sesuai bidangnya. Jangan mengganti pemeriksaan dengan blog tanpa rujukan atau ringkasan AI.
6. RPS meminta ulasan artikel internasional bereputasi dalam tiga tahun terakhir. Ini perlu pencarian terpisah dengan tanggal relatif terhadap waktu tugas. Buku ajar atau sumber lama tidak otomatis memenuhi syarat tugas tersebut.

Daftar sumber awal berjumlah 27. `sources` memuat metadata, `topics[].sources` menghubungkan topik, dan konsep/soal mewarisi sumber. Saat sumber berbeda per konsep, perinci pemetaan tersebut dan ubah pemanggilan sumber dengan konsisten. Jangan menempel sumber terkenal yang tidak mendukung klaim.

Contoh kehati-hatian yang sudah diterapkan: penguatan negatif berbeda dari hukuman; ZPD berbeda dari scaffolding; VAK dibahas sebagai konsep RPS dengan catatan keterbatasan bukti; tahap Piaget bukan diagnosis; taksonomi afektif dan psikomotorik diatribusi secara tepat; kesulitan belajar tidak didiagnosis dari satu soal.

## Skema konten saat ini

`dist/content.js` mengekspor `sources`, `topics`, `concepts`, `courses`, `syllabusNotes`, `deepNotes`, dan `contentVersion`.

Satu item dalam topik berbentuk:

```js
[
  'slug-stabil',
  'Nama konsep',
  'Penjelasan sederhana yang akurat.',
  'Kasus asli dengan informasi yang cukup.',
  'Kesimpulan benar yang didukung kasus.',
  'Distraktor masuk akal pertama.',
  'Distraktor masuk akal kedua.',
  'Distraktor masuk akal ketiga.'
]
```

ID konsep terbentuk dari ID topik dan slug. Topik minimal memiliki empat konsep agar pilihan easy/medium mendapat tiga konsep pembanding. `deepNotes` menambah pembahasan yang memerlukan konteks lebih panjang. Hindari HTML dalam teks materi: sebagian besar isi dirender melalui escape.

`dist/engine.js` membentuk empat varian per konsep:

- `recall`: mengenali konsep dari penjelasan.
- `apply`: mengidentifikasi konsep dari kasus.
- `analyze`: memilih kesimpulan kasus.
- `evaluate`: mengoreksi argumen yang salah pada kasus.

Dua varian hard bukan dua kasus independen. Jika diperlukan 200 kasus yang berbeda, tambahkan bank vignette eksplisit atau konsep yang valid; jangan hanya mengganti kata agar jumlah naik.

### Bahasa pilihan ganda

`dist/quiz-language.js` menyediakan perumusan soal yang lebih sederhana tanpa mengganti materi bacaan di `content.js`. `quizWording` memakai ID konsep sebagai key dan enam kolom: label konsep, definisi singkat, kesimpulan benar, serta tiga pengecoh. `quizScenarios` menyimpan contoh yang perlu dirumuskan ulang; contoh lain tetap berasal dari data akademik. `quizTasks` menyimpan pertanyaan khusus dengan ID varian soal, misalnya meminta proses belajar pada kasus pengondisian klasik agar tidak tertukar dengan jenis stimulusnya. Mesin soal memakai `quizConcept` sebelum membentuk empat varian.

Utamakan siapa melakukan apa dan akibatnya. Misalnya, ganti “tuntutan pemeliharaan dan pengolahan membebani kapasitas terbatas” menjadi “mengingat instruksi sambil menghitung membebani memori kerja (working memory)”. Jelaskan kata abstrak lewat kejadian pada kasus. Tetap gunakan istilah teknis yang perlu dipelajari, dengan padanan Inggris yang benar dalam kurung; jangan menerjemahkan seluruh kalimat atau menumpuk istilah pada setiap kata.

Periksa keempat pilihan bersama-sama. Penambahan istilah Inggris tidak boleh hanya menghias jawaban benar agar mudah ditebak dari panjangnya. Jaga alasan pengecoh tetap keliru, bukan menghapus kata pembatas lalu membuatnya menjadi jawaban kedua. “Penguatan negatif” tetap meningkatkan perilaku setelah stimulus tidak menyenangkan dihilangkan; “hukuman negatif” menurunkan perilaku setelah sesuatu diambil. Self-regulated learning adalah pengaturan diri dalam belajar, bukan sekadar belajar sendirian.

Untuk mata kuliah berikutnya, tambahkan baris sesuai ID konsep dan sesuaikan validasi cakupan. Bila belum ada baris, helper memakai data asli. Label Inggris diverifikasi melalui rujukan konsep yang bersangkutan, bukan terjemahan otomatis. Contoh rujukan revisi ini: [classical conditioning](https://openstax.org/books/psychology-2e/pages/6-2-classical-conditioning), [reinforcement dan punishment](https://openstax.org/books/psychology-2e/pages/6-3-operant-conditioning), [memory](https://openstax.org/books/psychology-2e/pages/8-1-how-memory-functions), [Piaget](https://openstax.org/books/psychology-2e/pages/9-2-lifespan-theories), [intelligence](https://openstax.org/books/psychology-2e/pages/7-4-what-are-intelligence-and-creativity), dan [motivasi](https://educationalpsychology.pressbooks.sunycreate.cloud/chapter/student-motivation/).

## Menulis soal yang berdampak

Pastikan satu jawaban terbaik dan tiga distraktor yang salah karena alasan berbeda. Distraktor sebaiknya sebanding panjangnya, relevan, serta tidak mudah ditebak hanya dari kata “selalu” atau “pasti”. Hard harus memerlukan analisis informasi atau perbandingan mekanisme, bukan sekadar istilah asing.

Pembahasan perlu menjelaskan mengapa jawaban tepat dan mengapa alternatif tampak menarik tetapi keliru. Skema awal memakai penjelasan konsep dan kesimpulan; tingkatkan pembahasan per opsi bila kualitas soal membutuhkan itu. Review manusia atau dosen berguna sebelum bank dipakai untuk penilaian formal. Jangan menyatakan kesulitan sudah tervalidasi secara empiris.

Satu sesi mengambil varian secara acak, dengan giliran antar topik agar topik kecil ikut terwakili. Jumlah dibatasi varian tersedia. Evaluasi memakai jawaban terkirim, menampilkan soal belum dijawab terpisah, dan memberi label sampel sedikit bila jawaban topik kurang dari lima. Ambang prioritas `<80%` adalah aturan belajar aplikasi, bukan cutoff psikometrik.

## Memperbarui materi lama

- Pertahankan ID bila makna tetap sama. Jika konsep berubah, buat ID baru.
- Naikkan `contentVersion` ketika kunci atau isi berubah. Aplikasi membuang sesi aktif dan tanda kartu lama ketika versi berbeda; riwayat selesai tetap membawa snapshot soal lama.
- Untuk perubahan bahasa yang tidak mengubah makna teori atau kunci, naikkan `quizLanguageVersion` saja. Sesi baru memakai bahasa baru; sesi aktif, riwayat, dan ulang salah mempertahankan snapshot. Jangan mengubah string opsi dalam jawaban yang sudah tersimpan.
- Jangan mengganti jawaban di riwayat pengguna secara diam-diam. Snapshot sesi menyimpan pertanyaan, kunci, pembahasan, dan jawaban pada saat pengerjaan.
- Jalankan validasi struktur dan tes mesin. Audit sumber serta isi dengan manusia; tes struktur tidak membuktikan teori benar.

## Menambahkan psikologi klinis atau mata kuliah lain

Saat ini materi yang tersedia hanya Psikologi Pendidikan. Pilihan mata kuliah sudah ada pada PPP, ruang belajar, dan flip card, dengan pencarian serta tombol ganti. Daftar pilihan berasal dari `courses` yang mempunyai topik. `modeCourses` menyimpan pilihan per mode; `chooseCourse` dan `topicsFor` menghubungkan pilihan ke materi. Bank, bacaan, dan kartu sudah difilter berdasarkan `courseId`. Metadata ujian dan halaman sumber masih khusus RPS awal. Untuk menambah mata kuliah:

1. Petakan RPS baru dan verifikasi sumber sesuai langkah di atas.
2. Simpan kelompok topik baru dan gabungkan ke ekspor `topics` dengan `courseId` yang benar. Kelompok awal `educationTopics` dipetakan ke `psikologi-pendidikan`; jangan memasukkan topik baru ke kelompok itu. Perataan `concepts` sudah mewarisi `courseId` dari topik. Beri ID topik yang unik antar mata kuliah.
3. Tambahkan metadata `courses`, termasuk `id`, `title`, `description`, dan daftar `topics` yang difilter ke ID mata kuliah tersebut. Picker otomatis menampilkan course yang mempunyai materi dan menghitung jumlah dari bank. Periksa bacaan, kartu, hasil, serta tautan materi prioritas agar tidak bercampur.
4. Ubah label Psikologi Pendidikan yang masih tertulis tetap pada setup, quiz, progress, footer, dan metadata menjadi berasal dari pilihan atau sesi. Buat metadata RPS/sumber per mata kuliah dan halaman cakupan yang sesuai. Tombol pilihan sudah mengisi config; jangan mengganti alur tersebut dengan tautan ke mata kuliah awal.
5. Buat pembagian ujian per mata kuliah. Jangan memaksakan minggu 1–7/9–15 bila RPS baru berbeda. Ubah validasi minggu di `scripts/check-content.mjs` menjadi matriks per mata kuliah.
6. Tambahkan tes bahwa bank tidak bercampur antar mata kuliah, hasil mengarah ke bacaan yang benar, serta pencarian dan kartu bekerja setelah pindah course.
7. Untuk konten klinis, gunakan sumber akademik atau panduan profesional yang sesuai; tetap sebagai pembelajaran, jangan menjadikan kuis sebagai alat diagnosis atau rekomendasi perawatan individu.
8. Jangan menampilkan course “tersedia” sebelum materinya dapat dipakai. Publikasikan dengan project Sites yang sama dan audience yang dipertahankan.

## Pemeriksaan sebelum rilis

`npm run check` memeriksa ID unik, pemetaan course/topik, minggu RPS awal, empat opsi unik, kunci, penjelasan, dan referensi yang ada. `npm test` memeriksa batas ujian, sampling 200 hard, streak, jawaban terkunci, hasil parsial, pengulangan salah, course tak dikenal, serta state musik, fade, seek, dan kegagalan autoplay.

Lanjutkan dengan browser: mulai sesi, jawab benar/salah, tandai, lewati, reload lalu resume, akhiri parsial, buka prioritas bacaan, flip card, ulang salah, buka riwayat lama. Periksa 320/390/768/1280 px, keyboard, kontras, reduced motion, serta pesan kosong/error. Gunakan data QA sendiri dalam preview yang bersih. Simpan bukti yang diperiksa ke `docs/QA.md`.
