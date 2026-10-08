import test from 'node:test';
import assert from 'node:assert/strict';
import {EvaluationMusic,MUSIC_START,MUSIC_MAX_VOLUME,MUSIC_FADE_IN,MUSIC_FADE_OUT} from '../dist/evaluation-music.js';

function fixture(options={}){
  const timers=new Map();let nextTimer=0;
  const parameter=()=>({value:0,events:[],cancelScheduledValues(t){this.events.push(['cancel',t]);},setValueAtTime(v,t){this.events.push(['set',v,t]);},linearRampToValueAtTime(v,t){this.events.push(['ramp',v,t]);}});
  const gain={gain:parameter(),connect(){}};
  const compressor={threshold:parameter(),knee:parameter(),ratio:parameter(),attack:parameter(),release:parameter(),connect(){}};
  const context={currentTime:0,destination:{},resume:()=>Promise.resolve(),createGain:()=>gain,createDynamicsCompressor:()=>compressor,createMediaElementSource:()=>({connect(){}})};
  const audio={paused:true,ended:false,currentTime:0,playCalls:0,pauseCalls:0,listeners:{},play(){this.playCalls++;this.paused=false;return Promise.resolve();},pause(){this.pauseCalls++;this.paused=true;},addEventListener(event,callback){this.listeners[event]=callback;},removeEventListener(event){delete this.listeners[event];}};
  const music=new EvaluationMusic({createAudio:()=>audio,createContext:()=>context,setTimer:(f,delay)=>{const id=++nextTimer;timers.set(id,{f,delay});return id;},clearTimer:id=>timers.delete(id),...options});
  const tick=()=>{const pending=[...timers.values()];timers.clear();for(const t of pending)t.f();};
  return {music,audio,context,gain,compressor,timers,tick};
}
const settled=()=>new Promise(resolve=>setImmediate(resolve));
test('browser timer functions are called without the controller as their receiver',async()=>{
  let cleared=false;const f=fixture({setTimer:function(){assert.equal(this,undefined);return 1;},clearTimer:function(){assert.equal(this,undefined);cleared=true;}});
  f.music.setPage('session-a');await settled();f.music.setPage(null);f.music.setPage('session-a');await settled();assert.equal(cleared,true);
});

test('results start at six seconds through a quiet compressor and gradual gain',async()=>{
  const {music,audio,gain,compressor}=fixture();music.setPage('session-a');await settled();
  assert.equal(audio.currentTime,MUSIC_START);assert.equal(audio.loop,false);assert.equal(music.state,'playing');
  assert.equal(compressor.ratio.value,4);assert.ok(compressor.threshold.value<0);
  assert.deepEqual(gain.gain.events.at(-1),['ramp',.20,MUSIC_FADE_IN]);
  const playCalls=audio.playCalls;audio.currentTime=30;music.setPage('session-a');await settled();assert.equal(audio.currentTime,30);assert.equal(audio.playCalls,playCalls);
});
test('leaving results fades before pausing, and the next visit begins at six',async()=>{
  const {music,audio,context,gain,timers,tick}=fixture();music.setPage('session-a');await settled();context.currentTime=10;audio.currentTime=40;
  music.setPage(null);assert.equal(audio.paused,false);assert.equal([...timers.values()][0].delay,MUSIC_FADE_OUT*1000);assert.deepEqual(gain.gain.events.at(-1),['ramp',0,10+MUSIC_FADE_OUT]);
  context.currentTime+=MUSIC_FADE_OUT;tick();assert.equal(audio.paused,true);
  music.setPage('session-a');await settled();assert.equal(audio.currentTime,MUSIC_START);
});
test('returning during a fade cancels the stale pause without a volume jump',async()=>{
  const {music,audio,context,gain,tick}=fixture();music.setPage('session-a');await settled();context.currentTime=10;audio.currentTime=20;music.setPage(null);context.currentTime=10.8;
  music.setPage('session-a');await settled();tick();assert.equal(audio.paused,false);assert.equal(audio.currentTime,20);
  const anchor=gain.gain.events.filter(e=>e[0]==='set').at(-1);assert.ok(Math.abs(anchor[1]-.10)<.0001);
});
test('a new result waits for the previous track to fade before seeking',async()=>{
  const {music,audio,context,tick}=fixture();music.setPage('session-a');await settled();context.currentTime=10;audio.currentTime=40;music.setPage('session-b');assert.equal(audio.currentTime,40);
  context.currentTime+=MUSIC_FADE_OUT;tick();await settled();assert.equal(audio.currentTime,MUSIC_START);assert.equal(music.state,'playing');
});
test('muted preference and hidden pages never force playback, and volume is capped',async()=>{
  const {music,audio,context,tick}=fixture({enabled:false});music.setPage('session-a');await settled();assert.equal(audio.playCalls,0);
  music.toggle();await settled();music.setVolume(1);assert.equal(music.volume,MUSIC_MAX_VOLUME);music.setVolume(-1);assert.equal(music.volume,0);music.setVolume(.20);
  music.setVisible(false);context.currentTime+=MUSIC_FADE_OUT;tick();assert.equal(audio.paused,true);music.setVisible(true);await settled();assert.equal(audio.paused,false);
});
test('autoplay refusal leaves an explicit play action and retries safely',async()=>{
  const f=fixture();f.audio.play=function(){return Promise.reject(Object.assign(new Error('Gesture required'),{name:'NotAllowedError'}));};
  f.music.setPage('session-a');await settled();assert.equal(f.music.state,'blocked');assert.equal(f.audio.paused,true);assert.equal(f.music.currentGain(),0);
  f.audio.play=function(){this.paused=false;return Promise.resolve();};f.music.toggle();await settled();assert.equal(f.music.state,'playing');assert.equal(f.audio.currentTime,6);
});
test('a pending play cannot become audible after the user has left results',async()=>{
  const f=fixture();let resolvePlay;f.audio.play=function(){return new Promise(resolve=>{resolvePlay=()=>{this.paused=false;resolve();};});};
  f.music.setPage('session-a');f.music.setPage(null);resolvePlay();await settled();assert.equal(f.audio.paused,true);assert.equal(f.music.currentGain(),0);
});
test('unsupported audio fails quietly instead of playing at native full volume',async()=>{
  const f=fixture({createContext:()=>{throw new Error('Unavailable');}});f.music.setPage('session-a');await settled();assert.equal(f.music.state,'error');assert.equal(f.audio.playCalls,0);
});
test('seek failure stays silent rather than playing the wrong opening',async()=>{
  const f=fixture();f.audio.seeking=true;f.music.setPage('session-a');await settled();f.audio.currentTime=0;f.audio.seeking=false;f.audio.listeners.seeked();await settled();assert.equal(f.music.state,'error');assert.equal(f.audio.paused,true);assert.equal(f.music.currentGain(),0);
});
