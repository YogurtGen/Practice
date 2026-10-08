import {concepts,topics} from './content.js';
import {quizConcept,quizLanguageVersion,quizTasks} from './quiz-language.js';

export function shuffle(values,random=Math.random){
  const result=[...values];
  for(let i=result.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}
  return result;
}

const quizConcepts=concepts.map(quizConcept);
export const bank=quizConcepts.flatMap(concept=>{
  const peers=quizConcepts.filter(c=>c.topicId===concept.topicId&&c.id!==concept.id).slice(0,3);
  const base={conceptId:concept.id,topicId:concept.topicId,courseId:concept.courseId,explanation:concept.text+' '+concept.conclusion,sources:concept.sources};
  return [
    {...base,id:concept.id+'.recall',difficulty:'easy',kind:'Kenali konsep',prompt:concept.text+' Konsep apa yang dijelaskan di atas?',options:[concept.title,...peers.map(c=>c.title)],correct:concept.title},
    {...base,id:concept.id+'.apply',difficulty:'medium',kind:'Penerapan',prompt:concept.scenario+' '+(quizTasks[concept.id+'.apply']||'Konsep apa yang paling sesuai dengan contoh ini?'),options:[concept.title,...peers.map(c=>c.title)],correct:concept.title},
    {...base,id:concept.id+'.analyze',difficulty:'hard',kind:'Analisis kasus',prompt:concept.scenario+' Apa kesimpulan yang paling tepat?',options:[concept.conclusion,...concept.distractors],correct:concept.conclusion},
    {...base,id:concept.id+'.evaluate',difficulty:'hard',kind:'Evaluasi argumen',prompt:concept.scenario+' Seseorang berkata: “'+concept.distractors[0]+'” Bagaimana kamu menilai pendapat itu?',options:[concept.conclusion,...concept.distractors.map((d,i)=>i===0?'Pendapat itu benar dan sesuai dengan kejadian di atas.':d)],correct:concept.conclusion},
  ];
});

export function eligibleQuestions(config){
  const allowed=new Set(topics.filter(t=>t.courseId===(config.courseId||'psikologi-pendidikan')&&(config.exam==='mix'||(config.exam==='uas'&&config.cumulative)||t.exam===config.exam)).map(t=>t.id));
  return bank.filter(q=>q.courseId===(config.courseId||'psikologi-pendidikan')&&allowed.has(q.topicId)&&(!config.topicId||q.topicId===config.topicId)&&(config.difficulty==='mix'||q.difficulty===config.difficulty));
}

export function makeSession(config,random=Math.random){
  const available=eligibleQuestions(config);
  if(!Number.isInteger(config.count)||config.count<1||config.count>available.length)throw new Error('Jumlah soal melebihi bank yang tersedia untuk pilihan ini.');
  // Round-robin sampling prevents large topics from crowding smaller syllabus topics out of a session.
  const grouped=new Map();
  for(const q of shuffle(available,random)){if(!grouped.has(q.topicId))grouped.set(q.topicId,[]);grouped.get(q.topicId).push(q);}
  const keys=shuffle([...grouped.keys()],random);const selected=[];
  while(selected.length<config.count){for(const key of keys){const q=grouped.get(key).pop();if(q)selected.push({...q,options:shuffle(q.options,random)});if(selected.length===config.count)break;}}
  return {id:globalThis.crypto?.randomUUID?.()||String(Date.now()),config:{...config},languageVersion:quizLanguageVersion,questions:shuffle(selected,random),answers:{},marked:[],index:0,streak:0,bestStreak:0,startedAt:Date.now(),activeSeconds:0,complete:false};
}

export function submitAnswer(session,questionId,selected){
  const question=session.questions.find(q=>q.id===questionId);
  if(!question||!question.options.includes(selected))throw new Error('Pilihan jawaban tidak valid.');
  if(session.complete||session.answers[questionId])throw new Error('Jawaban sudah dikunci.');
  const correct=selected===question.correct;
  session.answers[questionId]={selected,correct,at:Date.now()};
  session.streak=correct?session.streak+1:0;
  session.bestStreak=Math.max(session.bestStreak,session.streak);
  return {correct,celebrate:correct&&session.streak%10===0};
}

export function evaluateSession(session){
  const submitted=session.questions.filter(q=>session.answers[q.id]);
  const correct=submitted.filter(q=>session.answers[q.id].correct).length;
  const byTopic=topics.filter(t=>session.questions.some(q=>q.topicId===t.id)).map(topic=>{
    const questions=session.questions.filter(q=>q.topicId===topic.id);const answered=questions.filter(q=>session.answers[q.id]);
    const right=answered.filter(q=>session.answers[q.id].correct).length;
    return {topicId:topic.id,title:topic.title,assigned:questions.length,answered:answered.length,correct:right,accuracy:answered.length?Math.round(right/answered.length*100):null,wrongConcepts:[...new Set(answered.filter(q=>!session.answers[q.id].correct).map(q=>q.conceptId))]};
  });
  // Scores use submitted answers; unfinished items remain separate and cannot be interpreted as mastery.
  return {assigned:session.questions.length,answered:submitted.length,correct,wrong:submitted.length-correct,unanswered:session.questions.length-submitted.length,accuracy:submitted.length?Math.round(correct/submitted.length*100):null,uniqueConcepts:new Set(submitted.map(q=>q.conceptId)).size,byTopic,weak:byTopic.filter(t=>t.answered&&t.accuracy<80).sort((a,b)=>a.accuracy-b.accuracy||b.answered-a.answered)};
}

export function retrySession(session){
  const wrong=session.questions.filter(q=>session.answers[q.id]&&!session.answers[q.id].correct);
  if(!wrong.length)throw new Error('Tidak ada jawaban salah untuk diulang.');
  return {...makeSession({...session.config,count:1}),languageVersion:session.languageVersion,questions:shuffle(wrong).map(q=>({...q,options:shuffle(q.options)})),config:{...session.config,count:wrong.length,retry:true}};
}
