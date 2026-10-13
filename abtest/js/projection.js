import {abstractSlides} from './abstract-slides.js';
/**
 * SignalRoom's original cards and visual judgments in an ageing curved CRT.
 * The historical projection API remains so session timing is unchanged.
 */
export const SLIDE_DURATION = 0.88;
const SWAP_TIME = 0.38;
const CARD_KEYS = ['Start', ...Array.from({ length: 10 }, (_, i) => String(i + 1).padStart(2, '0')), ...abstractSlides.map(slide=>slide.textureKey), 'Complete', 'Lost'];
const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const smooth = value => { const t = clamp(value); return t * t * (3 - 2 * t); };

// Compose game typography around the unmodified generated photograph once.
// No text is baked into the source art and no canvas is redrawn each frame.
function visualJudgmentCard(image,slide) {
  const card=document.createElement('canvas');card.width=1024;card.height=768;
  const ctx=card.getContext('2d');ctx.fillStyle='#0a0c0b';ctx.fillRect(0,0,1024,768);
  const frame={x:32,y:28,w:960,h:430};
  const scale=Math.max(frame.w/image.width,frame.h/image.height);
  const sw=frame.w/scale,sh=frame.h/scale;
  ctx.drawImage(image,(image.width-sw)/2,(image.height-sh)/2,sw,sh,frame.x,frame.y,frame.w,frame.h);
  ctx.strokeStyle='#b9bcb3';ctx.lineWidth=2;ctx.strokeRect(frame.x,frame.y,frame.w,frame.h);
  ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#e7e9df';
  const lines=slide.body.split('\n');let fontSize=58;
  const font=size=>`600 ${size}px Arial, "PingFang SC", "Microsoft YaHei", sans-serif`;
  ctx.font=font(fontSize);
  while(lines.some(line=>ctx.measureText(line).width>944)&&fontSize>36){fontSize--;ctx.font=font(fontSize);}
  lines.forEach((line,i)=>ctx.fillText(line,512,528+i*72));
  ctx.strokeStyle='#a6ab9d';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(32,660);ctx.lineTo(992,660);ctx.stroke();
  ctx.font=font(39);ctx.fillStyle='#c5cabc';ctx.fillText('是 / TRUE',264,703);ctx.fillText('否 / FALSE',760,703);
  return card;
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

  const ready = Promise.all(CARD_KEYS.map(async key => {
    const visual=abstractSlides.find(slide=>slide.textureKey===key);
    const name = visual?`Visual_${key}`:/^\d+$/.test(key) ? `T_Slide_${key}` : `T_${key}`;
    const url = new URL(visual?visual.image:`../assets/slides/${name}.png`, import.meta.url).href;
    let texture;
    try {
      texture = await loader.loadAsync(url);
      if(visual) {
        const source=texture;
        texture=new THREE.CanvasTexture(visualJudgmentCard(source.image,visual));
        source.dispose();
      }
    }
    catch (cause) { throw new Error(`Could not load projection card ${name}.png`, { cause }); }
    if (disposed) { texture.dispose(); return; }
    texture.name = name;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.generateMipmaps = !visual;
    texture.minFilter = visual?THREE.LinearFilter:THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.anisotropy = 4;
    textures.set(key, texture);
  })).then(() => {
    if (disposed) return;
    loaded = true;
    applyTexture(currentKey);
  });

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
    material, ready, drawSlide, update,
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
        visualJudgmentCount:abstractSlides.length,
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
