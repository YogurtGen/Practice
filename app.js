import {topics,concepts,courses,sources,syllabusNotes,contentVersion,deepNotes} from './content.js';
import {bank,eligibleQuestions,makeSession,submitAnswer,evaluateSession,retrySession,shuffle} from './engine.js';
import {EvaluationMusic} from './evaluation-music.js';

const icons={
 book:'<path d="M3 4h7l2 2 2-2h7v15h-7l-2 2-2-2H3z"/><path d="M12 6v15"/>',
 home:'<path d="m3 10 9-7 9 7v11h-6v-7H9v7H3z"/>',
 pen:'<path d="m4 16 12-12 4 4-12 12-5 1z"/><path d="m13 7 4 4"/>',
 cards:'<rect x="7" y="5" width="13" height="16" rx="2"/><path d="M16 3 5 2 3 18"/><path d="M11 10h5m-5 4h5"/>',
 chart:'<path d="M4 3v18h17M8 16v-4m5 4V8m5 8V5"/>',
 search:'<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/>',
 check:'<path d="m5 12 4 4L19 6"/>',
 clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 list:'<path d="M9 5h12M9 12h12M9 19h12M3 5h1M3 12h1M3 19h1"/>',
 bulb:'<path d="M9 18h6m-6 3h6M8 15a7 7 0 1 1 8 0c-1 1-1 2-1 3H9c0-1 0-2-1-3z"/>',
 arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>',
 flag:'<path d="M5 22V3m0 0h13l-3 5 3 5H5"/>',
 moon:'<path d="M20 15A9 9 0 0 1 9 4a9 9 0 1 0 11 11z"/>',
 info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v1"/>',
};
const icon=(name)=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]||icons.book}</svg>`;
const esc=(value)=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const app=document.querySelector('#app');
const storageKey='kawan-belajar-v1';let storageError=false;
let saved={version:contentVersion,history:[],active:null,flashKnown:[],read:[]};
try{const raw=localStorage.getItem(storageKey);if(raw){const parsed=JSON.parse(raw);if(!parsed||!Array.isArray(parsed.history))throw new Error('Data tidak valid');saved={...saved,...parsed};if(parsed.version!==contentVersion){saved.active=null;saved.flashKnown=[];}}}catch{storageError=true;}
let route='home',selectedTopic=topics[0].id,librarySearch='',libraryExam='mix',courseSearch='',selectedAnswer=null,reviewOnlyWrong=true,flash=null,celebration=null,resultSession=null;
let config={courseId:'psikologi-pendidikan',exam:'uts',difficulty:'hard',count:25,cumulative:false,topicId:null};
const labels={home:'Beranda',setup:'Latihan PPP',study:'Ruang belajar',flash:'Flip card',progress:'Perkembanganku',sources:'Sumber & cakupan',quiz:'Latihan PPP',results:'Evaluasi latihan'};
const modeCourses={setup:null,study:null,flash:null};
const pickerSearch={setup:'',study:'',flash:''};
const getCourse=id=>courses.find(c=>c.id===id);
const topicsFor=id=>topics.filter(t=>t.courseId===id);
function modeCourse(mode){return getCourse(modeCourses[mode]);}
let musicPreferences={enabled:true,volume:.20};
try{const stored=JSON.parse(localStorage.getItem('kawan-belajar-music-v1'));if(stored&&typeof stored.enabled==='boolean'&&typeof stored.volume==='number')musicPreferences=stored;}catch{}
const music=new EvaluationMusic({
  ...musicPreferences,
  createAudio:()=>{const element=document.createElement('audio');element.id='evaluation-audio';element.src='./audio/pajama-party.mp3';element.hidden=true;document.body.append(element);return element;},
  createContext:()=>{const AudioEngine=window.AudioContext||window.webkitAudioContext;if(!AudioEngine)throw new Error('Web Audio unavailable');return new AudioEngine();},
});
music.setVisible(!document.hidden);

function chooseCourse(courseId,mode){
  const course=getCourse(courseId);if(!course||!['setup','study','flash'].includes(mode)||!topicsFor(courseId).length)return;
  modeCourses[mode]=courseId;
  if(mode==='setup'){if(config.courseId!==courseId)config={...config,courseId,exam:'uts',topicId:null,cumulative:false,count:25};else config.topicId=null;}
  if(mode==='study'){librarySearch='';libraryExam='mix';selectedTopic=topicsFor(courseId)[0].id;}
  if(mode==='flash'){flash=null;startFlash(null,'mix',false,courseId);}
  navigate(mode);
}
function coursePickerCards(mode){
  const query=pickerSearch[mode].trim().toLowerCase();
  const available=courses.filter(c=>topicsFor(c.id).length&&`${c.title} ${c.description}`.toLowerCase().includes(query));
  if(!available.length)return `<div class="empty"><h2>Belum ada mata kuliah yang cocok.</h2><p>Coba cari dengan nama yang lebih singkat.</p>${button('Hapus pencarian','clear-picker','',`data-mode="${mode}"`)}</div>`;
  return available.map(course=>{const cardCount=concepts.filter(c=>c.courseId===course.id).length;const questionCount=bank.filter(q=>q.courseId===course.id).length;return `<article class="course-panel"><div class="course-symbol">${icon('book')}</div><h2>${esc(course.title)}</h2><p class="description">${esc(course.description)}</p><div class="course-meta"><span>${topicsFor(course.id).length} topik</span><span>${mode==='setup'?questionCount+' varian soal':cardCount+(mode==='flash'?' kartu':' konsep')}</span></div>${button('Pilih '+esc(course.title),'choose-course','primary',`data-course="${course.id}" data-mode="${mode}"`)}</article>`;}).join('');
}
function coursePicker(mode){
  const descriptions={setup:'Mau latihan mata kuliah apa? Pilih dulu, lalu atur ujian dan jumlah soal.',study:'Mau baca materi apa? Pilih mata kuliah untuk membuka kelompok bacaannya.',flash:'Mau mengingat materi apa? Pilih mata kuliah untuk membuka kartunya.'};
  return `${pageTitle(labels[mode],descriptions[mode])}${mode==='setup'&&saved.active?`<div class="notice">Ada latihan ${esc(getCourse(saved.active.config.courseId)?.title||'sebelumnya')} yang belum selesai. ${button('Lanjutkan sesi itu','resume','link')}</div>`:''}<section class="course-picker"><div class="section-head"><h2>Pilihan mata kuliah</h2><p>${courses.filter(c=>topicsFor(c.id).length).length} tersedia</p></div><label class="searchbox">${icon('search')}<input id="picker-search" type="search" data-mode="${mode}" value="${esc(pickerSearch[mode])}" aria-label="Cari mata kuliah" placeholder="Cari mata kuliah…"></label><div class="course-picker-grid" id="picker-courses">${coursePickerCards(mode)}</div><p class="subtle" style="margin-top:18px">Mata kuliah lain akan muncul di sini setelah materinya ditambahkan.</p></section>`;
}
function courseBar(mode){const course=modeCourse(mode);return `<div class="mode-course-bar"><div><span class="subtle">Mata kuliah</span><strong>${esc(course.title)}</strong></div>${button('Ganti mata kuliah','change-course','',`data-mode="${mode}"`)}</div>`;}
function persist(){
  saved.version=contentVersion;
  try{localStorage.setItem(storageKey,JSON.stringify(saved));}catch{storageError=true;}
}
function button(text,action,cls='',data=''){return `<button class="button ${cls}" data-action="${action}" ${data}>${text}</button>`;}
function formatDate(value){return new Intl.DateTimeFormat('id-ID',{dateStyle:'medium',timeStyle:'short',timeZone:'Asia/Jakarta'}).format(new Date(value));}
function sourceLinks(keys){return `<div class="source-links">${keys.map(key=>`<a href="${esc(sources[key].url)}" target="_blank" rel="noopener noreferrer">${esc(sources[key].title)}</a>`).join('')}</div>`;}
function pageTitle(title,description){return `<div class="page-title"><div><h1>${title}</h1><p>${description}</p></div><span class="date-label">Satu langkah kecil setiap hari.</span></div>`;}
function navigate(next){
  if(next==='quiz'&&!saved.active)next='setup';
  if(next==='results'&&!saved.history.length)next='progress';
  route=next;selectedAnswer=null;
  if(next==='flash'&&modeCourses.flash&&!flash)startFlash();
  if(location.hash.slice(1)!==next)history.pushState(null,'','#'+next);
  render();window.scrollTo({top:0,behavior:'instant'});
  document.querySelector('#main')?.focus({preventScroll:true});
}
function toast(message){document.querySelector('.toast')?.remove();const node=document.createElement('div');node.className='toast';node.role='status';node.textContent=message;document.body.append(node);setTimeout(()=>node.remove(),3500);}
function render(){
  try{
    const isMode=['setup','study','flash'].includes(route);
    const content=isMode&&!modeCourse(route)?coursePicker(route):(isMode?courseBar(route):'')+({home:homeView,setup:setupView,quiz:quizView,results:resultsView,study:studyView,flash:flashView,progress:progressView,sources:sourcesView}[route]||homeView)();
    app.innerHTML=`${storageError?'<div class="storage-error" role="status">Penyimpanan di browser tidak tersedia atau data lama tidak bisa dibaca. Kamu tetap bisa belajar selama halaman ini terbuka.</div>':''}<div class="shell"><aside class="sidebar"><a class="brand" href="#home" data-nav="home"><span class="brand-mark">${icon('book')}</span><span>Kawan Belajar<small>sedikit demi sedikit.</small></span></a><div class="nav-label">Ruang kecil untuk belajar</div><nav class="nav" aria-label="Navigasi utama">${[['home','home','Beranda'],['setup','pen','Latihan PPP'],['study','book','Ruang belajar'],['flash','cards','Flip card'],['progress','chart','Perkembanganku']].map(([id,mark,text])=>`<button data-nav="${id}" class="${route===id||(id==='setup'&&['quiz','results'].includes(route))?'active':''}" ${route===id?'aria-current="page"':''}>${icon(mark)}<span>${text}</span></button>`).join('')}</nav><div class="sidebar-note"><h3>Pelan-pelan juga sampai.</h3><p>Keliru satu soal? Itu petunjuk untuk tahu bagian mana yang perlu kamu pelajari lagi.</p></div><div class="sidebar-foot">Terinspirasi Chiikawa.<br>Ruang belajar penggemar.</div></aside><div class="main-wrap"><header class="topbar"><div class="breadcrumb"><span>Ruang belajarmu</span><span>/</span><strong>${labels[route]||'Beranda'}</strong></div><div class="mobile-brand">${icon('book')} Kawan Belajar</div><div class="top-actions"><span class="local-label">Progres di perangkat ini</span><button class="icon-button" data-nav="sources" aria-label="Buka sumber dan cakupan materi">${icon('info')}</button></div></header><main id="main" class="content" tabindex="-1">${content}<footer class="page-note"><span>Psikologi Pendidikan · berdasarkan RPS 2025 revisi 10</span><a href="#sources" data-nav="sources">Sumber & cakupan materi</a></footer></main></div></div>`;
    if(route==='study')document.querySelector('.article-tools')?.insertAdjacentHTML('beforebegin',`<div class="depth-notes">${(deepNotes[selectedTopic]||[]).map(([title,text])=>`<section class="concept"><h3>${esc(title)}</h3><p>${esc(text)}</p></section>`).join('')}</div>`);
    if(celebration)showCelebration();
    music.setPage(route==='results'?(resultSession||saved.history.at(-1))?.id||null:null);
  }catch(error){console.error(error);app.innerHTML=`<main class="content"><h1>Ruang belajar belum bisa dibuka.</h1><p class="notice">Data atau tampilan mengalami masalah. Muat ulang halaman untuk mencoba lagi.</p>${button('Muat ulang halaman','reload','primary')}</main>`;}
}

function homeView(){
  const latest=saved.history.at(-1);const totalAnswered=saved.history.reduce((sum,s)=>sum+evaluateSession(s).answered,0);
  return `${pageTitle('Mau belajar apa hari ini?','Pilih materi, coba ingat sendiri, lalu pelajari yang belum kamu pahami.')}<section class="welcome"><div class="welcome-copy"><h2>Belajar ditemani.<br>Salah juga nggak apa-apa.</h2><p>Mulai dari beberapa soal. Chiikawa dan teman-teman menemani langkah kecilmu.</p>${button(saved.active?'Lanjutkan latihan':'Mulai latihan PPP',saved.active?'resume':'open-setup','primary')}</div><div class="welcome-art-wrap"><img class="welcome-art" src="./study-friends.png" alt="Chiikawa, Hachiware, dan Usagi belajar bersama dengan buku dan catatan." width="500" height="280"></div><span class="art-credit">Ilustrasi penggemar</span></section><div class="workspace"><section><div class="section-head"><h2>Rak mata kuliah</h2><p>${courses.length} mata kuliah tersedia</p></div><label class="searchbox">${icon('search')}<input type="search" id="course-search" value="${esc(courseSearch)}" placeholder="Cari mata kuliah atau teori…" aria-label="Cari mata kuliah atau teori"></label><div id="course-results">${courseResults()}</div><div class="reading-strip"><div><h3>Nggak harus langsung ngerjain soal.</h3><p>Baca konsep singkat dan contoh kasus di ruang belajar.</p></div>${button('Buka ruang belajar','open-study','link')}</div></section><aside class="right-column"><div class="aside-card"><h3>Langkah belajarmu</h3><div class="empty-progress">${totalAnswered||'0'}<span>soal dijawab</span></div><p class="progress-copy">${latest?'Ada hasil latihan yang bisa kamu tinjau.':'Belum ada sesi selesai.<br>Mulai dari 10 soal juga boleh.'}</p><div class="mini-stat"><span>Sesi selesai</span><strong>${saved.history.length}</strong></div><div class="mini-stat"><span>Streak terbaik</span><strong>${Math.max(0,...saved.history.map(s=>s.bestStreak))} benar</strong></div>${button('Lihat perkembanganku','open-progress','link wide')}</div><div class="aside-card tip"><div class="tip-heading">${icon('bulb')}<h3>Coba ingat dulu.</h3></div><p>Tutup materi sebelum menjawab. Setelah latihan, gunakan pembahasan untuk mengoreksi pemahamanmu.</p><a class="button link" href="${sources.retention.url}" target="_blank" rel="noopener noreferrer">Baca alasan di baliknya</a></div></aside></div>`;
}
function courseResults(){
  const query=courseSearch.toLowerCase().trim();const matches=courses.filter(c=>`${c.title} ${topics.map(t=>t.title).join(' ')} ${concepts.map(c=>c.title).join(' ')}`.toLowerCase().includes(query));
  if(!matches.length)return `<div class="empty"><h3>Materinya belum ada di rak.</h3><p>Coba cari “motivasi”, “Piaget”, atau “pendidikan”. Psikologi Pendidikan tersedia untuk versi ini.</p>${button('Tampilkan semua','clear-search')}</div>`;
  return matches.map(course=>`<article class="course-panel"><div class="course-head"><div><div class="course-symbol">${icon('book')}</div><h3>${course.title}</h3></div><span class="tag">${icon('check')} RPS dipetakan</span></div><p class="description">${course.description}</p><div class="course-meta"><span>${icon('list')}${topics.length} topik RPS</span><span>${icon('pen')}${bank.length} varian soal</span><span>${icon('cards')}${concepts.length} flip card</span></div><div class="topic-preview"><span>Teori belajar</span><span>Memori</span><span>Motivasi</span><span>Analisis kasus</span></div><div class="course-bottom"><small>UTS, UAS, atau campuran. Kamu pilih.</small>${button('Pilih latihan','open-setup','primary',`data-course="${course.id}"`)}</div></article>`).join('')+`<div class="coming">${icon('book')}<div><h3>Rak ini bisa bertambah.</h3><p>Psikologi klinis dan mata kuliah lain belum tersedia. Struktur materi siap ditambah dari RPS berikutnya.</p></div></div>`;
}

function choiceGroup(name,values,current){return `<div class="choices">${values.map(([value,label,disabled=false])=>`<label class="choice"><input type="radio" name="${name}" value="${value}" ${String(current)===String(value)?'checked':''} ${disabled?'disabled':''}>${label}</label>`).join('')}</div>`;}
function ensureCount(){const available=eligibleQuestions(config).length;const choices=[10,25,50,100,200];if(config.count>available)config.count=choices.filter(n=>n<=available).at(-1)||available;return available;}
function setupView(){
  const available=ensureCount();const topic=config.topicId?topics.find(t=>t.id===config.topicId):null;
  return `${pageTitle('Atur sesi belajarmu.','Jawab dulu tanpa materi. Pembahasan dibuka setelah sesi selesai.')}<div class="setup-layout"><section class="panel setup-panel"><h2>${topic?esc(topic.title):'Psikologi Pendidikan'}</h2>${topic?button('Kembali ke semua topik','all-topics','link'):''}${saved.active?`<div class="notice">Ada latihan yang belum selesai (${Object.keys(saved.active.answers).length}/${saved.active.questions.length} dijawab). ${button('Lanjutkan sesi itu','resume','link')}</div>`:''}<form id="setup-form"><fieldset class="field-group"><legend>Cakupan ujian</legend>${choiceGroup('exam',[['uts','UTS · minggu 1–7'],['uas','UAS · minggu 9–15'],['mix','Mix · semua materi']],config.exam)}</fieldset>${config.exam==='uas'?`<label class="checklabel"><input type="checkbox" name="cumulative" ${config.cumulative?'checked':''}><span>UAS kumulatif: ikutkan materi UTS juga.</span></label>`:''}<p class="field-help">${config.exam==='uas'?syllabusNotes.uas:config.exam==='uts'?syllabusNotes.uts:'Semua topik pertemuan 1–7 dan 9–15, tanpa minggu ujian.'}</p><fieldset class="field-group"><legend>Tingkat kesulitan</legend>${choiceGroup('difficulty',[['easy','Easy · konsep'],['medium','Medium · penerapan'],['hard','Hard · analisis'],['mix','Campuran']],config.difficulty)}</fieldset><fieldset class="field-group"><legend>Berapa soal dulu?</legend>${choiceGroup('count',[10,25,50,100,200].map(n=>[n,`${n} soal`,n>available]),config.count)}</fieldset><p class="field-help">${available} varian tersedia untuk pilihan ini. Sesi memakai soal tanpa pengulangan ID. ${available<200?'Untuk 200 soal hard, pilih Mix atau UAS kumulatif.':''}</p><div class="notice">${syllabusNotes.practice} Beberapa varian melatih konsep yang sama lewat pengenalan, kasus, dan evaluasi argumen.</div><button type="submit" class="button primary wide">Mulai ${config.count} soal ${icon('arrow')}</button></form></section><aside class="aside-card"><h3>Sesi PPP ini berjalan begini</h3><p>Kerjakan tanpa membuka bahan. Jawaban yang dikirim dikunci; kamu bisa menandai dan melewati soal.</p><p>Indikator benar/salah muncul untuk streak, tetapi kunci lengkap dan alasan baru dibuka setelah sesi.</p><p>Di akhir, lihat akurasi per materi dan buka bacaan yang sesuai. Setelah itu, ulangi jawaban salah.</p><div class="mini-stat"><span>Progres</span><strong>di browser ini</strong></div><p>Kamu bisa meninggalkan sesi dan melanjutkannya di perangkat ini.</p></aside></div>`;
}

function quizView(){
  const session=saved.active;if(!session)return setupView();const q=session.questions[session.index];const answer=session.answers[q.id];const answered=Object.keys(session.answers).length;const topic=topics.find(t=>t.id===q.topicId);
  return `<div class="session-top"><div><h1 style="font-size:1.55rem">Latihan PPP</h1><div class="session-meta"><span>Psikologi Pendidikan</span><span>${session.config.exam.toUpperCase()}${session.config.cumulative?' kumulatif':''}</span><span>${q.difficulty} · ${q.kind}</span></div></div>${button('Akhiri sesi','confirm-finish')}</div><div class="progress-track" role="progressbar" aria-label="Soal dijawab" aria-valuemin="0" aria-valuemax="${session.questions.length}" aria-valuenow="${answered}"><div style="width:${answered/session.questions.length*100}%"></div></div><div class="quiz-layout"><section class="panel question-panel"><div class="section-head"><span class="subtle">Soal ${session.index+1} dari ${session.questions.length}</span><span class="tag">${esc(topic.title)}</span></div><h2 id="question">${esc(q.prompt)}</h2><div class="answers" role="group" aria-labelledby="question">${q.options.map((option,i)=>`<button class="answer ${(!answer&&selectedAnswer===option)||answer?.selected===option?'selected':''}" data-answer="${i}" ${answer?'disabled':''} aria-pressed="${(answer?.selected||selectedAnswer)===option}"><span class="answer-letter">${'ABCD'[i]}</span><span>${esc(option)}</span></button>`).join('')}</div>${answer?`<div class="feedback" role="status"><strong>${answer.correct?'Benar. Satu langkah lagi!':'Belum tepat. Kita pelajari setelah sesi.'}</strong><span>Kunci dan pembahasan tersedia di evaluasi akhir.</span></div>`:''}<div class="quiz-actions">${button(session.marked.includes(q.id)?'Ditandai':'Tandai dulu','mark',session.marked.includes(q.id)?'pink':'')}${button(answer?(session.index===session.questions.length-1?'Lihat evaluasi':'Soal berikutnya'):'Kirim jawaban',answer?'next-question':'submit-answer','primary',(!answer&&!selectedAnswer)?'disabled':'')}<small>Jawaban yang dikirim dikunci. Soal yang dilewati tetap belum dijawab.</small></div><div class="section-head" style="margin:18px 0 0">${button('Sebelumnya','previous-question','link',session.index===0?'disabled':'')}${button('Lewati sementara','skip-question','link',session.index===session.questions.length-1?'disabled':'')}</div></section><aside class="quiz-aside"><div class="aside-card"><h3>Peta soal</h3><p>${answered} dijawab · ${session.questions.length-answered} belum</p><div class="question-map">${session.questions.map((question,i)=>`<button data-question="${i}" class="${i===session.index?'current':session.answers[question.id]?'done':''} ${session.marked.includes(question.id)?'marked':''}" aria-label="Soal ${i+1}, ${session.answers[question.id]?'sudah dijawab':'belum dijawab'}${session.marked.includes(question.id)?', ditandai':''}" ${i===session.index?'aria-current="step"':''}>${i+1}</button>`).join('')}</div><p style="font-size:.7rem">Biru: dijawab. Garis merah muda: ditandai.</p></div><div class="streak" aria-live="polite"><strong>${session.streak}</strong><p>jawaban benar beruntun<br>10 benar? Kita rayakan sebentar.</p></div></aside></div>`;
}

function resultsView(){
  const session=resultSession||saved.history.at(-1);if(!session)return progressView();const result=evaluateSession(session);
  const reviewQuestions=session.questions.filter(q=>!reviewOnlyWrong||(session.answers[q.id]&&!session.answers[q.id].correct));
  return `${pageTitle('Selesai. Sekarang kita pahami.','Hasil ini menunjukkan jawaban sesi ini, bukan ukuran kemampuanmu secara keseluruhan.')}<section class="result-banner"><div><div class="result-score">${result.accuracy??'Belum ada skor'}${result.accuracy!==null?'<small>%</small>':''}</div><p>${result.correct} benar dari ${result.answered} jawaban terkirim · ${result.unanswered} belum dijawab</p><p>${result.uniqueConcepts} konsep disentuh. Varian dari konsep yang sama dihitung sebagai jawaban terpisah.</p></div><div class="result-metrics"><div><strong>${result.wrong}</strong><span>perlu ditinjau</span></div><div><strong>${session.bestStreak}</strong><span>streak terbaik</span></div><div><strong>${Math.ceil(session.activeSeconds/60)} mnt</strong><span>perkiraan waktu aktif</span></div></div></section><div class="result-layout"><section class="panel"><h2 style="font-size:1.2rem">Materi mana yang perlu diulang?</h2><p class="subtle" style="margin-top:7px">Persentase dihitung dari jawaban terkirim. Sampel kecil belum cukup untuk menyimpulkan penguasaan.</p>${result.byTopic.sort((a,b)=>(a.accuracy??101)-(b.accuracy??101)).map(t=>`<div class="topic-result"><div><h3>${esc(t.title)}</h3><p>${t.accuracy===null?'Belum ada jawaban':`${t.correct}/${t.answered} benar · ${t.accuracy}%`}${t.answered<5?' · sampel sedikit':''}${t.wrongConcepts.length?' · '+t.wrongConcepts.map(id=>concepts.find(c=>c.id===id)?.title).join(', '):''}</p><div class="progress-track"><div style="width:${t.accuracy??0}%"></div></div></div>${button('Pelajari materi','learn-topic','',`data-topic="${t.topicId}"`)}</div>`).join('')}</section><aside class="aside-card"><h3>Langkah berikutnya</h3><p>${result.weak.length?'Mulai dari '+esc(result.weak[0].title)+'. Baca konsep, lalu cek ingatan lewat flip card.':result.answered?'Coba jelaskan konsep dengan kata-katamu sendiri, lalu latih penerapan di kasus baru.':'Belum ada jawaban yang terkirim. Mulai lagi dengan sesi singkat.'}</p>${result.weak.length?button('Buka materi prioritas','learn-topic','primary wide',`data-topic="${result.weak[0].topicId}"`):button('Buka ruang belajar','open-study','primary wide')}${result.wrong?button(`Ulangi ${result.wrong} jawaban salah`,'retry','wide'):''}${button('Atur latihan baru','open-setup','link wide')}</aside></div><section class="panel" style="margin-top:25px"><div class="section-head"><h2 style="font-size:1.2rem">Pembahasan soal</h2>${button(reviewOnlyWrong?'Tampilkan semua':'Hanya yang salah','toggle-review')}</div>${reviewQuestions.map(q=>{const a=session.answers[q.id];return `<details class="review-item"><summary>${a?(a.correct?'Benar':'Perlu diulang'):'Belum dijawab'} · ${esc(concepts.find(c=>c.id===q.conceptId).title)} · ${q.kind}</summary><p>${esc(q.prompt)}</p><p class="${a?.correct?'correct-text':'incorrect-text'}">Jawabanmu: ${a?esc(a.selected):'belum dikirim'}</p><p class="correct-text">Jawaban tepat: ${esc(q.correct)}</p><p>${esc(q.explanation)}</p>${sourceLinks(q.sources)}${button('Baca konsep ini','learn-concept','link',`data-concept="${q.conceptId}"`)}</details>`;}).join('')||'<p class="subtle">Tidak ada jawaban salah pada sesi ini.</p>'}</section>`;
}

function filteredTopics(){const query=librarySearch.toLowerCase().trim();return topicsFor(modeCourses.study).filter(t=>(libraryExam==='mix'||t.exam===libraryExam)&&(!query||`${t.title} ${t.coverage.join(' ')} ${concepts.filter(c=>c.topicId===t.id).map(c=>c.title+' '+c.text).join(' ')}`.toLowerCase().includes(query)));}
function studyView(topics=topicsFor(modeCourses.study)){
  const filtered=filteredTopics();if(!filtered.some(t=>t.id===selectedTopic)&&filtered.length)selectedTopic=filtered[0].id;
  const topic=topics.find(t=>t.id===selectedTopic);const cards=concepts.filter(c=>c.topicId===selectedTopic);
  return `${pageTitle('Ruang belajar','Bacaan pendek, contoh yang dekat, dan sumber yang bisa kamu periksa.')}<div class="filter-bar"><label class="searchbox">${icon('search')}<input type="search" id="library-search" value="${esc(librarySearch)}" placeholder="Cari teori, tokoh, atau konsep…" aria-label="Cari materi"></label><select id="library-exam" aria-label="Filter materi ujian"><option value="mix" ${libraryExam==='mix'?'selected':''}>Semua materi</option><option value="uts" ${libraryExam==='uts'?'selected':''}>Materi UTS</option><option value="uas" ${libraryExam==='uas'?'selected':''}>Materi UAS (9–15)</option></select></div><div id="library-content">${filtered.length?`<div class="library-layout"><nav class="topic-list" aria-label="Daftar topik">${filtered.map(t=>`<button data-topic-select="${t.id}" class="${t.id===selectedTopic?'active':''}" ${t.id===selectedTopic?'aria-current="page"':''}><span class="topic-index">${String(t.week).padStart(2,'0')}</span><span>${esc(t.title)}<br><small>${t.exam.toUpperCase()} · ${t.items.length} konsep</small></span>${saved.read.includes(t.id)?icon('check'):''}</button>`).join('')}</nav><article class="panel article"><span class="subtle">Pertemuan ${topic.week} · ${topic.exam.toUpperCase()} · RPS halaman ${topic.pages}</span><h2 style="margin-top:10px">${esc(topic.title)}</h2><p class="article-intro">${topic.intro}</p><p class="subtle">Cakupan RPS: ${topic.coverage.join(' · ')}</p>${cards.map(c=>`<section class="concept" id="${c.id}"><h3>${esc(c.title)}</h3><p>${esc(c.text)}</p><p class="example"><strong>Contoh:</strong> ${esc(c.scenario)} ${esc(c.conclusion)}</p></section>`).join('')}<section class="concept"><h3>Baca lebih jauh</h3>${sourceLinks(topic.sources)}<p class="subtle">Ringkasan ditulis ulang untuk belajar. Contoh kasus dan soal adalah latihan yang disusun untuk web ini.</p></section><div class="article-tools">${button(saved.read.includes(topic.id)?'Sudah dibaca':'Tandai sudah dibaca','mark-read','',`data-topic="${topic.id}"`)}${button('Flip card topik ini','flash-topic','',`data-topic="${topic.id}"`)}${button('Latih topik ini','practice-topic','primary',`data-topic="${topic.id}"`)}</div></article></div>`:`<div class="empty"><h3>Konsepnya belum ketemu.</h3><p>Coba kata yang lebih singkat, seperti “memori” atau “motivasi”.</p>${button('Hapus pencarian','clear-library')}</div>`}</div>`;
}

function startFlash(topicId=null,exam='mix',onlyUnknown=false,courseId=modeCourses.flash){
  const eligible=concepts.filter(c=>c.courseId===courseId&&(!topicId||c.topicId===topicId)&&(exam==='mix'||topics.find(t=>t.id===c.topicId).exam===exam)&&(!onlyUnknown||!saved.flashKnown.includes(c.id)));
  flash={cards:shuffle(eligible),index:0,flipped:false,known:0,again:[],topicId,exam,onlyUnknown,courseId,complete:false};
}
function flashView(topics=topicsFor(modeCourses.flash)){
  if(!flash)startFlash();
  return `${pageTitle('Flip card','Coba jawab di kepala dulu. Balik kartunya, lalu nilai ingatanmu sendiri.')}<div class="filter-bar"><select id="flash-exam" aria-label="Cakupan flip card"><option value="mix" ${flash.exam==='mix'?'selected':''}>UTS + UAS</option><option value="uts" ${flash.exam==='uts'?'selected':''}>UTS</option><option value="uas" ${flash.exam==='uas'?'selected':''}>UAS (9–15)</option></select><select id="flash-topic" aria-label="Topik flip card"><option value="">Semua topik</option>${topics.filter(t=>flash.exam==='mix'||t.exam===flash.exam).map(t=>`<option value="${t.id}" ${flash.topicId===t.id?'selected':''}>${esc(t.title)}</option>`).join('')}</select><label class="checklabel" style="margin:0"><input type="checkbox" id="flash-unknown" ${flash.onlyUnknown?'checked':''}> Hanya yang belum ingat</label></div><div class="flash-container">${!flash.cards.length?`<div class="empty"><h3>Semua kartu pilihan ini sudah kamu tandai ingat.</h3><p>Tampilkan semua kartu untuk menguji lagi, atau pilih topik lain.</p>${button('Tampilkan semua kartu','flash-all','primary')}</div>`:flash.complete?`<div class="panel" style="text-align:center;padding:40px"><h2>Putaran kartunya selesai.</h2><p style="margin:20px 0">${flash.known} ditandai ingat · ${flash.again.length} perlu diulang.<br>Ini penilaian diri, bukan skor ujian.</p><div class="flash-controls">${flash.again.length?button('Ulang kartu yang belum ingat','flash-repeat','primary'):''}${button('Acak putaran baru','flash-restart')}</div></div>`:(()=>{const c=flash.cards[flash.index];const t=topics.find(t=>t.id===c.topicId);return `<div class="flash-status"><span>${flash.index+1} / ${flash.cards.length} kartu</span><span>${esc(t.title)}</span></div><button class="flashcard" data-action="flip" aria-label="${flash.flipped?'Tampilkan pertanyaan':'Balik untuk melihat jawaban'}" aria-pressed="${flash.flipped}"><span class="tag">${flash.flipped?'Jawaban':'Coba ingat'}</span>${flash.flipped?`<p>${esc(c.text)}</p><small>${esc(c.conclusion)}</small>`:`<h2>${esc(c.title)}</h2><small>Bagaimana kamu menjelaskan konsep ini?</small>`}<small style="margin-top:20px">Klik atau tekan Space untuk membalik</small></button><div class="flash-controls">${button('Belum ingat','flash-again','',!flash.flipped?'disabled':'')}${button('Sudah ingat','flash-known','primary',!flash.flipped?'disabled':'')}</div><div style="text-align:center;margin-top:18px">${button('Baca penjelasan lengkap','learn-concept','link',`data-concept="${c.id}"`)}</div>`;})()}</div>`;
}

function progressView(){
  return `${pageTitle('Perkembanganku','Lihat hasil latihan yang tersimpan di browser ini.')}<section class="panel">${saved.history.length?`<h2 style="font-size:1.2rem">Riwayat sesi</h2>${[...saved.history].reverse().map(session=>{const r=evaluateSession(session);return `<div class="history-row"><div><h3>Psikologi Pendidikan · ${session.config.exam.toUpperCase()}${session.config.retry?' · ulang salah':''}</h3><p>${formatDate(session.finishedAt)} · ${session.config.difficulty} · ${r.answered}/${r.assigned} dijawab · ${r.uniqueConcepts} konsep</p></div><span class="history-score">${r.accuracy??'–'}${r.accuracy!==null?'%':''}</span>${button('Lihat evaluasi','history-result','',`data-session="${session.id}"`)}</div>`;}).join('')}<p class="subtle" style="margin-top:17px">Riwayat menyimpan maksimal 20 sesi terakhir. Tidak disinkronkan antarperangkat.</p>`:`<div class="empty"><h3>Belum ada sesi yang selesai.</h3><p>Setelah latihan, hasil per materi akan muncul di sini.</p>${button('Mulai 10 soal','quick-start','primary')}</div>`}</section><div class="reading-strip"><div><h3>${saved.read.length} topik ditandai sudah dibaca</h3><p>${saved.flashKnown.length} kartu ditandai ingat. Keduanya penilaian diri, bukan bukti penguasaan.</p></div>${button('Buka ruang belajar','open-study','link')}</div>${saved.history.length||saved.flashKnown.length||saved.read.length?button('Hapus progres perangkat ini','confirm-clear','link'):''}`;
}

function sourcesView(){
  return `${pageTitle('Sumber & cakupan','Peta materi dari RPS, referensi bacaan, dan batas versi ini.')}<section class="panel"><h2 style="font-size:1.2rem">RPS Psikologi Pendidikan</h2><p style="margin-top:12px">RPS 2025 revisi 10, kode mata kuliah 25P02687, semester 3, 3 SKS. Seluruh bahan kajian dari pertemuan 1–7 dan 9–15 dipetakan di bawah.</p><div class="notice">${syllabusNotes.uas}</div><p class="subtle">${syllabusNotes.limits}</p><div class="table-wrap"><table class="coverage"><thead><tr><th>Pertemuan</th><th>Cakupan RPS</th><th>Latihan & bacaan</th></tr></thead><tbody>${topics.map(t=>`<tr><td>${t.week} · ${t.exam.toUpperCase()}</td><td>${esc(t.coverage.join('; '))}</td><td><a href="#study" data-learn-topic="${t.id}">${esc(t.title)}</a><br>${t.items.length} konsep · ${t.items.length*4} varian</td></tr>`).join('')}</tbody></table></div><p class="subtle" style="margin-top:16px">Minggu 8 dan 16 adalah ujian, bukan bab teori tambahan. ${concepts.length} konsep menghasilkan ${bank.length} varian latihan (${bank.filter(q=>q.difficulty==='hard').length} hard). Varian berbeda bisa memakai konsep dan kasus yang sama.</p><p class="subtle" style="margin-top:10px">${syllabusNotes.practice} PPP di web ini memakai alur yang disepakati: latihan tanpa bahan, evaluasi, belajar bagian lemah, lalu ulang salah.</p></section><section class="panel" style="margin-top:25px"><h2 style="font-size:1.2rem">Referensi yang dapat dibuka</h2><p class="subtle" style="margin-top:10px">Ditinjau 8 Oktober 2026. Buku yang dicantumkan RPS menjadi referensi kuliah; isi penuh buku tersebut tidak dilampirkan. Ringkasan web memakai sumber terbuka berikut. Kasus dan pilihan jawaban ditulis untuk latihan.</p>${Object.values(sources).map(s=>`<div class="source-row"><h3>${esc(s.title)}</h3><p>${esc(s.org)}</p><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">Buka sumber asli</a></div>`).join('')}<div class="source-row"><h3>Catatan tema</h3><p>Terinspirasi karakter Chiikawa karya Nagano. Ilustrasi penggemar dibuat untuk ruang belajar ini. Web ini tidak berafiliasi dengan penerbit atau pemilik seri.</p></div></section>`;
}

function startSession(){
  try{saved.active=makeSession(config);persist();navigate('quiz');}catch(error){toast(error.message);}
}
function finishSession(){
  if(!saved.active)return;
  saved.active.complete=true;saved.active.finishedAt=Date.now();resultSession=saved.active;saved.history.push(saved.active);saved.history=saved.history.slice(-20);saved.active=null;persist();reviewOnlyWrong=true;navigate('results');
}
function showDialog(title,message,confirmLabel,onConfirm){
  const dialog=document.createElement('dialog');dialog.innerHTML=`<h2>${esc(title)}</h2><p>${esc(message)}</p><div class="dialog-buttons"><button class="button" data-cancel>Batalkan</button><button class="button primary" data-confirm>${esc(confirmLabel)}</button></div>`;
  document.body.append(dialog);dialog.showModal();dialog.querySelector('[data-cancel]').onclick=()=>dialog.close();dialog.querySelector('[data-confirm]').onclick=()=>{dialog.close();onConfirm();};dialog.addEventListener('close',()=>dialog.remove());
}
function requestFinish(){
  const remaining=saved.active.questions.length-Object.keys(saved.active.answers).length;
  if(remaining)showDialog('Akhiri sesi sekarang?',`${remaining} soal belum dijawab. Evaluasi hanya menghitung jawaban yang sudah dikirim. Kamu juga bisa melanjutkan sesi ini nanti.`, 'Akhiri & lihat evaluasi',finishSession);else finishSession();
}
function showCelebration(){
  const previous=document.querySelector('.celebration');if(previous)previous.remove();
  const node=document.createElement('div');node.className='celebration';node.innerHTML=`<div class="celebration-inner" role="dialog" aria-modal="true" aria-labelledby="celebrate-title"><img src="./study-friends.png" alt="Chiikawa dan teman-teman ikut merayakan." width="320" height="155"><h2 id="celebrate-title">Horay, ${celebration} beruntun!</h2><p>Kamu menjawab ${celebration} soal benar berturut-turut. Tarik napas sebentar, lalu lanjut.</p>${button('Lanjut latihan','close-celebration','primary')}</div>`;document.body.append(node);node.querySelector('button').focus();
}
function closeCelebration(){celebration=null;document.querySelector('.celebration')?.remove();document.querySelector('[data-action="next-question"]')?.focus();}
function learnTopic(topicId,conceptId){const topic=topics.find(t=>t.id===topicId);if(!topic)return;modeCourses.study=topic.courseId;selectedTopic=topicId;libraryExam='mix';librarySearch='';navigate('study');if(conceptId)document.getElementById(conceptId)?.scrollIntoView({block:'start'});}

app.addEventListener('submit',event=>{if(event.target.id==='setup-form'){event.preventDefault();if(saved.active)showDialog('Mulai sesi baru?','Sesi yang belum selesai akan diganti. Riwayat sesi yang sudah selesai tetap tersimpan.','Mulai sesi baru',startSession);else startSession();}});
app.addEventListener('change',event=>{
  const input=event.target;
  if(input.closest('#setup-form')){if(input.name==='cumulative')config.cumulative=input.checked;else if(input.name==='count')config.count=Number(input.value);else config[input.name]=input.value;if(input.name==='exam'&&config.topicId){const topic=topics.find(t=>t.id===config.topicId);if(input.value!=='mix'&&input.value!==topic.exam)config.topicId=null;}const name=input.name,value=input.value;render();document.querySelector(`[name="${name}"][value="${value}"]`)?.focus();}
  if(input.id==='library-exam'){libraryExam=input.value;render();document.querySelector('#library-exam')?.focus();}
  if(['flash-exam','flash-topic','flash-unknown'].includes(input.id)){const exam=document.querySelector('#flash-exam').value;let topicId=document.querySelector('#flash-topic').value||null;if(topicId&&exam!=='mix'&&topics.find(t=>t.id===topicId).exam!==exam)topicId=null;startFlash(topicId,exam,document.querySelector('#flash-unknown').checked);render();document.getElementById(input.id)?.focus();}
});
app.addEventListener('input',event=>{
  if(event.target.id==='picker-search'){const mode=event.target.dataset.mode;pickerSearch[mode]=event.target.value;document.querySelector('#picker-courses').innerHTML=coursePickerCards(mode);}
  if(event.target.id==='course-search'){courseSearch=event.target.value;document.querySelector('#course-results').innerHTML=courseResults();}
  if(event.target.id==='library-search'){librarySearch=event.target.value;const start=event.target.selectionStart;render();const field=document.querySelector('#library-search');field.focus();field.setSelectionRange(start,start);}
});
document.addEventListener('click',event=>{
  const target=event.target.closest('button,a');if(!target||target.disabled)return;
  if(target.dataset.nav){event.preventDefault();if(['setup','study','flash'].includes(target.dataset.nav))modeCourses[target.dataset.nav]=null;navigate(target.dataset.nav);return;}
  if(target.dataset.learnTopic){event.preventDefault();learnTopic(target.dataset.learnTopic);return;}
  if(target.dataset.topicSelect){selectedTopic=target.dataset.topicSelect;render();document.querySelector(`[data-topic-select="${selectedTopic}"]`)?.focus();return;}
  if(target.dataset.question!==undefined&&saved.active){saved.active.index=Number(target.dataset.question);selectedAnswer=null;persist();render();return;}
  if(target.dataset.answer!==undefined&&saved.active){selectedAnswer=saved.active.questions[saved.active.index].options[Number(target.dataset.answer)];render();document.querySelector(`[data-answer="${target.dataset.answer}"]`)?.focus();return;}
  const action=target.dataset.action;if(!action)return;
  switch(action){
    case 'choose-course':chooseCourse(target.dataset.course,target.dataset.mode);break;
    case 'change-course':modeCourses[target.dataset.mode]=null;navigate(target.dataset.mode);break;
    case 'clear-picker':pickerSearch[target.dataset.mode]='';render();document.querySelector('#picker-search')?.focus();break;
    case 'reload':location.reload();break;
    case 'open-setup':config.topicId=null;if(target.dataset.course)chooseCourse(target.dataset.course,'setup');else{modeCourses.setup=null;navigate('setup');}break;
    case 'open-study':modeCourses.study=route==='results'?(resultSession||saved.history.at(-1))?.config.courseId||null:null;navigate('study');break;
    case 'open-progress':navigate('progress');break;
    case 'resume':navigate('quiz');break;
    case 'clear-search':courseSearch='';render();document.querySelector('#course-search').focus();break;
    case 'clear-library':librarySearch='';render();document.querySelector('#library-search').focus();break;
    case 'all-topics':config.topicId=null;render();break;
    case 'quick-start':config.count=10;modeCourses.setup=null;navigate('setup');break;
    case 'submit-answer':{const q=saved.active.questions[saved.active.index];try{const result=submitAnswer(saved.active,q.id,selectedAnswer);persist();selectedAnswer=null;if(result.celebrate)celebration=saved.active.streak;render();if(!result.celebrate)document.querySelector('[data-action="next-question"]')?.focus();}catch(error){toast(error.message);}break;}
    case 'next-question':if(saved.active.index===saved.active.questions.length-1)requestFinish();else{saved.active.index++;selectedAnswer=null;persist();render();}break;
    case 'skip-question':saved.active.index++;selectedAnswer=null;persist();render();break;
    case 'previous-question':saved.active.index--;selectedAnswer=null;persist();render();break;
    case 'mark':{const id=saved.active.questions[saved.active.index].id;saved.active.marked=saved.active.marked.includes(id)?saved.active.marked.filter(x=>x!==id):[...saved.active.marked,id];persist();render();document.querySelector('[data-action="mark"]')?.focus();break;}
    case 'confirm-finish':requestFinish();break;
    case 'close-celebration':closeCelebration();break;
    case 'learn-topic':learnTopic(target.dataset.topic);break;
    case 'learn-concept':{const c=concepts.find(c=>c.id===target.dataset.concept);learnTopic(c.topicId,c.id);break;}
    case 'practice-topic':{const topic=topics.find(t=>t.id===target.dataset.topic);modeCourses.setup=topic.courseId;config={...config,courseId:topic.courseId,exam:topic.exam,topicId:topic.id,count:10,difficulty:'hard',cumulative:false};navigate('setup');break;}
    case 'flash-topic':{const topic=topics.find(t=>t.id===target.dataset.topic);modeCourses.flash=topic.courseId;startFlash(topic.id,'mix',false,topic.courseId);navigate('flash');break;}
    case 'mark-read':{const id=target.dataset.topic;saved.read=saved.read.includes(id)?saved.read.filter(x=>x!==id):[...saved.read,id];persist();render();toast(saved.read.includes(id)?'Topik ditandai sudah dibaca.':'Tanda sudah dibaca dilepas.');break;}
    case 'retry':try{saved.active=retrySession(resultSession||saved.history.at(-1));persist();navigate('quiz');}catch(error){toast(error.message);}break;
    case 'toggle-review':reviewOnlyWrong=!reviewOnlyWrong;render();break;
    case 'history-result':{const session=saved.history.find(s=>s.id===target.dataset.session);resultSession=session;navigate('results');break;}
    case 'flip':flash.flipped=!flash.flipped;render();document.querySelector('.flashcard')?.focus();break;
    case 'flash-known':case 'flash-again':{const c=flash.cards[flash.index];if(action==='flash-known'){flash.known++;if(!saved.flashKnown.includes(c.id))saved.flashKnown.push(c.id);}else{flash.again.push(c);saved.flashKnown=saved.flashKnown.filter(id=>id!==c.id);}persist();flash.index++;flash.flipped=false;if(flash.index>=flash.cards.length)flash.complete=true;render();document.querySelector('.flashcard')?.focus();break;}
    case 'flash-repeat':flash={...flash,cards:shuffle(flash.again),again:[],index:0,flipped:false,known:0,complete:false};render();break;
    case 'flash-restart':startFlash(flash.topicId,flash.exam,flash.onlyUnknown);render();break;
    case 'flash-all':startFlash(flash.topicId,flash.exam,false);render();break;
    case 'confirm-clear':showDialog('Hapus progres perangkat ini?','Riwayat, sesi aktif, tanda bacaan, dan kartu yang kamu tandai ingat akan dihapus dari browser ini.','Hapus progres',()=>{saved={version:contentVersion,history:[],active:null,flashKnown:[],read:[]};flash=null;resultSession=null;persist();render();toast('Progres perangkat ini dihapus.');});break;
  }
});
window.addEventListener('popstate',()=>{route=location.hash.slice(1)||'home';if(route==='quiz'&&!saved.active)route='setup';render();});
document.addEventListener('keydown',event=>{
  if(celebration){if(event.key==='Escape'){event.preventDefault();closeCelebration();}if(event.key==='Tab'){event.preventDefault();document.querySelector('.celebration button')?.focus();}return;}
  if(route==='flash'&&event.code==='Space'&&!['INPUT','SELECT','BUTTON','A'].includes(document.activeElement?.tagName)&&flash?.cards.length&&!flash.complete){event.preventDefault();flash.flipped=!flash.flipped;render();}
});
setInterval(()=>{if(route==='quiz'&&saved.active&&!document.hidden){saved.active.activeSeconds+=5;persist();}},5000);
window.addEventListener('pagehide',persist);
document.addEventListener('visibilitychange',()=>music.setVisible(!document.hidden));
window.addEventListener('pagehide',()=>music.stopImmediately());
window.addEventListener('pageshow',()=>{music.setVisible(!document.hidden);if(route==='results')music.update();});
const initial=location.hash.slice(1);if(initial&&labels[initial])route=initial;if(route==='quiz'&&!saved.active)route='setup';
render();

if(document.modelContext?.registerTool){
  const lifecycle=new AbortController();
  const tools=[
    {name:'read_study_catalog',title:'Read study catalog',description:'Read available syllabus topics and practice counts. Does not start a session or expose answer keys.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:false},execute:()=>({topics:topics.map(t=>({id:t.id,title:t.title,exam:t.exam,week:t.week})),concepts:concepts.length,questions:bank.length})},
    {name:'open_study_topic',title:'Open study topic',description:'Navigate the visible reading room to one syllabus topic. Does not mark it read or change quiz answers.',inputSchema:{type:'object',properties:{topicId:{type:'string'}},required:['topicId'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute:input=>{if(!input||typeof input.topicId!=='string'||!topics.some(t=>t.id===input.topicId))throw new Error('Unknown topicId');learnTopic(input.topicId);return {topicId:input.topicId,view:'study'};}},
  ];
  for(const tool of tools)try{Promise.resolve(document.modelContext.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{}
  window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
}
