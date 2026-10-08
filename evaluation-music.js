export const MUSIC_START=6;
export const MUSIC_MAX_VOLUME=.35;
export const MUSIC_FADE_IN=2.8;
export const MUSIC_FADE_OUT=1.6;
const clampVolume=value=>Math.max(0,Math.min(MUSIC_MAX_VOLUME,Number.isFinite(value)?value:.20));

export class EvaluationMusic{
  constructor({createAudio,createContext,onChange=()=>{},setTimer=setTimeout,clearTimer=clearTimeout,enabled=true,volume=.20}){
    this.createAudio=createAudio;this.createContext=createContext;this.onChange=onChange;this.setTimer=(callback,delay)=>setTimer(callback,delay);this.clearTimer=id=>clearTimer(id);
    this.enabled=enabled;this.volume=clampVolume(volume);this.visible=true;this.pageKey=null;this.playbackKey=null;this.state='idle';this.generation=0;this.timer=null;this.envelope={from:0,to:0,start:0,end:0};
  }
  snapshot(){return {enabled:this.enabled,volume:this.volume,state:this.state};}
  notify(){this.onChange(this.snapshot());}
  shouldPlay(){return Boolean(this.pageKey&&this.enabled&&this.visible);}
  ensureEngine(){
    if(this.context)return;
    const context=this.createContext();const audio=this.createAudio();const source=context.createMediaElementSource(audio);
    const compressor=context.createDynamicsCompressor();compressor.threshold.value=-22;compressor.knee.value=18;compressor.ratio.value=4;compressor.attack.value=.02;compressor.release.value=.25;
    const gain=context.createGain();gain.gain.value=0;
    source.connect(compressor);compressor.connect(gain);gain.connect(context.destination);
    this.context=context;this.audio=audio;this.gain=gain;
    audio.loop=false;audio.preload='none';
    audio.addEventListener('ended',()=>{if(this.pageKey){this.state='ended';this.notify();}});
    audio.addEventListener('error',()=>{this.cancelTimer();this.generation++;this.ramp(0,0);audio.pause();this.state='error';this.notify();});
  }
  currentGain(){
    const e=this.envelope,now=this.context?.currentTime??0;
    if(now>=e.end)return e.to;if(now<=e.start)return e.from;
    return e.from+(e.to-e.from)*(now-e.start)/(e.end-e.start);
  }
  ramp(target,duration){
    if(!this.gain)return;const now=this.context.currentTime;const from=this.currentGain();const to=clampVolume(target);
    // Keep the in-flight gain when reversing a fade; resetting to its old target causes a volume jump.
    this.gain.gain.cancelScheduledValues(now);this.gain.gain.setValueAtTime(from,now);
    if(duration>0)this.gain.gain.linearRampToValueAtTime(to,now+duration);else this.gain.gain.setValueAtTime(to,now);
    this.envelope={from,to,start:now,end:now+duration};
  }
  cancelTimer(){if(this.timer!==null){this.clearTimer(this.timer);this.timer=null;}}
  seekToStart(){
    return new Promise((resolve,reject)=>{
      let timeout;
      const cleanup=()=>{this.audio.removeEventListener('seeked',seeked);if(timeout!==undefined)this.clearTimer(timeout);};
      const seeked=()=>{cleanup();if(Math.abs(this.audio.currentTime-MUSIC_START)<.25)resolve();else reject(new Error('Audio seeking failed'));};
      this.audio.addEventListener('seeked',seeked);
      timeout=this.setTimer(()=>{cleanup();reject(new Error('Audio seeking timed out'));},8000);
      this.audio.currentTime=MUSIC_START;
      if(!this.audio.seeking&&Math.abs(this.audio.currentTime-MUSIC_START)<.25){cleanup();resolve();}
    });
  }
  setPage(key){if(key===this.pageKey){this.notify();return;}this.pageKey=key;this.update();}
  setVisible(visible){if(visible===this.visible)return;this.visible=visible;this.update();}
  setVolume(volume){this.volume=clampVolume(volume);if(this.shouldPlay()&&this.state==='playing')this.ramp(this.volume,.4);this.notify();}
  toggle(){this.enabled=!(this.shouldPlay()&&['playing','loading','fading'].includes(this.state));this.update();}
  update(){
    this.cancelTimer();const generation=++this.generation;
    if(!this.shouldPlay()){
      if(!this.audio||this.audio.paused){if(!this.pageKey)this.playbackKey=null;this.state='paused';this.notify();return;}
      this.ramp(0,MUSIC_FADE_OUT);this.state='fading';this.notify();
      this.timer=this.setTimer(()=>{if(generation!==this.generation)return;this.timer=null;this.audio.pause();if(!this.pageKey)this.playbackKey=null;this.state='paused';this.notify();},MUSIC_FADE_OUT*1000);
      return;
    }
    const restart=this.playbackKey!==this.pageKey||Boolean(this.audio?.ended);
    if(restart&&this.audio&&!this.audio.paused){
      this.ramp(0,MUSIC_FADE_OUT);this.state='fading';this.notify();
      this.timer=this.setTimer(()=>{if(generation!==this.generation)return;this.timer=null;this.audio.pause();this.start(true,generation);},MUSIC_FADE_OUT*1000);
    }else this.start(restart,generation);
  }
  async start(restart,generation){
    try{
      this.ensureEngine();if(restart){this.ramp(0,0);try{this.audio.currentTime=MUSIC_START;}catch{}}
      this.state='loading';this.notify();
      const resume=this.context.resume();const play=this.audio.play();
      await Promise.all([resume,play]);
      if(generation!==this.generation){if(!this.shouldPlay())this.audio.pause();return;}
      if(restart)await this.seekToStart();
      if(generation!==this.generation){if(!this.shouldPlay())this.audio.pause();return;}
      this.playbackKey=this.pageKey;this.ramp(this.volume,MUSIC_FADE_IN);this.state='playing';this.notify();
    }catch(error){
      if(generation!==this.generation)return;
      this.audio?.pause();this.ramp(0,0);this.state=error.name==='NotAllowedError'?'blocked':'error';this.notify();
    }
  }
  stopImmediately(){this.cancelTimer();this.generation++;this.ramp(0,0);this.audio?.pause();this.state='paused';this.notify();}
}
