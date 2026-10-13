import {readingQuestions, readingSources} from './reading-questions.js';
/**
 * SignalRoom's original cards and visual judgments in an ageing curved CRT.
 * The historical projection API remains so session timing is unchanged.
 */
export const SLIDE_DURATION = 0.88;
const SWAP_TIME = 0.38;
const CARD_KEYS = ['Start', ...readingQuestions.map(q=>q.textureKey), 'Complete', 'Lost'];
const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const smooth = value => { const t = clamp(value); return t * t * (3 - 2 * t); };
const makeCard=()=>Object.assign(document.createElement('canvas'),{width:1024,height:768});
const font=(size,weight=500)=>`${weight} ${size}px Arial, "PingFang SC", "Microsoft YaHei", sans-serif`;
function centered(ctx,text,y,size=36,color='#d7dacb') {
  ctx.font=font(size);ctx.fillStyle=color;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,512,y,940);
}
function baseCard(ctx) {ctx.fillStyle='#090d0b';ctx.fillRect(0,0,1024,768);}
function paintStart(card) {
  const ctx=card.getContext('2d');baseCard(ctx);
  centered(ctx,'文化程度检定',130,72);centered(ctx,'READING ROOM / 02',204,27,'#8e9b8d');
  ctx.strokeStyle='#738270';ctx.lineWidth=2;ctx.strokeRect(94,278,836,344);
  centered(ctx,'这些字，看起来像中文。',334,40);centered(ctx,'请在时间耗尽前，读出里面的英文。',404,36);
  centered(ctx,'从左到右 · 从上到下 · 从外到里',476,32,'#a9b39e');
  centered(ctx,'红色 A / Q     黄色 B / E',546,36);centered(ctx,'徐冰 · 英文方块字书法作品片段',674,26,'#7d897b');
}
function paintQuestion(card,q,image,state={}) {
  const ctx=card.getContext('2d');baseCard(ctx);
  ctx.textBaseline='middle';ctx.textAlign='left';ctx.font=font(27);ctx.fillStyle='#adb8a4';ctx.fillText('文化程度检定',44,40);
  ctx.textAlign='right';ctx.fillText(`${String(q.number).padStart(2,'0')} / ${readingQuestions.length}`,980,40);
  const [sx,sy,sw,sh]=q.crop;
  // Show only the source's relevant lettering, maintaining its actual proportions.
  const frame={x:70,y:84,w:884,h:376};
  ctx.fillStyle=q.paper??'#c5baa2';ctx.fillRect(frame.x,frame.y,frame.w,frame.h);
  const scale=Math.min((frame.w-36)/sw,(frame.h-26)/sh);
  ctx.drawImage(image,sx,sy,sw,sh,512-sw*scale/2,frame.y+(frame.h-sh*scale)/2,sw*scale,sh*scale);
  ctx.strokeStyle='#73806c';ctx.lineWidth=2;ctx.strokeRect(frame.x,frame.y,frame.w,frame.h);
  const feedback=state.stage==='feedback',remaining=Math.max(0,state.remaining??q.seconds??12),duration=state.duration??q.seconds??12;
  ctx.fillStyle='#29332a';ctx.fillRect(70,477,884,7);ctx.fillStyle=remaining<=3?'#adab80':'#8c9b83';ctx.fillRect(70,477,884*clamp(remaining/duration),7);
  centered(ctx,feedback?(state.feedback?.timedOut?'时间已耗尽':state.feedback?.correct?'记录：识读正确':'记录：文字误读'):'它写了什么？',514,31);
  for(let i=0;i<2;i++) {
    const x=i?750:274,option=q.options[i];ctx.textAlign='center';ctx.font=font(42,600);ctx.fillStyle='#e4e4d5';
    ctx.fillText(`${i?'B':'A'}  ${option.english}`,x,578,438);
    ctx.font=font(29);ctx.fillStyle='#aeb9a5';ctx.fillText(option.chinese,x,630,435);
    if(feedback&&i===q.correctIndex){ctx.strokeStyle='#bbc9aa';ctx.strokeRect(x-215,550,430,108);}
  }
  centered(ctx,feedback?`原文：${q.options[q.correctIndex].english}`:`${remaining.toFixed(1)} s  /  红 A · 黄 B`,704,34,feedback?'#d5d8c7':'#aebba3');
  centered(ctx,'XU BING / SQUARE WORD CALLIGRAPHY',748,18,'#63735f');
}
function paintEnd(card,stats={}) {
  const ctx=card.getContext('2d');baseCard(ctx);centered(ctx,'文化程度检定',108,64);centered(ctx,'识读记录已封存',189,36);
  centered(ctx,`${stats.score??0} / ${stats.total??readingQuestions.length}`,296,102);
  centered(ctx,`正确 ${Math.round((stats.accuracy??0)*100)}%  ·  超时 ${stats.timeouts??0} 题`,408,36);
  centered(ctx,`平均作答 ${Number(stats.averageResponseSeconds??0).toFixed(1)} 秒`,472,32);
  centered(ctx,'你改变了读法，还是改变了确信？',566,35,'#b6c1ad');
  centered(ctx,'本记录仅反映本次识读表现。',665,25,'#85967d');centered(ctx,'ENTER / 再检定一次',715,29);
}

