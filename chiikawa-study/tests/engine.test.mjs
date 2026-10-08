import test from 'node:test';
import assert from 'node:assert/strict';
import {makeSession,submitAnswer,evaluateSession,eligibleQuestions,retrySession} from '../dist/engine.js';
import {concepts} from '../dist/content.js';

const config={courseId:'psikologi-pendidikan',exam:'mix',difficulty:'hard',count:200,cumulative:false,topicId:null};
test('course scope rejects an unregistered course instead of mixing question banks',()=>{
  assert.equal(eligibleQuestions({...config,courseId:'missing-course'}).length,0);
  assert.throws(()=>makeSession({...config,courseId:'missing-course',count:10}),/melebihi/);
});
test('200 hard questions have unique IDs and cover every syllabus topic',()=>{
  const session=makeSession(config);assert.equal(session.questions.length,200);assert.equal(new Set(session.questions.map(q=>q.id)).size,200);assert.equal(new Set(session.questions.map(q=>q.topicId)).size,14);assert.ok(session.questions.every(q=>q.difficulty==='hard'));
});
test('exam boundaries and cumulative UAS are explicit',()=>{
  assert.ok(eligibleQuestions({...config,exam:'uts'}).every(q=>['pengantar','behavioristik','kognitif','konstruktivistik','memori','humanistik','ekologis'].includes(q.topicId)));
  assert.equal(eligibleQuestions({...config,exam:'uas'}).length,112);assert.equal(eligibleQuestions({...config,exam:'uts'}).length,112);assert.equal(eligibleQuestions({...config,exam:'uas',cumulative:true}).length,224);
  assert.throws(()=>makeSession({...config,exam:'uts'}),/melebihi/);
});
test('answers lock, streak celebrates at ten and resets after a mistake',()=>{
  const session=makeSession({...config,count:25});let result;
  for(const q of session.questions.slice(0,10))result=submitAnswer(session,q.id,q.correct);
  assert.equal(result.celebrate,true);assert.equal(session.streak,10);assert.equal(session.bestStreak,10);
  const q=session.questions[10];submitAnswer(session,q.id,q.options.find(o=>o!==q.correct));assert.equal(session.streak,0);assert.equal(session.bestStreak,10);
  assert.throws(()=>submitAnswer(session,q.id,q.correct),/dikunci/);assert.throws(()=>submitAnswer(session,session.questions[11].id,'invalid'),/valid/);
});
test('partial results separate unanswered questions and untested topics',()=>{
  const session=makeSession({...config,count:25});const q=session.questions[0];submitAnswer(session,q.id,q.correct);
  const result=evaluateSession(session);assert.equal(result.accuracy,100);assert.equal(result.answered,1);assert.equal(result.unanswered,24);assert.equal(result.uniqueConcepts,1);assert.ok(result.byTopic.some(t=>t.accuracy===null));assert.equal(result.weak.length,0);
  assert.equal(evaluateSession(makeSession({...config,count:10})).accuracy,null);
});
test('retry queue includes only submitted incorrect questions',()=>{
  const session=makeSession({...config,count:25});const [a,b]=session.questions;submitAnswer(session,a.id,a.correct);submitAnswer(session,b.id,b.options.find(o=>o!==b.correct));session.complete=true;
  const retry=retrySession(session);assert.deepEqual(retry.questions.map(q=>q.id),[b.id]);assert.equal(retry.complete,false);assert.equal(Object.keys(retry.answers).length,0);assert.equal(retry.config.count,1);
});

test('saved questions keep their answer values when quiz wording changes',()=>{
  const source=concepts.find(c=>c.id==='behavioristik.classical');
  const peers=concepts.filter(c=>c.topicId===source.topicId&&c.id!==source.id).slice(0,3);
  const session=makeSession({...config,difficulty:'easy',count:1,topicId:source.topicId});
  const current=eligibleQuestions({...config,difficulty:'easy'}).find(q=>q.id===source.id+'.recall');
  assert.notEqual(current.correct,source.title);
  session.questions=[{...current,prompt:source.text,options:[source.title,...peers.map(c=>c.title)],correct:source.title}];
  const snapshot=JSON.stringify(session.questions);
  submitAnswer(session,current.id,source.title);
  assert.equal(evaluateSession(session).accuracy,100);
  assert.equal(JSON.stringify(session.questions),snapshot);
  assert.throws(()=>submitAnswer({...session,answers:{}},current.id,current.correct),/valid/);
});
