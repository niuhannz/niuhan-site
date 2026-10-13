import {abstractSlides} from './abstract-slides.js';
const originalSlides = [
  {title:'值班记录 / 014',body:'你是否确信，门外的脚步声\n只属于一个人？',kind:'door'},
  {title:'空间辨认',body:'门被关上之后，\n房间会变得更安全吗？',kind:'door'},
  {title:'记忆校验',body:'你能确定，\n刚才坐下的是你自己吗？',kind:'chair'},
  {title:'盲区记录',body:'一个从来不说话的声音，\n也可能在等你的回答吗？',kind:'wave'},
  {title:'再次确认',body:'你愿意为了看清前方，\n让身后留在黑暗中吗？',kind:'silhouette'},
  {title:'观察协议',body:'左侧的轮廓在你移开视线时移动。\n请先注视它，再回来答题。\n你已经看见它了吗？',kind:'eye',requireObserved:true},
  {title:'重复记录',body:'如果你的呼吸来自另一张椅子，\n你还会继续坐着吗？',kind:'chair'},
  {title:'信任校验',body:'一段录像记得你忘记的事。\n你会相信录像，比相信自己更多吗？',kind:'wave'},
  {title:'终止许可',body:'如果离开房间会让它消失，\n你仍然需要回头确认吗？',kind:'door'},
  {title:'结案记录',body:'请保持安静，等待记录结束。\n\n你是否认为，自己仍然安全？',kind:'eye',minimum:6}
];
originalSlides.forEach((slide,index)=>slide.textureKey=String(index+1).padStart(2,'0'));
export const slides = [
  abstractSlides[0],originalSlides[0],abstractSlides[1],originalSlides[1],
  abstractSlides[2],originalSlides[2],abstractSlides[3],originalSlides[3],
  abstractSlides[4],originalSlides[4],originalSlides[5],abstractSlides[5],
  originalSlides[6],abstractSlides[6],originalSlides[7],abstractSlides[7],
  originalSlides[8],originalSlides[9]
];
export const THREAT_START=slides.findIndex(slide=>slide.requireObserved);

export class TestSession {
  constructor(){this.reset();}
  reset(){this.phase='intro';this.index=0;this.elapsed=0;this.slideTime=0;this.lock=0;this.danger=0;this.pendingPressure=0;this.observed=false;this.focus=0;this.answers=[];this.result=null;}
  start(){this.reset();this.phase='playing';this.lock=2.68;}
  get activeThreat(){return this.phase==='playing'&&this.index>=THREAT_START;}
  update(delta,lookingAtThreat){if(this.phase!=='playing')return;const dt=Math.min(Math.max(delta,0),.1);this.elapsed+=dt;this.slideTime+=dt;this.lock=Math.max(0,this.lock-dt);if(this.index>=THREAT_START){if(lookingAtThreat){this.focus+=dt;if(this.focus>.45)this.observed=true;}else {this.focus=0;const pressure=Math.min(this.pendingPressure,.05*dt);this.pendingPressure-=pressure;this.danger=Math.min(1,this.danger+.0108*dt+pressure);}if(this.danger>=1)this.finish('lost');}}
  answer(value){if(this.phase!=='playing'||this.lock>0)return 'wait';const slide=slides[this.index];if(slide.requireObserved&&!this.observed)return 'observe';if(this.slideTime<(slide.minimum??1.8))return 'wait';this.answers.push(Boolean(value));if(this.index===slides.length-1){this.finish('complete');return 'complete';}this.index++;this.slideTime=0;this.lock=2.68;if(this.index===THREAT_START)this.danger=.06;else if(this.index>THREAT_START)this.pendingPressure+=value?.065:.035;return 'next';}
  finish(result){this.result=result;this.phase='ended';}
  pause(){if(this.phase==='playing')this.phase='paused';}
  resume(){if(this.phase==='paused')this.phase='playing';}
}