function keyForSlide(slide) {
  const key = slide?.textureKey ?? slide?.key;
  if (key !== undefined && key !== null) {
    const normalized = String(key).replace(/^T_/, '').replace(/^Slide_/, '');
    if (/^\d+$/.test(normalized)) return String(Number(normalized)).padStart(2, '0');
    const named = CARD_KEYS.find(card => card.toLowerCase() === normalized.toLowerCase());
    if (named) return named;
  }
  const kind = String(slide?.kind ?? '').toLowerCase();
  if (['intro', 'start'].includes(kind)) return 'Start';
  if (['complete', 'completed', 'ending', 'success'].includes(kind)) return 'Complete';
  if (['lost', 'failure', 'failed'].includes(kind)) return 'Lost';
  if (Number.isFinite(Number(slide?.index))) return String(Number(slide.index)).padStart(2, '0');
  throw new Error('Projection card is missing a valid textureKey.');
}

export function createProjection(THREE) {
  const textures = new Map();
  const loader = new THREE.TextureLoader();
  const placeholder = new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1, THREE.RGBAFormat);
  placeholder.needsUpdate = true;
  placeholder.colorSpace = THREE.SRGBColorSpace;
  let currentKey = 'Start';
  let targetKey = 'Start';
  let transitionTime = SLIDE_DURATION;
  let transitionActive = false;
  let textureSwapped = true;
  let reducedMotion = false;
  let loaded = false;
  let disposed = false;
  let gain = 1;
  let gateTravel = 0;
  const uniforms = {
    uSlide: { value: placeholder },
    uTime: { value: 0 },
    uSlideOffset: { value: 0 },
    uShutter: { value: 0 },
    uExposure: { value: 1 },
    uFocus: { value: 1 },
    uMotion: { value: 1 },
    uRasterScale: { value: 1 },
    uSignalNoise: { value: 0 },
  };
  const material = new THREE.ShaderMaterial({
    name: 'SignalRoom_CRTTube',
    uniforms,
    depthWrite: true,
    depthTest: true,
    transparent: true,
    side: THREE.FrontSide,
    vertexShader: /* glsl */`
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */`
      precision highp float;
      varying vec2 vUv;
      uniform sampler2D uSlide;
      uniform float uTime;
      uniform float uSlideOffset;
      uniform float uShutter;
      uniform float uExposure;
      uniform float uFocus;
      uniform float uMotion;
      uniform float uRasterScale;
      uniform float uSignalNoise;

      float hash(vec2 p) {
        vec3 a = fract(vec3(p.x, p.y, p.x) * .1031);
        a += dot(a, a.yzx + 33.33);
        return fract((a.x + a.y) * a.z);
      }
      vec3 sampleCard(vec2 topUv) {
        // PNG upload uses Three's default flipY. Card coordinates have their
        // origin at the top; converting once preserves the original layout.
        // SRGBColorSpace textures decode in WebGL's texture sampler, so this
        // result is linear light before the global OutputPass tone mapping.
        return texture2D(uSlide, vec2(clamp(topUv.x, 0.0, 1.0), 1.0 - clamp(topUv.y, 0.0, 1.0))).rgb;
      }
      float roundedTube(vec2 uv) {
        // Distance in screen-height units keeps the physical corners circular.
        vec2 p = (uv - .5) * vec2(1.24 / .90, 1.);
        vec2 d = abs(p) - vec2(.5 * 1.24 / .90, .5) + .06;
        return length(max(d, 0.)) + min(max(d.x, d.y), 0.) - .06;
      }
      void main() {
        vec2 uv = vec2(vUv.x, 1.0 - vUv.y);
        float t = uTime * uMotion;
        float field = floor(t * 59.94);
        float focus = clamp(uFocus, 0.0, 1.0);
        vec2 centred = uv * 2. - 1.;
        // The actual mesh supplies the glass bulge. This tiny electron-raster
        // curvature only bends content close to the tube's outer shoulders.
        vec2 q = uv + centred * dot(centred, centred) * .0032;
        float row = floor(uv.y * 300.);
        float sync = (hash(vec2(row, field)) - .5) * uSignalNoise;
        q.x += sync * .026 + sin(t * 27. + uv.y * 11.) * .00020 * uMotion;
        q.y = (q.y - .5) / max(uRasterScale, .006) + .5;
        q.y += uSlideOffset;

        vec2 d = (uv - 0.5) * vec2(1.0, .83);
        float radius = dot(d, d);
        float blur = (.00065 + (1. - focus) * .0032) * (1. + radius * 1.2);
        vec2 bx = vec2(blur, 0.0);
        vec2 by = vec2(0.0, blur);
        // A sharp phosphor core and a restrained broader spot give soft ink
        // edges without turning the Chinese glyphs into a blurry paper slide.
        vec3 c = sampleCard(q) * .68;
        c += sampleCard(q + bx) * .064;
        c += sampleCard(q - bx) * .064;
        c += sampleCard(q + by) * .064;
        c += sampleCard(q - by) * .064;
        c += sampleCard(q + bx * 3.2) * .016;
        c += sampleCard(q - bx * 3.2) * .016;
        c += sampleCard(q + by * 3.2) * .016;
        c += sampleCard(q - by * 3.2) * .016;
        float luminance = dot(c, vec3(0.2126, 0.7152, 0.0722));
        c = mix(c, vec3(luminance), .955) * vec3(.989, 1.0, 1.009);
        float tubeFalloff = 1. - .44 * radius;
        float flutter = 1. + (sin(t * 8.4) * .007 + sin(t * 18.73) * .003) * uMotion;
        // Derivative filtering fades the fine scan/shadow-mask pattern when
        // viewed from far away, preventing interference with global VHS lines.
        float scanVisibility = 1. - smoothstep(.38, .85, fwidth(uv.y * 286.));
        float scan = 1. - (.032 + .024 * sin(uv.y * 286. * 6.2831853)) * scanVisibility;
        float grilleVisibility = 1. - smoothstep(.38, .85, fwidth(uv.x * 512.));
        float grille = 1. - (.010 + .009 * sin(uv.x * 512. * 6.2831853)) * grilleVisibility;
        c *= tubeFalloff * flutter * scan * grille;

        // Channel instability is electron-raster roll and voltage collapse,
        // followed by complete blanking before the next texture is switched.
        float blank = clamp(uShutter, 0., 1.);
        float inside = step(0.0, q.x) * step(q.x, 1.0) * step(0.0, q.y) * step(q.y, 1.0);
        float noise = hash(floor(uv * vec2(640., 480.)) + vec2(field * .731, field * 1.371));
        float noiseLevel = uSignalNoise * (.045 + .20 * (1. - focus));
        vec3 phosphor = c * max(uExposure, 0.) * inside + vec3(noise * noiseLevel);
        phosphor *= (1. - blank) * 1.08;
        // Weak grey-blue glass black and an off-centre curved reflection remain
        // visible during blanking; the reflection never sits over central text.
        float reflectionArc = length((uv - vec2(.20, -.08)) * vec2(.82, .65));
        float reflection = exp(-pow((reflectionArc - .26) * 92., 2.));
        reflection *= (1. - smoothstep(.16, .32, uv.y)) * (1. - smoothstep(.40, .62, uv.x));
        vec3 glass = vec3(.0031, .0037, .0044) + vec3(.0023, .0027, .0030) * reflection;
        float tubeAlpha = 1. - smoothstep(-.001, .0035, roundedTube(uv));
        gl_FragColor = vec4(phosphor + glass, tubeAlpha);
      }
    `,
  });

  function applyTexture(key) {
    const texture = textures.get(key);
    if (texture) uniforms.uSlide.value = texture;
    currentKey = key;
  }

  const cards=new Map(), sourceImages=new Map();
  let cardStamp='';
  const ready=Promise.all(readingSources.map(async source=> {
    const texture=await loader.loadAsync(new URL(source.image,import.meta.url).href);
    sourceImages.set(source.id,texture.image);texture.dispose();
  })).then(()=> {
    if(disposed)return;
    for(const key of CARD_KEYS) {
      const card=makeCard();cards.set(key,card);
      const q=readingQuestions.find(q=>q.textureKey===key);
      if(q)paintQuestion(card,q,sourceImages.get(q.source));
      else if(key==='Start')paintStart(card);else paintEnd(card);
      const texture=new THREE.CanvasTexture(card);texture.name=`Reading_${key}`;
      texture.colorSpace=THREE.SRGBColorSpace;texture.generateMipmaps=false;
      texture.minFilter=texture.magFilter=THREE.LinearFilter;
      texture.wrapS=texture.wrapT=THREE.ClampToEdgeWrapping;texture.anisotropy=4;
      textures.set(key,texture);
    }
    loaded=true;applyTexture(currentKey);
  });
  function updateReading(slide,state) {
    if(!loaded||disposed)return;
    const stamp=`${slide.textureKey}:${state.stage}:${Math.floor(state.remaining*4)}:${state.feedback?.chosen}`;
    if(stamp===cardStamp)return;cardStamp=stamp;
    const card=cards.get(slide.textureKey);if(!card)return;
    paintQuestion(card,slide,sourceImages.get(slide.source),state);
    textures.get(slide.textureKey).needsUpdate=true;
  }
  function showResult(stats) {
    const card=cards.get('Complete');if(!card)return;
    paintEnd(card,stats);textures.get('Complete').needsUpdate=true;
  }

  function resetGate() {
    transitionTime = SLIDE_DURATION;
    transitionActive = false;
    textureSwapped = true;
    uniforms.uSlideOffset.value = 0;
    uniforms.uShutter.value = 0;
    uniforms.uExposure.value = 1;
    uniforms.uFocus.value = 1;
    uniforms.uRasterScale.value = 1;
    uniforms.uSignalNoise.value = 0;
    gain = 1;
    gateTravel = 0;
  }

  function drawSlide(slide, { animate = false } = {}) {
    const key = keyForSlide(slide);
    if (!CARD_KEYS.includes(key)) throw new Error(`Unknown projection card: ${key}`);
    targetKey = key;
    if (!animate || !loaded || reducedMotion) {
      applyTexture(key);
      resetGate();
      return;
    }
    transitionTime = 0;
    transitionActive = true;
    textureSwapped = false;
  }

  function update(time, dt = 0) {
    if (!reducedMotion && Number.isFinite(time)) uniforms.uTime.value = time;
    if (!transitionActive) return;
    transitionTime += Math.max(0, Number.isFinite(dt) ? dt : 0);
    const t = transitionTime;
    let offset = 0;
    let shutter = 0;
    let focus = 1;
    let exposure = 1;
    let rasterScale = 1;
    let signalNoise = 0;
    if (t < .12) {
      const destabilize = smooth(t / .12);
      offset = .055 * destabilize * Math.sin(t * 29.);
      focus = 1 - .44 * destabilize;
      signalNoise = .82 * destabilize;
      exposure = 1 - .14 * destabilize;
    } else if (t < .30) {
      const collapse = smooth((t - .12) / .18);
      offset = (.11 + .08 * collapse) * Math.sin(t * 24.);
      rasterScale = 1 - .985 * collapse;
      shutter = smooth((t - .19) / .11);
      focus = .56 - .18 * collapse;
      signalNoise = .82 * (1 - collapse * .35);
      exposure = .86 - .36 * collapse;
    } else if (t < SWAP_TIME) {
      // Keep the raster fully dark across the exact .38 second card swap.
      shutter = 1;
      rasterScale = .015;
      focus = .38;
      exposure = .50;
    } else {
      if (!textureSwapped) { applyTexture(targetKey); textureSwapped = true; }
      if (t < .44) {
        shutter = 1;
        rasterScale = .015;
        focus = .38;
        exposure = .50;
      } else if (t < 0.70) {
        const restore = smooth((t - .44) / .26);
        offset = .13 * Math.sin((t - .44) * 19.) * (1 - restore);
        rasterScale = .15 + .85 * restore;
        shutter = 1 - smooth((t - .44) / .18);
        focus = .38 + .54 * restore;
        exposure = .68 + .32 * restore;
        signalNoise = .48 * (1 - restore);
      } else {
        const settle = clamp((t - 0.70) / 0.18);
        offset = .0028 * Math.sin(settle * 17) * (1 - settle);
        focus = .92 + .08 * settle;
        exposure = 1 + .025 * Math.sin(settle * 14) * (1 - settle);
      }
    }
    if (t >= SLIDE_DURATION) { resetGate(); return; }
    uniforms.uSlideOffset.value = offset;
    uniforms.uShutter.value = shutter;
    uniforms.uExposure.value = exposure;
    uniforms.uFocus.value = focus;
    uniforms.uRasterScale.value = rasterScale;
    uniforms.uSignalNoise.value = signalNoise;
    gain = exposure * (1 - shutter);
    gateTravel = offset;
  }

  return {
    material, ready, drawSlide, update, updateReading, showResult,
    setReducedMotion(value) {
      reducedMotion = Boolean(value);
      uniforms.uMotion.value = reducedMotion ? 0 : 1;
      if (reducedMotion && transitionActive) { applyTexture(targetKey); resetGate(); }
    },
    get gain() { return gain; },
    get gateTravel() { return gateTravel; },
    get transitionActive() { return transitionActive; },
    get diagnostics() {
      return { loaded, currentKey, targetKey, transitionActive,
        progress: clamp(transitionTime / SLIDE_DURATION), textureCount: textures.size,
        readingQuestionCount:readingQuestions.length, sourceCount:sourceImages.size,
        gain, gateTravel, shutter: uniforms.uShutter.value,
        focus: uniforms.uFocus.value, exposure: uniforms.uExposure.value, reducedMotion,
        mode: 'crt-tv', roundedCorners: .06, blank: uniforms.uShutter.value,
        rasterScale: uniforms.uRasterScale.value, signalNoise: uniforms.uSignalNoise.value,
        tube: { curvature: .0032, phosphorBlur: .00065, phosphorHalo: .064,
          scanLines: 286, shadowMask: 512, glassBlack: .0037, emission: 1.08 } };
    },
    dispose() {
      disposed = true;
      textures.forEach(texture => texture.dispose());
      textures.clear();
      placeholder.dispose();
      material.dispose();
    },
  };
}
