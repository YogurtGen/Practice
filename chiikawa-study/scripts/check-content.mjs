import assert from 'node:assert/strict';
import {topics,concepts,sources,courses} from '../dist/content.js';
import {bank} from '../dist/engine.js';
import {quizWording,quizScenarios,quizTasks} from '../dist/quiz-language.js';

assert.equal(new Set(concepts.map(c=>c.id)).size,concepts.length,'Duplicate concept IDs');
assert.equal(new Set(bank.map(q=>q.id)).size,bank.length,'Duplicate question IDs');
assert.deepEqual(topics.map(t=>t.week),[1,2,3,4,5,6,7,9,10,11,12,13,14,15]);
for(const topic of topics)assert.ok(courses.some(c=>c.id===topic.courseId),topic.id+' missing course');
for(const course of courses)assert.deepEqual(course.topics,topics.filter(t=>t.courseId===course.id).map(t=>t.id),course.id);
for(const c of concepts){assert.equal(c.distractors.length,3,c.id);assert.ok(c.text&&c.scenario&&c.conclusion,c.id);for(const source of c.sources)assert.ok(sources[source],source);}
assert.deepEqual(Object.keys(quizWording).sort(),concepts.map(c=>c.id).sort(),'Quiz wording must cover each concept exactly once');
for(const [id,row] of Object.entries(quizWording)){assert.equal(row.length,6,id);assert.ok(row.every(value=>typeof value==='string'&&value.trim()),id);}
for(const id of Object.keys(quizScenarios))assert.ok(quizWording[id],id+' unknown scenario');
for(const id of Object.keys(quizTasks))assert.ok(bank.some(q=>q.id===id),id+' unknown task');
for(const q of bank){assert.equal(q.options.length,4,q.id);assert.equal(new Set(q.options).size,4,q.id);assert.ok(q.options.includes(q.correct),q.id);assert.ok(q.explanation&&q.sources.length,q.id);}
for(const [id,source] of Object.entries(sources))assert.equal(new URL(source.url).protocol,'https:',id);
console.log(JSON.stringify({topics:topics.length,concepts:concepts.length,questions:bank.length,hard:bank.filter(q=>q.difficulty==='hard').length,sources:Object.keys(sources).length}));
