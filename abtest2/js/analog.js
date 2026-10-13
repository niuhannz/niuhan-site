import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { Pass, FullScreenQuad } from 'three/addons/postprocessing/Pass.js';

// The magnetic-tape stage below is a compact GLSL adaptation of PowerShot's
// stAnalogVhs(), not an installation of its WebGPU/TSL package. MIT attribution:
// https://github.com/cl0nazepamm/powershot-threejs/blob/0f419f1b24b0170d9856180f96c0c080e11b295f/src/pipeline.js
// The complete original notice is distributed in licenses/powershot-threejs-MIT.txt.

const vertexShader = 'varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}';

// The retained image is a real previous-frame texture, not another noise layer.
// Only bright phosphor lingers, so camera movement does not smear the dark room.
class PhosphorPass extends Pass {
  constructor() {
    super();
    const options={minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,depthBuffer:false,stencilBuffer:false};
    this.previous=new THREE.WebGLRenderTarget(1,1,options);
    this.next=new THREE.WebGLRenderTarget(1,1,options);
    this.valid=false;
    this.step=0;
    this.amount=.85;
    this.reduced=0;
    this.accumulate=new THREE.ShaderMaterial({
      name:'CRT phosphor memory',depthTest:false,depthWrite:false,blending:THREE.NoBlending,
      uniforms:{current:{value:null},history:{value:null},decay:{value:new THREE.Vector3()},ready:{value:0}},
      vertexShader,
      fragmentShader:`
        uniform sampler2D current,history;
        uniform vec3 decay;
        uniform float ready;
        varying vec2 vUv;
        void main(){
          vec3 fresh=texture2D(current,vUv).rgb;
          vec3 old=texture2D(history,vUv).rgb*decay*ready;
          gl_FragColor=vec4(max(fresh,old),1.);
        }`
    });
    this.present=new THREE.ShaderMaterial({
      name:'CRT phosphor present',depthTest:false,depthWrite:false,blending:THREE.NoBlending,
      uniforms:{current:{value:null},history:{value:null},strength:{value:0}},
      vertexShader,
      fragmentShader:`
        uniform sampler2D current,history;
        uniform float strength;
        varying vec2 vUv;
        void main(){
          vec3 fresh=texture2D(current,vUv).rgb;
          vec3 old=texture2D(history,vUv).rgb;
          float light=max(old.r,max(old.g,old.b));
          vec3 glow=max(old-fresh,0.)*smoothstep(.30,.86,light);
          gl_FragColor=vec4(fresh+glow*strength,1.);
        }`
    });
    this.quad=new FullScreenQuad(this.accumulate);
  }
  setSize(width,height) {
    // Bound memory cost on Retina displays while keeping Chinese text sharp.
    const scale=Math.min(1,1600/width,1000/height);
    this.previous.setSize(Math.max(1,Math.round(width*scale)),Math.max(1,Math.round(height*scale)));
    this.next.setSize(this.previous.width,this.previous.height);
    this.valid=false;
  }
  render(renderer,writeBuffer,readBuffer) {
    if(!this.valid||this.step>0) {
      this.accumulate.uniforms.current.value=readBuffer.texture;
      this.accumulate.uniforms.history.value=this.previous.texture;
      this.accumulate.uniforms.ready.value=this.valid?1:0;
      const step=Math.max(.00001,this.step);
      this.accumulate.uniforms.decay.value.set(Math.exp(-step/.062),Math.exp(-step/.084),Math.exp(-step/.071));
      this.quad.material=this.accumulate;
      renderer.setRenderTarget(this.next);
      this.quad.render(renderer);
      [this.previous,this.next]=[this.next,this.previous];
      this.valid=true;
    }
    this.present.uniforms.current.value=readBuffer.texture;
    this.present.uniforms.history.value=this.previous.texture;
    this.present.uniforms.strength.value=.30*this.amount*(1-this.reduced);
    this.quad.material=this.present;
    renderer.setRenderTarget(this.renderToScreen?null:writeBuffer);
    this.quad.render(renderer);
  }
  dispose() {
    this.previous.dispose();this.next.dispose();
    this.accumulate.dispose();this.present.dispose();this.quad.dispose();
  }
}

