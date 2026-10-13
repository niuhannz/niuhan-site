import * as THREE from 'three';
import {createRoom} from './scene.js';
import {createAnalog} from './analog.js';
import {RoomAudio} from './audio.js';
import {TestSession,slides,THREAT_START} from './session.js';
import {fitRoomViewport} from './viewport.js';

const $=id=>document.getElementById(id), canvas=$('view');
const session=new TestSession(), audio=new RoomAudio();
const settings={grain:.85,volume:.65,reduced:matchMedia('(prefers-reduced-motion: reduce)').matches};
const neutral=.5*Math.PI/180, clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const keys=new Set(), ray=new THREE.Raycaster(), pointer=new THREE.Vector2(), direction=new THREE.Vector3(), tvDirection=new THREE.Vector3(), listenerRight=new THREE.Vector3();
const threatStart=new THREE.Vector3(-2.75,1,-2.35), threatEnd=new THREE.Vector3(-1.05,1,1.4);
let renderer,scene,camera,room,analog,ready=false;
let yaw=0,pitch=neutral,targetYaw=0,targetPitch=neutral,drag=null,focused=false;
let lastTime=performance.now(),visualTime=0,knockTime=0,noteUntil=0,endingShown=false,diagnosticTime=0;
let viewport=null,resizePending=false;
const touchQuery=matchMedia('(pointer: coarse)');
function sound(action,...args){try{return audio[action](...args);}catch{return false;}}
function note(text,seconds=2.8){$('live-note').textContent=text;noteUntil=performance.now()+seconds*1000;}
function syncUI(){document.body.dataset.phase=session.phase;$('intro').hidden=session.phase!=='intro';$('pause').hidden=session.phase!=='paused';$('ending').hidden=session.phase!=='ended';$('touch-controls').hidden=session.phase!=='playing';diagnostics();}
function drawCurrent(animate=true){room.drawSlide({...slides[session.index],index:session.index+1},{animate});if(animate)analog.trigger('slide');}
function clearView(){keys.clear();drag=null;focused=false;endingShown=false;knockTime=0;yaw=targetYaw=0;pitch=targetPitch=neutral;visualTime=0;for(const button of room.buttons){button.userData.pressedUntil=0;button.position.y=button.userData.restY;}analog.reset();room.threat.visible=false;room.threat.position.copy(threatStart);}
function reset(){session.reset();clearView();room.drawSlide({textureKey:'Start',kind:'intro'},{animate:false});sound('pause',true);syncUI();$('live-note').textContent='';}
async function start(){
  if(!ready||session.phase==='playing')return;
  sound('setVolume',settings.volume);sound('pause',false);
  // Unlock audio from the real user gesture before awaiting decoded buffers.
  const started=audio.start();session.start();clearView();drawCurrent(true);sound('slide');syncUI();canvas.focus();
  note('先观察画面，再用红／黄按钮判断 · 拖动环顾 · 空格看左侧',5);
  if(!await started)note('点击按钮可再次启动声音。',3);
  canvas.dataset.audioState=audio.diagnostics.state;
}
function pressButton(value){
  const b=room.buttons.find(b=>b.userData.answer===value);if(b)b.userData.pressedUntil=visualTime+.12;
  analog.trigger('button');Promise.resolve(sound('click',value)).then(()=>{canvas.dataset.audioState=audio.diagnostics.state;canvas.dataset.buttonSounds=String(audio.diagnostics.buttonCount);diagnostics();});
}
function answer(value){
  if(session.phase!=='playing')return;pressButton(value);if(room.transitionActive)return;
  if(session.activeThreat&&focused){note('先看电视，再作答。',2);return;}
  const result=session.answer(value);
  if(result==='observe'){note('按空格，先看清左侧的轮廓。',3);sound('knock',-.8);}
  else if(result==='wait')note(session.index===slides.length-1?'记录仍在进行。':'请先看完这张画面。',1.3);
  else if(result==='next'){sound('slide');drawCurrent(true);if(session.index===THREAT_START)sound('knock',-.8);}
  diagnostics();
}
function pause(){if(!ready||session.phase!=='playing')return;session.pause();keys.clear();drag=null;sound('pause',true);syncUI();}
async function resume(){if(session.phase!=='paused')return;session.resume();sound('pause',false);syncUI();canvas.focus();await audio.start();}
function turnLeft(){
  if(session.phase!=='playing')return;if(Math.abs(targetYaw)>.15){targetYaw=0;targetPitch=neutral;return;}
  const d=room.threat.position.clone().add(new THREE.Vector3(0,.48,0)).sub(camera.position);
  targetYaw=Math.atan2(-d.x,-d.z);targetPitch=Math.atan2(d.y,Math.hypot(d.x,d.z));
}
function turnTelevision(){
  if(session.phase!=='playing'||!room.tvSource)return;
  const d=tvDirection.copy(room.tvSource).sub(camera.position);
  targetYaw=clamp(Math.atan2(-d.x,-d.z),-2.7,2.7);targetPitch=clamp(Math.atan2(d.y,Math.hypot(d.x,d.z)),-.785,.785);
}
function showEnd(){endingShown=true;keys.clear();drag=null;targetYaw=0;targetPitch=neutral;room.drawSlide({textureKey:session.result==='lost'?'Lost':'Complete'},{animate:false});$('end-description').textContent=session.result==='lost'?'观察中断。':'回应已封存。';$('live-note').textContent='';sound('threat',0);sound('pause',true);syncUI();}
function resize(){
  const rect=canvas.parentElement.getBoundingClientRect();
  viewport=fitRoomViewport(rect.width,rect.height,{touch:touchQuery.matches||rect.width<=600,dpr:devicePixelRatio});
  const {width:w,height:h,aspect,fov,cameraZ,pixelRatio,layout,input}=viewport;
  document.body.dataset.layout=layout;document.body.dataset.input=input;
  renderer.setPixelRatio(pixelRatio);renderer.setSize(w,h,false);
  camera.aspect=aspect;camera.fov=fov;camera.position.set(0,1.3,cameraZ);camera.updateProjectionMatrix();analog.resize(w,h);
  diagnostics();
}
function scheduleResize(){if(resizePending)return;resizePending=true;requestAnimationFrame(()=>{resizePending=false;if(renderer&&analog)resize();});}
function isFullscreen(){return Boolean(document.fullscreenElement||document.webkitFullscreenElement);}
function syncFullscreen(){
  const active=isFullscreen(),button=$('fullscreen-toggle');
  document.body.dataset.fullscreen=String(active);button.setAttribute('aria-pressed',String(active));
  button.setAttribute('aria-label',active?'退出全屏':'进入全屏');button.title=active?'退出全屏 · Alt + Enter':'进入全屏 · Alt + Enter';
  button.querySelector('.fullscreen-label').textContent=active?'退出全屏':'全屏';scheduleResize();
}
async function toggleFullscreen(){
  try {
    if(isFullscreen()) {const exit=document.exitFullscreen||document.webkitExitFullscreen;await exit.call(document);}
    else {const enter=document.documentElement.requestFullscreen||document.documentElement.webkitRequestFullscreen;
      if(!enter){note('页面已铺满窗口；此浏览器暂不支持全屏。',5);return;}
      await enter.call(document.documentElement);
    }
    syncFullscreen();
  } catch {note('请在独立浏览器标签页中点击全屏。',5);}
}
function hitAt(x,y){const r=canvas.getBoundingClientRect();pointer.set((x-r.left)/r.width*2-1,-(y-r.top)/r.height*2+1);ray.setFromCamera(pointer,camera);return ray.intersectObjects(room.buttons,true)[0];}
function buttonFor(hit){let o=hit?.object;while(o&&!('answer'in o.userData))o=o.parent;return o;}
function diagnostics(){if(!renderer)return;canvas.dataset.testState=JSON.stringify({...window.__quietTest,analog:analog?.diagnostics??null,atmosphere:room?.atmosphere??null});canvas.dataset.readable=String(session.phase==='playing'&&session.lock<=0&&!room.transitionActive&&session.slideTime>=(slides[session.index].minimum??1.8));canvas.dataset.observed=String(session.observed);}
function frame(now){
  requestAnimationFrame(frame);const dt=Math.min((now-lastTime)/1000,.05);lastTime=now;const playing=session.phase==='playing';
  if(playing||session.phase==='intro')visualTime+=dt;
  if(playing){
    if(keys.has('ArrowLeft')||keys.has('KeyA'))targetYaw+=dt*1.13;if(keys.has('ArrowRight')||keys.has('KeyD'))targetYaw-=dt*1.13;
    if(keys.has('ArrowUp')||keys.has('KeyW'))targetPitch+=dt*.87;if(keys.has('ArrowDown')||keys.has('KeyS'))targetPitch-=dt*.87;
    targetYaw=clamp(targetYaw,-2.7,2.7);targetPitch=clamp(targetPitch,-.785,.785);
  }
  if(session.phase!=='paused'){const damping=1-Math.exp(-dt*9);yaw+=(targetYaw-yaw)*damping;pitch+=(targetPitch-pitch)*damping;}
  camera.rotation.set(pitch,yaw,0,'YXZ');camera.updateMatrixWorld();
  if(room.tvSource){camera.getWorldDirection(direction);tvDirection.copy(room.tvSource).sub(camera.position).normalize();listenerRight.set(Math.cos(yaw),0,-Math.sin(yaw));sound('television',clamp(tvDirection.dot(listenerRight)*1.15,-.9,.9),.86+.14*Math.max(0,direction.dot(tvDirection)));}
  room.threat.visible=session.index>=THREAT_START&&session.phase!=='intro';room.threat.position.lerpVectors(threatStart,threatEnd,session.danger);
  let pan=-.8;
  if(room.threat.visible){camera.getWorldDirection(direction);const d=room.threat.position.clone().add(new THREE.Vector3(0,.48,0)).sub(camera.position).normalize();focused=direction.dot(d)>.952;pan=clamp(d.dot(new THREE.Vector3(Math.cos(yaw),0,-Math.sin(yaw)))*1.7,-.9,.9);room.threat.rotation.y=Math.atan2(camera.position.x-room.threat.position.x,camera.position.z-room.threat.position.z);}else focused=false;
  session.update(dt,focused);sound('threat',playing&&room.threat.visible?session.danger:0,pan);
  if(playing&&session.activeThreat){knockTime+=dt;if(knockTime>14){sound('knock',-.8);knockTime=0;}}
  if(session.phase==='ended'&&!endingShown)showEnd();if(now>noteUntil)$('live-note').textContent='';
  if(session.phase==='intro'||session.phase==='playing')room.update(visualTime,dt);
  const displayBlank=String((room.projection?.diagnostics.blank??room.projection?.diagnostics.shutter??0)>.85);if(canvas.dataset.displayBlank!==displayBlank){canvas.dataset.displayBlank=displayBlank;diagnostics();}
  analog.setDanger(session.danger);analog.render(visualTime,dt);const signalFault=String((analog.diagnostics?.fault??0)>.18);if(canvas.dataset.signalFault!==signalFault)canvas.dataset.signalFault=signalFault;
  if(now-diagnosticTime>250){diagnosticTime=now;diagnostics();}
}
async function init(){
  renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1;
  scene=new THREE.Scene();scene.background=new THREE.Color(0x020303);scene.fog=new THREE.FogExp2(0x050606,.012);
  camera=new THREE.PerspectiveCamera(35,innerWidth/innerHeight,.04,40);camera.rotation.order='YXZ';camera.position.set(0,1.3,2.5);
  room=createRoom(THREE,scene);room.setReducedMotion(settings.reduced);analog=createAnalog(renderer,scene,camera);
  analog.pass.uniforms.amount.value=settings.grain;analog.pass.uniforms.reduced.value=settings.reduced?1:0;$('reduced').checked=settings.reduced;
  resize();requestAnimationFrame(frame);await room.ready;ready=true;reset();$('loading').textContent='戴上耳机。按 Enter，或点击开始。';$('start').disabled=false;document.body.dataset.ready='true';
}
$('start').disabled=true;$('start').addEventListener('click',start);$('again').addEventListener('click',start);$('resume').addEventListener('click',resume);$('restart').addEventListener('click',reset);
$('settings-open').addEventListener('click',pause);$('look-left').addEventListener('click',turnLeft);$('look-tv').addEventListener('click',turnTelevision);$('touch-yes').addEventListener('click',()=>answer(true));$('touch-no').addEventListener('click',()=>answer(false));
$('fullscreen-toggle').addEventListener('click',toggleFullscreen);document.addEventListener('fullscreenchange',syncFullscreen);document.addEventListener('webkitfullscreenchange',syncFullscreen);syncFullscreen();
$('grain').addEventListener('input',e=>{settings.grain=Number(e.target.value)/100;analog.pass.uniforms.amount.value=settings.grain;$('grain-value').textContent=e.target.value+'%';});
$('volume').addEventListener('input',e=>{settings.volume=Number(e.target.value)/100;sound('setVolume',settings.volume);$('volume-value').textContent=e.target.value+'%';});
$('reduced').addEventListener('change',e=>{settings.reduced=e.target.checked;analog.pass.uniforms.reduced.value=settings.reduced?1:0;room.setReducedMotion(settings.reduced);});$('mute').addEventListener('change',e=>sound('setMuted',e.target.checked));
canvas.addEventListener('contextmenu',e=>e.preventDefault());
canvas.addEventListener('pointerdown',e=>{if(session.phase!=='playing')return;drag={button:e.button,x:e.clientX,y:e.clientY,lastX:e.clientX,lastY:e.clientY,moved:false};canvas.setPointerCapture(e.pointerId);});
canvas.addEventListener('pointermove',e=>{if(session.phase!=='playing')return;if(drag){const dx=e.clientX-drag.lastX,dy=e.clientY-drag.lastY;if(Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>5)drag.moved=true;if(drag.moved){targetYaw-=dx*.003;targetPitch=clamp(targetPitch-dy*.003,-.785,.785);}drag.lastX=e.clientX;drag.lastY=e.clientY;}else canvas.style.cursor=buttonFor(hitAt(e.clientX,e.clientY))?'pointer':'grab';});
canvas.addEventListener('pointerup',e=>{if(drag&&!drag.moved&&drag.button===0){const b=buttonFor(hitAt(e.clientX,e.clientY));if(b)answer(b.userData.answer);}drag=null;});canvas.addEventListener('pointercancel',()=>drag=null);
document.addEventListener('keydown',e=>{if(e.target instanceof HTMLInputElement)return;if(e.code==='Enter'&&e.altKey){e.preventDefault();if(!e.repeat)toggleFullscreen();return;}if(['Space','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.code))e.preventDefault();if(e.repeat){if(session.phase==='playing')keys.add(e.code);return;}if(e.code==='Enter'&&ready&&(session.phase==='intro'||session.phase==='ended')){start();return;}if(e.code==='Escape'){session.phase==='paused'?resume():pause();return;}if(e.code==='KeyR'&&ready){reset();return;}if(session.phase!=='playing')return;keys.add(e.code);if(e.code==='KeyQ')answer(true);if(e.code==='KeyE')answer(false);if(e.code==='Space')turnLeft();if(e.code==='KeyF')turnTelevision();});
document.addEventListener('keyup',e=>keys.delete(e.code));window.addEventListener('blur',()=>{keys.clear();drag=null;});document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});window.addEventListener('resize',scheduleResize);window.visualViewport?.addEventListener('resize',scheduleResize);touchQuery.addEventListener('change',scheduleResize);new ResizeObserver(scheduleResize).observe(canvas.parentElement);
Object.defineProperty(window,'__quietTest',{get:()=>({phase:session.phase,index:session.index,total:slides.length,question:{title:slides[session.index].title,body:slides[session.index].body,kind:slides[session.index].kind,textureKey:slides[session.index].textureKey},danger:session.danger,observed:session.observed,focused,answers:session.answers.length,yaw,pitch,slideTime:session.slideTime,visualTime,settings:{...settings},viewport:viewport?{...viewport,fullscreen:isFullscreen()}:null,rendererReady:ready,audio:audio.diagnostics,projection:room?.projection?.diagnostics??null,buttons:room?.buttons.map(b=>{const p=b.getWorldPosition(new THREE.Vector3()).project(camera);return{answer:b.userData.answer,x:Math.round((p.x+1)*(viewport?.width??innerWidth)/2),y:Math.round((1-p.y)*(viewport?.height??innerHeight)/2)};})??[],render:renderer?{calls:renderer.info.render.calls,triangles:renderer.info.render.triangles}:null})});
init().catch(error=>{console.error(error);$('loading').textContent='电视未能启动。请重新载入，或使用支持 WebGL 的浏览器。';$('start').disabled=true;});