export function createAnalog(renderer,scene,camera) {
  const composer=new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene,camera));
  composer.addPass(new OutputPass());
  const phosphor=new PhosphorPass();
  composer.addPass(phosphor);
  const pass=new ShaderPass({
    name:'VHS magnetic tape and unstable CRT signal',
    uniforms:{
      tDiffuse:{value:null},time:{value:0},amount:{value:.85},reduced:{value:0},danger:{value:0},
      resolution:{value:new THREE.Vector2(1280,720)},signal:{value:new THREE.Vector2(640,360)},
      tapeChromaBleed:{value:1.05},tapeTracking:{value:.80},tapeDropouts:{value:.70},
      tapeHeadSwitch:{value:.62},tapeNoise:{value:.72},tapeLumaSoftness:{value:.38},
      fault:{value:0},faultProgress:{value:0},faultSeed:{value:1},faultY:{value:.3},faultWidth:{value:.035}
    },
    vertexShader,
    fragmentShader:`
      uniform sampler2D tDiffuse;
      uniform float time,amount,reduced,danger,fault,faultProgress,faultSeed,faultY,faultWidth;
      uniform float tapeChromaBleed,tapeTracking,tapeDropouts,tapeHeadSwitch,tapeNoise,tapeLumaSoftness;
      uniform vec2 resolution,signal;
      varying vec2 vUv;
      // PowerShot's bounded hashes avoid large sine arguments making diagonal
      // grain patterns at high signal coordinates on mobile GPU precision.
      float hash(vec2 p){
        vec3 a=fract(vec3(p.x,p.y,p.x)*.1031);
        a+=dot(a,a.yzx+33.33);
        return fract((a.x+a.y)*a.z);
      }
      float hash3(vec3 p){
        vec3 a=fract(p*.1031);
        a+=dot(a,a.zyx+31.32);
        return fract((a.x+a.y)*a.z);
      }
      vec3 sampleSignal(vec2 p){return texture2D(tDiffuse,clamp(p,vec2(.001),vec2(.999))).rgb;}
      vec3 rgbToYcc(vec3 c){
        return vec3(dot(c,vec3(.299,.587,.114)),dot(c,vec3(-.168736,-.331264,.5)),dot(c,vec3(.5,-.418688,-.081312)));
      }
      vec3 yccToRgb(vec3 c){
        return vec3(c.x+1.402*c.z,c.x-.344136*c.y-.714136*c.z,c.x+1.772*c.y);
      }
      vec3 tapeSample(vec2 uv,vec2 texel,float dx){return rgbToYcc(sampleSignal(uv+vec2(dx*texel.x,0.)));}
      void main(){
        float strength=clamp(amount,0.,1.);
        if(strength<=0.){gl_FragColor=texture2D(tDiffuse,vUv);return;}
        float motion=1.-step(.5,reduced);
        float field=floor(time*59.94)*motion;
        float grainFrame=floor(time*23.976)*motion;
        vec2 pixel=1./max(resolution,vec2(1.));
        vec2 tapePixel=1./max(signal,vec2(1.));
        vec2 q=vUv*2.-1.;
        // A small glass warp preserves the native projection's straight edges.
        vec2 uv=vUv+q*dot(q,q)*.0012*strength;

        // Short local loss of horizontal sync: a band drifts through the image,
        // briefly pulling rows sideways. There is no repeated full-frame strobe.
        float centre=fract(faultY+faultProgress*.24);
        float distanceToBand=abs(uv.y-centre);
        float band=1.-smoothstep(faultWidth*.25,faultWidth,distanceToBand);
        float faultLevel=fault*strength*motion*(1.+danger*.22);
        float row=floor(uv.y*signal.y);
        float rowNoise=hash(vec2(row,field+faultSeed))-.5;
        uv.x+=band*faultLevel*(sin(faultSeed*3.1+faultProgress*8.)*.038+rowNoise*.018);
        uv.y+=sin(faultProgress*5.8+faultSeed)*faultLevel*.0022;
        uv+=vec2(sin(field*1.73),cos(field*2.31))*.00010*strength*motion;

        // VHS time-base error: 2-line fields are correlated across 4-line cells.
        // Smooth interpolation in time plus quarter-pixel timing steps gives
        // short stepped tape edges rather than broad liquid sine deformation.
        float tapeRow=floor((1.-vUv.y)*signal.y);
        float fieldLine=floor(tapeRow*.5);
        float trackingCoord=fieldLine*.5;
        float trackingCell=floor(trackingCoord);
        float trackingFrac=fract(trackingCoord);
        float trackingEase=trackingFrac*trackingFrac*(3.-2.*trackingFrac);
        float trackingTime=time*4.7952*motion;
        float trackingTimeCell=floor(trackingTime);
        float trackingTimeFrac=fract(trackingTime);
        float trackingTimeEase=trackingTimeFrac*trackingTimeFrac*(3.-2.*trackingTimeFrac);
        float trackingNow=mix(hash(vec2(trackingCell,trackingTimeCell)+151.),hash(vec2(trackingCell+1.,trackingTimeCell)+151.),trackingEase);
        float trackingNext=mix(hash(vec2(trackingCell,trackingTimeCell+1.)+151.),hash(vec2(trackingCell+1.,trackingTimeCell+1.)+151.),trackingEase);
        float lineWave=floor((mix(trackingNow,trackingNext,trackingTimeEase)-.5)*12.+.5)*.25;
        float tapeRowNoise=hash(vec2(tapeRow*.37,floor(field*1.073))+13.7)-.5;

        // The source uses top-down image coordinates. In this WebGL fullscreen
        // quad vUv is bottom-up: flip only the tape's vertical coordinate so the
        // magnetic-head switch stays in a narrow region at the physical bottom.
        float tapeY=1.-vUv.y;
        float tapeTime=time*motion;
        float headDrift=sin(tapeTime*1.259)*.010+(hash(vec2(floor(tapeTime*2.218),8.1))-.5)*.008;
        float headY=clamp(.922+headDrift,.902,.942);
        float belowHead=tapeY-headY;
        float afterHead=step(0.,belowHead);
        float headAttack=clamp(belowHead/.007,0.,1.);
        float headFalloff=exp(-max(0.,belowHead)*55.)*afterHead;
        float headTail=(1.-clamp(belowHead/.065,0.,1.))*afterHead;
        float headXFeather=smoothstep(.012,.055,vUv.x)*(1.-smoothstep(.945,.988,vUv.x));
        float headMask=headAttack*(headFalloff*.8+headTail*.2)*headXFeather*clamp(tapeHeadSwitch,0.,2.)*strength*motion;
        float headNoise=hash(vec2(fieldLine*.73,floor(field*1.739))+91.3)-.5;
        float headBreak=step(.58,hash(vec2(fieldLine*1.91,floor(field*.19))+117.));
        float headPhaseShift=headNoise*24.+headBreak*headNoise*20.;
        float tracking=clamp(tapeTracking,0.,2.);
        float jitterPixels=lineWave*tracking*.85+tapeRowNoise*tracking*.55;
        jitterPixels+=headPhaseShift*headMask*tracking+headNoise*headMask*tracking*6.;
        uv.x+=jitterPixels*tapePixel.x*strength*motion;

        // Nine horizontal texture reads total. Y keeps a clean center, mild
        // low-pass and preemphasis; Cb/Cr gets a wider one-sided delay filter.
        // This creates resin-color bleed without splitting black Chinese text
        // into separate red/blue copies or blurring the whole frame uniformly.
        vec3 base=tapeSample(uv,tapePixel,0.);
        vec3 left=tapeSample(uv,tapePixel,-1.);
        vec3 right=tapeSample(uv,tapePixel,1.);
        vec3 farLeft=tapeSample(uv,tapePixel,-3.);
        vec3 farRight=tapeSample(uv,tapePixel,3.);
        vec3 veryLeft=tapeSample(uv,tapePixel,-7.);
        vec3 veryRight=tapeSample(uv,tapePixel,7.);
        float bleed=clamp(tapeChromaBleed,0.,2.);
        float chromaDelayPx=1.6+bleed*3.2+faultLevel*1.5;
        vec3 delayed=tapeSample(uv,tapePixel,chromaDelayPx);
        vec3 wideDelayed=tapeSample(uv,tapePixel,chromaDelayPx+bleed*5.);
        vec2 chromaBlur=(left.yz+base.yz*2.+right.yz+delayed.yz*2.+wideDelayed.yz)/7.;
        float lumaBlur=(veryLeft.x+farLeft.x*2.+left.x*3.+base.x*4.+right.x*3.+farRight.x*2.+veryRight.x)/16.;
        float lumaHigh=base.x-lumaBlur;
        float y=mix(base.x,lumaBlur+lumaHigh*.52,clamp(tapeLumaSoftness,0.,.7)*strength);
        float ring2=(farLeft.x-left.x+right.x-farRight.x)*.16+(veryLeft.x-farLeft.x+farRight.x-veryRight.x)*.08+(right.x-left.x)*.23;
        y+=ring2*.11*strength;
        vec2 chroma=mix(base.yz,chromaBlur,clamp(bleed*.66,0.,.92)*strength);
        float phaseNoise=(tapeRowNoise*bleed*.11+headNoise*headMask*.65)*strength*motion;
        float phaseSin=sin(phaseNoise),phaseCos=cos(phaseNoise);
        chroma=vec2(chroma.x*phaseCos-chroma.y*phaseSin,chroma.x*phaseSin+chroma.y*phaseCos);

        float light=max(0.,base.x);
        float blackProtect=smoothstep(.002,.026,light);
        float tapeNoiseAmount=clamp(tapeNoise,0.,2.);
        vec2 chromaNoise=vec2(hash3(vec3(floor(vUv*signal),field+121.)),hash3(vec3(floor(vUv*signal),field+177.)))-.5;
        chroma+=chromaNoise*.008*tapeNoiseAmount*strength*blackProtect;

        // Dropouts affect a few field rows and only finite horizontal segments.
        // Their line/segment lifetime is roughly 1/8 second; static is local,
        // not a grey noise overlay filling every near-black room pixel.
        float dropoutFrame=floor(field*.13);
        float dropoutLineSeed=hash3(vec3(fieldLine*2.37,dropoutFrame,73.));
        float segmentWidth=18.+hash(vec2(fieldLine,dropoutFrame)+19.)*52.;
        float segment=floor(vUv.x*signal.x/segmentWidth);
        float segmentSeed=hash3(vec3(segment*5.37+dropoutLineSeed*17.,fieldLine*3.11,dropoutFrame+73.));
        float dropout=clamp(tapeDropouts,0.,2.);
        float lineGate=step(1.-clamp(dropout*.050+faultLevel*.035,0.,.16),dropoutLineSeed);
        float segmentGate=step(1.-clamp(dropout*.32+faultLevel*.14,0.,.72),segmentSeed);
        float segmentPos=fract(vUv.x*signal.x/segmentWidth+dropoutLineSeed);
        float segmentEnvelope=smoothstep(.04,.18,segmentPos)*(1.-smoothstep(.74,.96,segmentPos));
        float dropoutBand=lineGate*segmentGate*segmentEnvelope*strength*motion;
        chroma*=1.-dropoutBand*.86;
        float dropoutStatic=hash3(vec3(vUv.x*signal.x*.91,tapeRow*1.73,field+12.))-.5;
        y+=dropoutBand*(dropoutStatic*.085+.024)*tapeNoiseAmount*mix(.38,1.,blackProtect);
        float headStatic=hash3(vec3(floor(vUv*signal),field+319.))-.5;
        y=mix(y,y*.75+headStatic*.085*tapeNoiseAmount,headMask*.72);
        // Only narrow damaged tape carries a small independent black-level
        // energy. The room's undamaged true blacks remain true blacks.
        y+=headMask*max(0.,headStatic)*.030*tapeNoiseAmount;
        chroma=mix(chroma,chroma*.24+vec2(headStatic*.018,headNoise*.012),headMask*.65);
        vec3 color=max(yccToRgb(vec3(y,chroma)),0.);
        // A restrained horizontal glow reuses the broad taps, rather than four
        // extra blur fetches or a second bright echo over the actual projection.
        float haloLight=(veryLeft.x+veryRight.x)*.5;
        color+=max(haloLight-.70,0.)*vec3(1.02,1.,.97)*.07*strength;

        // Native matching 360-line beam, independent of CSS pixels and DPR.
        // Its energy-neutral pattern preserves near-black room detail. The
        // derivative filter removes unresolved rows on a small phone viewport.
        float rowPhase=uv.y*signal.y;
        float lineContrast=1./(1.+max(0.,fwidth(rowPhase)-.7)*1.7);
        light=dot(max(color,0.),vec3(.2126,.7152,.0722));
        float scan=cos(rowPhase*6.2831853)*.075*strength*lineContrast;
        color*=1.+scan*mix(.45,1.,smoothstep(.02,.32,light));
        float fieldPattern=cos(floor(rowPhase)*3.14159265+mod(field,2.)*3.14159265);
        color*=1.+fieldPattern*.007*strength*lineContrast;

        // The phosphor grille is weaker than the beam. Filter its high frequency
        // as well, avoiding colored moire in the projection's small type.
        float triad=uv.x*signal.x*3.;
        vec3 grille=vec3(sin(triad*6.2831853),sin(triad*6.2831853+2.094),sin(triad*6.2831853+4.189));
        float grilleFilter=1./(1.+max(0.,fwidth(triad)-.7)*2.);
        color*=1.+grille*.003*strength*grilleFilter;

        // Grain is signal modulation, not an additive grey film over the room.
        // It vanishes in true black and settles into a static texture when the
        // user enables reduced motion. Temporal rates stop with visualTime.
        float noise=hash(floor(vUv*signal)+grainFrame)-.5;
        float fineNoise=hash(floor(vUv*resolution)+grainFrame*1.7)-.5;
        blackProtect=smoothstep(.002,.025,light);
        float grainGain=(.015+.020*(1.-smoothstep(.12,.55,light)))*blackProtect;
        color+=(noise*.78+fineNoise*.22)*grainGain*strength;
        color+=band*faultLevel*rowNoise*.065*blackProtect;
        color*=1.-band*faultLevel*.22;

        // A broad, dark mains-hum bar rolls slowly through normal playback.
        // It modulates the image rather than raising blacks or flashing white.
        // Reduced motion freezes its position and leaves the beam pattern intact.
        float humTime=time*motion;
        float humCentre=fract(.31+humTime*.073+sin(humTime*.47)*.035);
        float humDistance=abs(vUv.y-humCentre);
        humDistance=min(humDistance,1.-humDistance);
        float humBand=1.-smoothstep(.042,.155,humDistance);
        float humDepth=.10+sin(humTime*.61)*.018;
        color*=1.-humBand*humDepth*strength;
        float wobble=sin(time*5.33)*.026+sin(time*13.7+1.3)*.010;
        float fieldNoise=(hash(vec2(field,18.7))-.5)*.009;
        color*=1.+(wobble+fieldNoise)*strength*motion-faultLevel*.085;
        vec2 vignette=(uv-.5)*vec2(1.08,1.);
        color*=1.-.20*dot(vignette,vignette)*strength;
        gl_FragColor=vec4(max(color,0.),1.);
      }`
  });
  composer.addPass(pass);

  let clock=0,lastTime=null,nextFault=2.3+Math.random()*2.8,event=null,danger=0,lastReduced=false;
  let pixelRatio=renderer.getPixelRatio();
  function scheduleFault(time) {
    // Arrival time is chosen once in seconds, never by a per-frame probability.
    nextFault=time+1.8+Math.min(8,-Math.log(Math.max(.0001,1-Math.random()))*(3.0-danger*.65));
  }
  function disturb(strength=.6,duration=.34) {
    const weight=THREE.MathUtils.clamp(Number.isFinite(strength)?strength:.6,0,1);
    if(event&&clock-event.start<event.duration&&event.strength>weight)return;
    event={start:clock,duration:Math.max(.08,Number.isFinite(duration)?duration:.34),strength:weight,seed:1+Math.random()*100,y:.08+Math.random()*.8,width:.018+Math.random()*.035};
    scheduleFault(clock);
  }
  const api={
    composer,pass,
    trigger(kind='button') {disturb(kind==='slide'?1:.76,kind==='slide'?.56:.36);},
    disturb(strength=.6,duration=.34) {disturb(strength,duration);},
    setDanger(value) {
      danger=THREE.MathUtils.clamp(Number.isFinite(value)?value:0,0,1);
      pass.uniforms.danger.value=danger;
    },
    reset() {
      clock=0;lastTime=null;event=null;danger=0;
      phosphor.valid=false;phosphor.step=0;
      pass.uniforms.time.value=0;
      pass.uniforms.danger.value=0;
      pass.uniforms.fault.value=0;
      pass.uniforms.faultProgress.value=0;
      scheduleFault(0);
    },
    render(time,dt) {
      const now=Number.isFinite(time)?time:clock;
      const isReduced=pass.uniforms.reduced.value>=.5;
      if(isReduced!==lastReduced) {
        // No old bright ghost or half-finished tear appears when this changes.
        event=null;phosphor.valid=false;scheduleFault(now);lastReduced=isReduced;
      }
      if(lastTime!==null&&now<lastTime) {
        event=null;phosphor.valid=false;scheduleFault(now);
      }
      const elapsed=lastTime===null?0:Math.max(0,now-lastTime);
      clock=now;lastTime=now;
      if(!isReduced&&elapsed>0&&now>=nextFault)disturb(.44+Math.random()*.28+danger*.10,.28+Math.random()*.22);
      let envelope=0,progress=0;
      if(event) {
        progress=THREE.MathUtils.clamp((now-event.start)/event.duration,0,1);
        envelope=event.strength*THREE.MathUtils.smoothstep(progress,0,.12)*(1-THREE.MathUtils.smoothstep(progress,.30,1));
        pass.uniforms.faultSeed.value=event.seed;
        pass.uniforms.faultY.value=event.y;
        pass.uniforms.faultWidth.value=event.width;
        if(progress>=1)event=null;
      }
      pass.uniforms.time.value=now;
      pass.uniforms.fault.value=envelope;
      pass.uniforms.faultProgress.value=progress;
      phosphor.step=isReduced?0:Math.min(.25,elapsed);
      phosphor.amount=pass.uniforms.amount.value;
      phosphor.reduced=isReduced?1:0;
      composer.render(dt);
    },
    get diagnostics() {
      const amount=THREE.MathUtils.clamp(pass.uniforms.amount.value,0,1);
      const reduced=pass.uniforms.reduced.value>=.5;
      return Object.freeze({
        clock,strength:amount,reduced,danger,
        fault:pass.uniforms.fault.value*amount*(reduced?0:1),
        faultProgress:pass.uniforms.faultProgress.value,
        eventActive:!!event&&!reduced&&amount>0,eventStrength:event?.strength??0,eventDuration:event?.duration??0,
        phosphorStrength:.30*amount*(reduced?0:1),
        scanContrast:.075*amount,humDepth:.10*amount,
        tape:Object.freeze({
          implementation:'PowerShot stAnalogVhs GLSL adaptation',sourceCommit:'0f419f1b24b0170d9856180f96c0c080e11b295f',
          enabled:amount>0,signalWidth:pass.uniforms.signal.value.x,signalHeight:pass.uniforms.signal.value.y,
          textureTaps:9,chromaDelayPixels:(1.6+Math.max(0,Math.min(2,pass.uniforms.tapeChromaBleed.value))*3.2),
          chromaBlend:Math.min(.92,Math.max(0,Math.min(2,pass.uniforms.tapeChromaBleed.value))*.66)*amount,
          lumaSoftness:Math.min(.7,Math.max(0,pass.uniforms.tapeLumaSoftness.value))*amount,
          tracking:Math.max(0,Math.min(2,pass.uniforms.tapeTracking.value))*amount*(reduced?0:1),
          rowGroupLines:4,headSwitch:Math.max(0,Math.min(2,pass.uniforms.tapeHeadSwitch.value))*amount*(reduced?0:1),
          headSwitchBottomFraction:.078,dropouts:Math.max(0,Math.min(2,pass.uniforms.tapeDropouts.value))*amount*(reduced?0:1),
          temporal:!reduced&&amount>0,field:Math.floor(clock*59.94)*(reduced?0:1),dropoutFrame:Math.floor(Math.floor(clock*59.94)*(reduced?0:1)*.13)
        })
      });
    },
    resize(w,h) {
      const width=Math.max(1,w),height=Math.max(1,h);
      const nextPixelRatio=renderer.getPixelRatio();
      if(nextPixelRatio!==pixelRatio) {
        pixelRatio=nextPixelRatio;composer.setPixelRatio(pixelRatio);
      }
      composer.setSize(width,height);
      pass.uniforms.resolution.value.set(Math.round(width*pixelRatio),Math.round(height*pixelRatio));
      pass.uniforms.signal.value.set(360*width/height,360);
    },
    dispose(){phosphor.dispose();pass.dispose();composer.dispose();}
  };
  return api;
}
