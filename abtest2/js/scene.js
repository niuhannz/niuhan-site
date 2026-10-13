import { createProjection } from './projection.js';

/**
 * Browser port of the native SignalRoom set. Metres; +Z points toward the seat.
 * Hardware is dimensioned from the original theatre meshes, rather than from
 * an enlarged interaction panel. Only the moulded caps are answer targets.
 */
export function createRoom(THREE, scene) {
  const room = new THREE.Group();
  room.name = 'SignalRoomCRTTheatre';
  scene.add(room);
  let seed = 73091, reducedMotion = false;
  const random = () => ((seed = (1664525 * seed + 1013904223) >>> 0) / 4294967296);
  const range = (a, b) => a + (b - a) * random();
  const canvas = (w, h = w) => Object.assign(document.createElement('canvas'), { width: w, height: h });
  const linear = (r, g, b) => new THREE.Color().setRGB(r, g, b);
  const texture = (c, rx = 1, ry = 1, color = true) => {
    const t = new THREE.CanvasTexture(c);
    if (color) t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(rx, ry); t.anisotropy = 4;
    return t;
  };
  const standard = (color, roughness = .86, metalness = 0, options = {}) =>
    new THREE.MeshStandardMaterial({ color, roughness, metalness, ...options });
  const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
  const cylinderGeometry = new THREE.CylinderGeometry(1, 1, 1, 48);
  const sphereGeometry = new THREE.SphereGeometry(1, 32, 20);
  const mesh = (geometry, material, position = [0, 0, 0], size, parent = room) => {
    const m = new THREE.Mesh(geometry, material); m.position.set(...position);
    if (size) m.scale.set(...size);
    m.receiveShadow = true; parent.add(m); return m;
  };
  const box = (p, s, mat, parent) => mesh(boxGeometry, mat, p, s, parent);
  const cylinder = (p, diameter, height, mat, parent) =>
    mesh(cylinderGeometry, mat, p, [diameter / 2, height, diameter / 2], parent);
  const sphere = (p, s, mat, parent) => mesh(sphereGeometry, mat, p, s, parent);
  const plane = (p, s, mat, ry = 0, parent) => {
    const m = mesh(new THREE.PlaneGeometry(...s), mat, p, null, parent);
    m.rotation.y = ry; return m;
  };
  const pipe = (a, b, radius, mat, parent) => {
    const av = new THREE.Vector3(...a), bv = new THREE.Vector3(...b);
    const d = bv.clone().sub(av);
    const m = cylinder(av.clone().add(bv).multiplyScalar(.5).toArray(), radius * 2, d.length(), mat, parent);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
    return m;
  };

  // These grain maps have an intentional physical scale. A large, contrasted
  // checker noise pattern on old resin reads as a broken texture rather than wear.
  const plasterCanvas = canvas(768), pc = plasterCanvas.getContext('2d');
  pc.fillStyle = '#92958f'; pc.fillRect(0, 0, 768, 768);
  for (let i = 0; i < 140; i++) {
    const x = range(-80, 848), y = range(-80, 848), radius = range(22, 160);
    const g = pc.createRadialGradient(x, y, 0, x, y, radius);
    g.addColorStop(0, i % 4 ? 'rgba(25,29,24,.055)' : 'rgba(229,221,204,.05)');
    g.addColorStop(1, 'rgba(0,0,0,0)'); pc.fillStyle = g;
    pc.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }
  for (let i = 0; i < 10000; i++) {
    pc.fillStyle = random() > .5 ? 'rgba(12,13,12,.025)' : 'rgba(255,255,255,.025)';
    pc.fillRect(range(0, 768), range(0, 768), range(.4, 1.4), range(.4, 1.4));
  }
  // Dark water runs, flaking limewash and hairline cracks belong to the wall
  // surface. Their scale stays fixed when the room is lit by reflected slides.
  for (let i = 0; i < 24; i++) {
    const x=range(0,768),y=range(-90,420),w=range(9,48),h=range(150,540);
    const stain=pc.createLinearGradient(0,y,0,y+h);
    stain.addColorStop(0,'rgba(30,36,25,.28)');stain.addColorStop(.5,'rgba(43,39,26,.17)');stain.addColorStop(1,'rgba(30,36,25,0)');
    pc.fillStyle=stain;pc.fillRect(x,y,w,h);
    pc.fillStyle='rgba(30,33,26,.10)';pc.fillRect(x+w*.3,y,w*.12,h*range(.6,1.0));
  }
  for (let i=0;i<190;i++) {
    const x=range(0,768),y=range(0,768),r=range(1,15);
    pc.fillStyle=i%3?'rgba(172,163,141,.42)':'rgba(57,59,51,.35)';
    pc.beginPath();pc.moveTo(x-r,y);pc.lineTo(x-r*.1,y-r*.65);pc.lineTo(x+r*.78,y-r*.24);
    pc.lineTo(x+r,y+r*.37);pc.lineTo(x-r*.36,y+r*.7);pc.closePath();pc.fill();
  }
  for(let i=0;i<9;i++) {
    let x=range(20,748),y=range(-20,680);pc.beginPath();pc.moveTo(x,y);
    for(let j=0;j<12;j++){x+=range(-10,13);y+=range(7,23);pc.lineTo(x,y);}
    pc.strokeStyle='rgba(27,29,26,.34)';pc.lineWidth=.65;pc.stroke();
  }
  const plasterMap = texture(plasterCanvas, 2.2, 1);
  const plaster = standard(linear(.33, .345, .30), .97, 0,
    { map: plasterMap, bumpMap: plasterMap, bumpScale: .010 });
  const lowerPaint = standard(linear(.09, .115, .092), .96, 0,
    { map: plasterMap, bumpMap: plasterMap, bumpScale: .007 });
  const metal = standard(linear(.055, .060, .058), .68, .64);
  const blackMetal = standard(linear(.010, .012, .011), .67, .58);
  const blackResin = standard(linear(.009, .011, .010), .5, .03);
  const rust = standard(linear(.078, .042, .026), .9, .25);
  const brass = standard(linear(.135, .096, .032), .59, .72);
  const vinylCanvas=canvas(256),vc=vinylCanvas.getContext('2d');
  vc.fillStyle='#898975';vc.fillRect(0,0,256,256);
  for(let i=0;i<580;i++){vc.fillStyle='rgba(26,26,20,.07)';vc.fillRect(range(0,256),range(0,256),range(1,3),range(.4,1.2));}
  for(let i=0;i<18;i++){vc.strokeStyle='rgba(188,170,126,.32)';vc.lineWidth=range(.4,1.3);const x=range(0,256),y=range(0,256);vc.beginPath();vc.moveTo(x,y);vc.lineTo(x+range(-12,12),y+range(6,35));vc.stroke();}
  const vinylMap=texture(vinylCanvas);
  const chairVinyl = standard(linear(.09, .12, .097), .91,0,{map:vinylMap,bumpMap:vinylMap,bumpScale:.0008});

  const woodCanvas = canvas(1024), wc = woodCanvas.getContext('2d');
  wc.fillStyle = '#73513a'; wc.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 1300; i++) {
    const y = range(0, 1024);
    wc.strokeStyle = i % 4 ? `rgba(37,16,7,${range(.015,.09)})` : `rgba(219,171,112,${range(.012,.055)})`;
    wc.lineWidth = range(.25, 1.4); wc.beginPath(); wc.moveTo(-10, y);
    wc.bezierCurveTo(260, y + range(-3, 3), 690, y + range(-5, 5), 1034, y + range(-3, 3)); wc.stroke();
  }
  for (let i = 0; i < 52; i++) {
    wc.strokeStyle = 'rgba(195,153,105,.13)'; wc.lineWidth = range(.25, .9);
    const x = range(0,1024), y = range(0,1024);
    wc.beginPath(); wc.moveTo(x,y); wc.lineTo(x + range(8,90),y + range(-5,5)); wc.stroke();
  }
  const woodMap = texture(woodCanvas);
  const lacquer = new THREE.MeshPhysicalMaterial({ color: linear(.18,.095,.042), map: woodMap,
    roughness: .40, metalness: 0, clearcoat: .23, clearcoatRoughness: .42,
    bumpMap: woodMap, bumpScale: .0005 });
  const darkWood = lacquer.clone(); darkWood.color.copy(linear(.091,.041,.018)); darkWood.roughness = .54;

  const resinCanvas = canvas(512), rc = resinCanvas.getContext('2d');
  rc.fillStyle = '#f0f0eb'; rc.fillRect(0,0,512,512);
  for (let i=0;i<17000;i++) {
    rc.fillStyle = random()>.5 ? 'rgba(0,0,0,.018)' : 'rgba(255,255,255,.024)';
    rc.fillRect(range(0,512),range(0,512),.6,.6);
  }
  for (let i=0;i<24;i++) {
    const x=range(0,512),y=range(0,512),radius=range(20,100);
    const g=rc.createRadialGradient(x,y,0,x,y,radius);
    g.addColorStop(0,'rgba(81,62,29,.04)');g.addColorStop(1,'rgba(0,0,0,0)');
    rc.fillStyle=g;rc.fillRect(x-radius,y-radius,radius*2,radius*2);
  }
  const resinMap=texture(resinCanvas);
  const ivory=new THREE.MeshPhysicalMaterial({color:linear(.43,.37,.25),map:resinMap,
    roughness:.48,metalness:0,clearcoat:.15,clearcoatRoughness:.42,bumpMap:resinMap,bumpScale:.00024});
  const red=ivory.clone();red.color.copy(linear(.38,.035,.019));red.roughness=.33;red.clearcoat=.34;
  const yellow=red.clone();yellow.color.copy(linear(.52,.33,.055));

  // One continuous tile floor is cheaper than hundreds of individual boxes.
  const floorCanvas=canvas(1024),fc=floorCanvas.getContext('2d');
  for(let y=0;y<2;y++)for(let x=0;x<2;x++) {
    fc.fillStyle=(x+y)%2?'#69716b':'#90978e';fc.fillRect(x*512,y*512,512,512);
    fc.strokeStyle='rgba(20,25,21,.17)';fc.lineWidth=4;fc.strokeRect(x*512+1,y*512+1,510,510);
  }
  for(let i=0;i<14000;i++) {
    fc.fillStyle=random()>.5?'rgba(255,255,255,.018)':'rgba(0,0,0,.025)';
    fc.fillRect(range(0,1024),range(0,1024),range(.5,2),range(.5,2));
  }
  for(let i=0;i<40;i++) {
    const x=range(0,1024),y=range(0,1024),radius=range(18,110);
    const grime=fc.createRadialGradient(x,y,0,x,y,radius);
    grime.addColorStop(0,'rgba(29,30,23,.22)');grime.addColorStop(1,'rgba(0,0,0,0)');
    fc.fillStyle=grime;fc.fillRect(x-radius,y-radius,radius*2,radius*2);
  }
  for(let i=0;i<12;i++) {
    const x=range(0,1024),y=range(0,1024);fc.strokeStyle='rgba(22,27,21,.48)';fc.lineWidth=range(.6,1.5);
    fc.beginPath();fc.moveTo(x,y);fc.lineTo(x+range(-16,16),y+range(10,36));fc.lineTo(x+range(-24,24),y+range(40,84));fc.stroke();
  }
  const floorMap=texture(floorCanvas,7.2,10.5);
  const floor=plane([0,.001,-.45],[7.2,10.5],standard(linear(.18,.195,.164),.79,0,
    {map:floorMap,bumpMap:floorMap,bumpScale:.0026}));floor.rotation.x=-Math.PI/2;
  box([0,-.04,-.45],[7.2,.075,10.5],blackMetal);
  box([0,3.56,-.45],[7.35,.12,10.6],plaster);
  for(const side of [-1,1]) {
    box([side*3.66,.68,-.45],[.12,1.36,10.5],lowerPaint);
    box([side*3.66,2.44,-.45],[.12,2.16,10.5],plaster);
    box([side*3.56,1.38,-.45],[.05,.05,10.5],metal);
    box([side*3.56,.09,-.45],[.05,.16,10.5],metal);
  }
  pipe([-3.39,3.28,-5.58],[3.18,3.28,-5.58],.026,metal);
  pipe([2.94,3.28,-5.58],[2.94,.21,-5.58],.025,rust);
  for(const x of [-2.88,-.75,1.42,2.94]) {
    const joint=cylinder([x,3.28,-5.58],.085,.08,rust);joint.rotation.z=Math.PI/2;
    box([x,3.28,-5.645],[.15,.12,.06],metal);
  }
  for(const z of [-5.77,4.87]) {
    box([0,.68,z],[7.35,1.36,.12],lowerPaint);
    box([0,2.44,z],[7.35,2.16,.12],plaster);
    box([0,1.38,z+(z<0?.09:-.09)],[7.2,.05,.05],metal);
  }
  const damp=standard(linear(.021,.030,.023),.99);
  for(let i=0;i<12;i++)box([-3.585,1.76+i%3*.38,-4.9+i*.78],[.008,.49+i%3*.31,.06+i%4*.07],damp);
  box([3.585,2.45,-2.12],[.008,1.05,1.4],standard(linear(.078,.083,.071),.98));

  // A real, deep CRT cabinet replaces the fabric screen. Its front rim and
  // convex tube are authored in metres; no screen-space border simulates it.
  const projection=createProjection(THREE);
  const television=new THREE.Group();television.name='OldCRT_Television';room.add(television);
  const tvSource=new THREE.Vector3(0,1.55,-.56);
  const tvWidth=1.62,tvHeight=1.20,tvDepth=.84,tubeWidth=1.24,tubeHeight=.90,tubeBulge=.09;
  const caseMaterial=ivory.clone();caseMaterial.color.copy(linear(.27,.255,.194));caseMaterial.roughness=.65;
  caseMaterial.clearcoat=.055;caseMaterial.bumpScale=.00048;
  const bezelMaterial=standard(linear(.018,.021,.019),.47,.055,{map:resinMap,bumpMap:resinMap,bumpScale:.00025});
  const edgeMaterial=standard(linear(.073,.077,.065),.38,.14);
  function roundedPerimeter(w,h,r,segments=16) {
    const points=[];
    for(const [cx,cy,start] of [[w/2-r,h/2-r,0],[-w/2+r,h/2-r,90],[-w/2+r,-h/2+r,180],[w/2-r,-h/2+r,270]])
      for(let i=0;i<=segments;i++){const a=(start+i*90/segments)*Math.PI/180;points.push([cx+r*Math.cos(a),cy+r*Math.sin(a)]);}
    return points;
  }
  function rim(profiles,material,name) {
    const positions=[],uvs=[],indices=[];let count=0;
    for(const [w,h,r,z] of profiles) {
      const perimeter=roundedPerimeter(w,h,r);count=perimeter.length;
      for(const [x,y] of perimeter){positions.push(x,y,z);uvs.push(x/tvWidth+.5,y/tvHeight+.5);}
    }
    for(let row=0;row<profiles.length-1;row++)for(let i=0;i<count;i++){
      const j=(i+1)%count,a=row*count+i,b=row*count+j,c=(row+1)*count+j,d=(row+1)*count+i;
      indices.push(a,b,c,a,c,d);
    }
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
    geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geometry.setIndex(indices);geometry.computeVertexNormals();
    const m=mesh(geometry,material,[0,1.55,0],null,television);m.name=name;m.castShadow=true;return m;
  }
  const caseShape=new THREE.Shape();
  const caseOutline=roundedPerimeter(tvWidth-.07,tvHeight-.07,.105);
  caseShape.moveTo(...caseOutline[0]);for(const point of caseOutline.slice(1))caseShape.lineTo(...point);caseShape.closePath();
  const cabinetGeometry=new THREE.ExtrudeGeometry(caseShape,{depth:tvDepth-.08,bevelEnabled:true,bevelSize:.035,bevelThickness:.035,bevelSegments:4,steps:1,curveSegments:16});
  const cabinet=mesh(cabinetGeometry,caseMaterial,[0,1.55,-1.52],null,television);cabinet.name='DeepYellowedCRTCabinet';cabinet.castShadow=true;
  // Recessed rim, polished lip and rolled rubber surround are separate surfaces.
  rim([[1.59,1.17,.105,-.726],[1.55,1.13,.10,-.689],[1.34,1.01,.10,-.680],[1.29,.96,.091,-.627]],bezelMaterial,'DeepRecessedCRTBezel');
  rim([[1.345,1.015,.102,-.678],[1.327,.997,.100,-.660],[1.290,.960,.091,-.627]],edgeMaterial,'WornCRTBezelLip');
  rim([[1.290,.960,.091,-.626],[1.255,.925,.083,-.627],[1.242,.902,.073,-.647]],blackResin,'RoundedTubeRubberGasket');
  // The tube is a curved, finely subdivided surface, including real side parallax.
  const tubeGeometry=new THREE.PlaneGeometry(tubeWidth,tubeHeight,48,36);
  const tubePositions=tubeGeometry.attributes.position;
  for(let i=0;i<tubePositions.count;i++){
    const nx=tubePositions.getX(i)/(tubeWidth/2),ny=tubePositions.getY(i)/(tubeHeight/2);
    tubePositions.setZ(i,tubeBulge*Math.max(0,(1-nx*nx)*(1-ny*ny)));
  }
  tubeGeometry.computeVertexNormals();
  const screen=mesh(tubeGeometry,projection.material,[0,1.55,-.65],null,television);
  screen.name='ConvexCRTGlassTube';screen.receiveShadow=false;screen.renderOrder=2;
  // Raised edge glass catches a small amount of room light without a clear
  // white coating over the legible phosphor image.
  const glassReflection=mesh(tubeGeometry.clone(),new THREE.MeshPhysicalMaterial({color:linear(.13,.16,.155),
    transparent:true,opacity:.020,roughness:.21,metalness:.12,clearcoat:.75,clearcoatRoughness:.12,depthWrite:false}),[0,1.55,-.649],null,television);
  glassReflection.name='CRTGlassReflection';glassReflection.receiveShadow=false;glassReflection.renderOrder=3;
  const glowUniforms={uGain:{value:1}};
  const glowMaterial=new THREE.ShaderMaterial({uniforms:glowUniforms,transparent:true,depthWrite:false,
    blending:THREE.AdditiveBlending,toneMapped:false,
    vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
    fragmentShader:`precision highp float;varying vec2 vUv;uniform float uGain;void main(){
      vec2 q=abs(vUv-.5);vec2 outside=max(q-vec2(.419,.397),0.0);
      float glow=exp(-length(outside)*30.0)*(1.0-smoothstep(.465,.5,max(q.x,q.y)));
      gl_FragColor=vec4(vec3(.38,.45,.42)*glow*.065*uGain,glow);}`});
  const screenGlow=plane([0,1.55,-.621],[1.48,1.13],glowMaterial,0,television);
  screenGlow.name='LocalCRTPhosphorHalo';screenGlow.receiveShadow=false;screenGlow.renderOrder=1;
  // Side vents, control knobs and a recessed speaker grille establish an old
  // domestic television even when the image itself is black.
  for(const side of [-1,1])for(let i=0;i<17;i++)box([side*.804,1.23+i*.034,-1.12],[.008,.012,.28],blackResin,television);
  box([.740,1.362,-.683],[.107,.251,.013],blackResin,television);
  for(let i=0;i<19;i++)box([.740,1.246+i*.0129,-.674],[.092,.004,.006],edgeMaterial,television);
  for(const [y,angle] of [[1.78,.28],[1.61,-.24]]) {
    const knob=cylinder([.739,y,-.656],.081,.038,blackResin,television);knob.rotation.x=Math.PI/2;knob.castShadow=true;
    const lip=cylinder([.739,y,-.633],.067,.007,edgeMaterial,television);lip.rotation.x=Math.PI/2;
    const marker=box([.739,y,-.627],[.034,.003,.003],ivory,television);marker.rotation.z=angle;
    for(let i=0;i<8;i++){
      const a=i*Math.PI*2/8;box([.739+.042*Math.cos(a),y+.042*Math.sin(a),-.679],[.002,.005,.002],edgeMaterial,television);
    }
  }
  box([-.70,1.05,-.686],[.135,.025,.004],blackResin,television);
  for(let i=0;i<5;i++)box([-.746+i*.018,1.05,-.682],[.005,.009,.002],edgeMaterial,television);
  const powerMaterial=new THREE.MeshStandardMaterial({color:linear(.06,.15,.075),emissive:linear(.13,.56,.18),emissiveIntensity:.58,roughness:.45});
  const powerLED=sphere([.74,1.066,-.658],[.0075,.0075,.004],powerMaterial,television);powerLED.name='CRTGreenPowerLED';
  // Yellowed scratches are small physical discontinuities on the rim, not a
  // full-screen grunge overlay. Keep them away from the response text.
  const scuff=standard(linear(.34,.31,.22),.86);
  for(let i=0;i<17;i++){
    const x=range(-.62,.58),y=i%2?2.102:.995;
    const mark=box([x,y,-.688],[range(.008,.034),.0014,.0018],scuff,television);mark.rotation.z=range(-.2,.2);
  }
  for(const side of [-1,1])box([side*.58,.89,-1.15],[.12,.14,.42],blackResin,television).castShadow=true;
  const tvCart=new THREE.Group();tvCart.name='WeatheredTVTrolley';room.add(tvCart);
  box([0,.803,-1.18],[1.72,.068,.94],darkWood,tvCart).castShadow=true;
  box([0,.786,-.71],[1.73,.075,.025],lacquer,tvCart);
  for(const side of [-1,1])for(const z of [-1.57,-.80]){
    pipe([side*.73,.075,z],[side*.73,.77,z],.022,metal,tvCart);
    const wheel=cylinder([side*.73,.065,z],.095,.025,blackResin,tvCart);wheel.rotation.z=Math.PI/2;
  }
  box([0,.23,-1.17],[1.56,.024,.78],metal,tvCart);
  box([-.22,.29,-1.14],[.52,.10,.32],darkWood,tvCart);
  const tvPowerCurve=new THREE.CatmullRomCurve3([[.63,1.2,-1.57],[.77,.55,-1.68],[.79,.023,-1.93],[1.45,.022,-2.01],[2.39,.023,-2.63],[3.50,.25,-2.58]].map(p=>new THREE.Vector3(...p)));
  mesh(new THREE.TubeGeometry(tvPowerCurve,52,.006,7,false),blackResin);box([3.545,.27,-2.58],[.04,.16,.13],ivory);

  // Exact rounded profiles from SignalRoom's original theatre hardware.
  // Geometry fallback is also used while the compact exported meshes load.
  function buildHardware(kind) {
    const vertices=[],indices=[],uvs=[];
    let profiles,perimeter=[];
    if(kind==='housing') {
      for(const [cx,cz,start] of [[.35,.35,0],[-.35,.35,90],[-.35,-.35,180],[.35,-.35,270]])
        for(let i=0;i<=12;i++) {const a=(start+i*90/12)*Math.PI/180;perimeter.push([cx+.15*Math.cos(a),cz+.15*Math.sin(a)]);}
      profiles=[[-.5,.94],[-.42,1],[.38,1],[.46,.975],[.5,.92]];
    } else {
      for(let i=0;i<96;i++){const a=i*Math.PI*2/96;perimeter.push([Math.cos(a),Math.sin(a)]);}
      profiles=[[-.5,.42],[-.46,.46],[-.36,.49],[-.20,.50],[0,.49],[.18,.45],[.34,.36],[.44,.24],[.49,.12]];
    }
    const n=perimeter.length;
    profiles.forEach(([y,s])=>perimeter.forEach(([x,z])=>{vertices.push(x*s,y,z*s);uvs.push(x*s+.5,z*s+.5);}));
    for(let r=0;r<profiles.length-1;r++)for(let i=0;i<n;i++) {
      const j=(i+1)%n,a=r*n+i,b=r*n+j,c=(r+1)*n+j,d=(r+1)*n+i;
      // Positive-Y is the cap's upward normal, opposite OBJ's mapped winding.
      indices.push(a,c,b,a,d,c);
    }
    const bottom=vertices.length/3;vertices.push(0,-.5,0);uvs.push(.5,.5);
    const top=vertices.length/3;vertices.push(0,.5,0);uvs.push(.5,.5);
    for(let i=0;i<n;i++){const j=(i+1)%n;indices.push(bottom,i,j,top,(profiles.length-1)*n+j,(profiles.length-1)*n+i);}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
    g.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));g.setIndex(indices);g.computeVertexNormals();
    return g;
  }
  let housingGeometry=buildHardware('housing'),capGeometry=buildHardware('cap');
  const desk=new THREE.Group();desk.name='OldTheatreAnswerDesk';room.add(desk);
  box([0,.78,.65],[1.82,.07,1.02],lacquer,desk).castShadow=true;
  box([0,.76,1.15],[1.82,.09,.03],darkWood,desk);
  box([0,.66,1.10],[1.71,.17,.04],darkWood,desk);
  for(const side of [-1,1]) {
    box([side*.86,.66,.65],[.04,.17,.91],darkWood,desk);
    for(const z of [.24,1.06])box([side*.80,.37,z],[.06,.74,.06],darkWood,desk);
  }
  box([0,.18,.95],[1.64,.04,.04],darkWood,desk);
  for(let i=0;i<9;i++)box([-.70+i*.167,.791+(i%3)*.004,1.1656],[.02+(i%3)*.018,.0011,.0008],
    standard(linear(.22,.125,.060),.61),desk);

  const contactCanvas=canvas(128),cc=contactCanvas.getContext('2d');
  const contactGradient=cc.createRadialGradient(64,64,12,64,64,64);
  contactGradient.addColorStop(0,'rgba(0,0,0,.8)');contactGradient.addColorStop(.68,'rgba(0,0,0,.4)');
  contactGradient.addColorStop(1,'rgba(0,0,0,0)');cc.fillStyle=contactGradient;cc.fillRect(0,0,128,128);
  const contactMap=texture(contactCanvas);
  const contactMaterial=new THREE.MeshBasicMaterial({map:contactMap,transparent:true,opacity:.63,depthWrite:false,
    toneMapped:false,polygonOffset:true,polygonOffsetFactor:-1});
  const contact=(x,z,w,h)=>{const m=plane([x,.8157,z],[w,h],contactMaterial,0,desk);m.rotation.x=-Math.PI/2;return m;};
  const housingMeshes=[],buttons=[];
  // Painted answer plates belong to the switch cases, so their A/B mapping
  // remains legible without turning the old hardware into a modern UI panel.
  const makeAnswerPlate=(letter,x)=>{
    const labelCanvas=canvas(256,128),lc=labelCanvas.getContext('2d');
    lc.fillStyle='#302c23';lc.fillRect(0,0,256,128);
    lc.strokeStyle='#8b8066';lc.lineWidth=3;lc.strokeRect(8,8,240,112);
    lc.font='bold 96px monospace';lc.textAlign='center';lc.textBaseline='middle';
    lc.fillStyle='#d5c8a5';lc.fillText(letter,128,67);
    for(let i=0;i<210;i++){
      lc.fillStyle=i%3?'rgba(24,22,17,.18)':'rgba(201,180,135,.11)';
      lc.fillRect(range(6,250),range(7,121),range(.5,5),range(.5,1.8));
    }
    for(const sx of [18,238]){
      lc.fillStyle='#817253';lc.beginPath();lc.arc(sx,64,4,0,Math.PI*2);lc.fill();
      lc.fillStyle='#2b2820';lc.fillRect(sx-2,63,4,1.5);
    }
    box([x,.9323,.762],[.136,.003,.061],blackMetal,desk);
    const labelMaterial=standard(0xffffff,.89,0,{map:texture(labelCanvas),
      emissive:linear(.026,.023,.017),emissiveIntensity:.32});
    const label=plane([x,.934,.762],[.130,.055],labelMaterial,0,desk);
    label.rotation.x=-Math.PI/2;label.name=`WornAnswerPlate${letter}`;
  };
  for(const side of [-1,1]) {
    const x=side*.24;
    contact(x,.60,.47,.54);
    const housing=mesh(housingGeometry,ivory,[x,.87,.60],[.35,.12,.42],desk);
    housing.name='YellowedIvorySwitchCase';housing.castShadow=true;housingMeshes.push(housing);
    const seam=mesh(housingGeometry,blackResin,[x,.8162,.60],[.3512,.0035,.4212],desk);housingMeshes.push(seam);
    cylinder([x,.932,.60],.22,.017,blackResin,desk).castShadow=true;
    // Black gasket includes a narrow rolled lip that catches the lamp.
    const gasket=mesh(new THREE.TorusGeometry(.104,.006,8,64),blackResin,[x,.938,.60],null,desk);
    gasket.rotation.x=Math.PI/2;
    for(const screwSide of [-1,1]) {
      const sx=x+screwSide*.132;
      cylinder([sx,.9297,.435],.0095,.0025,brass,desk);
      const slot=box([sx,.93115,.435],[.0066,.0004,.0009],blackResin,desk);slot.rotation.y=screwSide*.28;
    }
    box([side*.13,.9325,.73],[.044,.006,.044],blackResin,desk);
    const indicatorMat=new THREE.MeshStandardMaterial({color:linear(.62,.54,.32),emissive:linear(.31,.24,.09),
      emissiveIntensity:.62,roughness:.36});
    box([side*.13,.9366,.73],[.0315,.0024,.0315],indicatorMat,desk);
    const button=mesh(capGeometry,side<0?red:yellow,[x,.95,.60],[.18,.048,.18],desk);
    button.name=side<0?'RedTheatreAnswer':'YellowTheatreAnswer';button.castShadow=true;
    button.userData.answer=side<0;button.userData.restY=.95;buttons.push(button);
    makeAnswerPlate(side<0?'A':'B',x);
  }
  const cables=[
    [[-.24,.842,.387],[-.27,.822,.34],[-.43,.822,.30],[-.54,.822,.19],[-.42,.822,.15],[-.07,.822,.20]],
    [[.24,.842,.387],[.28,.822,.34],[.46,.822,.28],[.53,.822,.18],[.67,.822,.19],[.79,.822,.143],[.84,.73,.15],[.86,.47,.22]],
  ];
  for(const points of cables) {
    const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));
    mesh(new THREE.TubeGeometry(curve,64,.0035,7,false),blackResin,[0,0,0],null,desk);
  }

  // Raised hands pivot at the spindle. The clock is driven by the reading
  // session, not wall time, and uses no new textures or geometry per frame.
  const tableClock=new THREE.Group();tableClock.name='MechanicalTableClock';
  tableClock.position.set(-.74,.883,.58);tableClock.rotation.x=25*Math.PI/180;desk.add(tableClock);
  cylinder([0,0,0],.22,.036,blackResin,tableClock).castShadow=true;
  cylinder([0,.0183,0],.208,.005,brass,tableClock);
  cylinder([0,.0215,0],.197,.0035,standard(linear(.0035,.005,.0045),.64),tableClock);
  const dialPaint=standard(linear(.43,.38,.27),.66);
  const clockTicks=new THREE.InstancedMesh(boxGeometry,dialPaint,60);
  const tickTransform=new THREE.Object3D();
  for(let i=0;i<60;i++) {
    const a=i*Math.PI/30,r=i%5?.086:.084;
    tickTransform.position.set(r*Math.sin(a),.0236,-r*Math.cos(a));
    tickTransform.rotation.y=-a;tickTransform.scale.set(i%5?.0012:.0025,.0008,i%5?.0038:.010);
    tickTransform.updateMatrix();clockTicks.setMatrixAt(i,tickTransform.matrix);
  }
  clockTicks.receiveShadow=true;tableClock.add(clockTicks);
  const numeralCanvas=canvas(256),nc=numeralCanvas.getContext('2d');
  nc.font='22px serif';nc.fillStyle='#bcb08a';nc.textAlign='center';nc.textBaseline='middle';
  for(const [number,x,z] of [['12',128,43],['3',213,128],['6',128,213],['9',43,128]])nc.fillText(number,x,z);
  const numerals=plane([0,.0239,0],[.177,.177],standard(0xffffff,.75,0,
    {map:texture(numeralCanvas),transparent:true,alphaTest:.015}),0,tableClock);
  numerals.rotation.x=-Math.PI/2;
  const hourPivot=new THREE.Group(),minutePivot=new THREE.Group(),secondPivot=new THREE.Group();
  hourPivot.position.y=.0248;minutePivot.position.y=.0256;secondPivot.position.y=.0265;
  tableClock.add(hourPivot,minutePivot,secondPivot);
  box([0,0,-.023],[.004,.001,.048],dialPaint,hourPivot);
  box([0,0,-.034],[.0028,.001,.070],dialPaint,minutePivot);
  const secondsPaint=standard(linear(.29,.105,.035),.55,0,{emissive:linear(.07,.013,.003),emissiveIntensity:.06});
  box([0,0,-.038],[.0018,.0008,.084],secondsPaint,secondPivot);
  box([0,0,.019],[.0042,.0008,.020],secondsPaint,secondPivot);
  cylinder([0,.0271,0],.0085,.002,brass,tableClock);
  const clockState={elapsed:0,remaining:null,duration:0,urgent:false};
  function setClock(secondsElapsed=0,remaining=null,duration=0){
    const elapsed=Math.max(0,Number.isFinite(secondsElapsed)?secondsElapsed:0);
    const total=Math.max(0,Number.isFinite(duration)?duration:0);
    const left=Number.isFinite(remaining)?Math.max(0,remaining):null;
    secondPivot.rotation.y=-(elapsed%60)*Math.PI/30;
    minutePivot.rotation.y=-21*Math.PI/180-(elapsed%3600)*Math.PI/1800;
    hourPivot.rotation.y=-48*Math.PI/180-(elapsed%43200)*Math.PI/21600;
    const urgent=total>0&&left!==null&&left>0&&left<=3;
    if(urgent!==clockState.urgent){
      secondsPaint.color.copy(urgent?linear(.49,.031,.011):linear(.29,.105,.035));
      secondsPaint.emissiveIntensity=urgent?.24:.06;
    }
    clockState.elapsed=elapsed;clockState.remaining=left;clockState.duration=total;clockState.urgent=urgent;
  }
  setClock();
  const clockGlass=new THREE.MeshPhysicalMaterial({color:0xffffff,transparent:true,opacity:.09,
    roughness:.16,metalness:0,depthWrite:false,clearcoat:1,clearcoatRoughness:.16});
  cylinder([0,.0286,0],.194,.0008,clockGlass,tableClock);
  contact(-.74,.60,.29,.26);
  for(const side of [-1,1])box([-.74+side*.06,.825,.60],[.04,.02,.07],blackResin,desk);

  // A failing old wall lamp reveals the peeling room and pipes independently
  // of the television, keeping spatial depth during signal dropouts.
  const mount=cylinder([-3.55,2.42,-2.18],.19,.05,metal);mount.rotation.z=Math.PI/2;
  box([-3.38,2.45,-2.18],[.31,.04,.04],metal);
  const shade=mesh(new THREE.CylinderGeometry(.045,.15,.09,48,1,true),blackMetal,[-3.27,2.40,-2.18]);
  const bulbMat=new THREE.MeshBasicMaterial({color:linear(.46,.23,.08),toneMapped:false});
  sphere([-3.27,2.33,-2.18],[.065,.05,.065],bulbMat);
  cylinder([-3.53,1.83,-2.18],.018,.92,metal);
  box([-3.51,1.40,-2.18],[.10,.18,.13],ivory);
  box([-3.44,1.40,-2.18],[.02,.07,.04],blackResin);
  for(let i=0;i<3;i++) {
    pipe([-3.10+i*.18,3.34,-5.375],[-3.10+i*.18,3.34,4.575],.025,metal);
    for(let j=0;j<5;j++) {
      const collar=cylinder([-3.10+i*.18,3.34,-4.35+j*1.95],.075,.03,rust);collar.rotation.x=Math.PI/2;
    }
  }
  box([-2.97,3.30,3.78],[.64,.17,.31],metal);

  // Wall clock faces inward along the left wall, as it does in the native room.
  const wallClock=new THREE.Group();wallClock.position.set(-3.48,2.67,-.15);wallClock.rotation.y=Math.PI/2;room.add(wallClock);
  const wallCase=cylinder([0,0,0],.51,.07,metal,wallClock);wallCase.rotation.x=Math.PI/2;
  const dialCanvas=canvas(512),dc=dialCanvas.getContext('2d');dc.fillStyle='#aca68e';dc.fillRect(0,0,512,512);dc.translate(256,256);
  dc.strokeStyle='#242723';dc.lineCap='round';
  for(let i=0;i<60;i++){dc.save();dc.rotate(i*Math.PI/30);dc.lineWidth=i%5?2:6;dc.beginPath();dc.moveTo(0,-218);dc.lineTo(0,i%5?-205:-189);dc.stroke();dc.restore();}
  dc.lineWidth=10;dc.beginPath();dc.moveTo(0,0);dc.lineTo(65,-84);dc.stroke();dc.lineWidth=6;dc.beginPath();dc.moveTo(0,0);dc.lineTo(-102,60);dc.stroke();
  const wallFace=mesh(new THREE.CircleGeometry(.225,64),standard(0xffffff,.88,0,{map:texture(dialCanvas)}),[0,0,.041],null,wallClock);

  function chair(x,z,angle=0) {
    const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=angle;room.add(g);
    box([0,.465,0],[.49,.065,.47],chairVinyl,g);
    const back=box([0,.785,.195],[.49,.51,.058],chairVinyl,g);back.rotation.x=-.10;
    for(const sx of [-1,1])for(const sz of [-1,1])pipe([sx*.195,.035,sz*.19],[sx*.18,.44,sz*.17],.013,metal,g);
    for(const sx of [-1,1])pipe([sx*.18,.44,.18],[sx*.18,1.01,.23],.012,metal,g);
    const wornSeam=box([0,.78,.225],[.38,.007,.001],standard(linear(.23,.20,.14),.97),g);
    const sag=box([-.12,.498,-.10],[.17,.001,.06],standard(linear(.067,.074,.061),.97),g);sag.rotation.y=.24;
    return g;
  }
  for(let i=0;i<3;i++)chair(3.16,-1.67+i*1.25,-Math.PI/2);
  chair(-2.72,3.60,Math.PI*.74);
  chair(-2.59,-4.30,.16).rotation.z=.035;
  chair(2.60,-4.51,-.10).rotation.z=-.043;
  chair(2.60,-3.35,-.27);
  box([2.08,1.17,4.77],[1.12,2.38,.13],blackMetal);
  box([2.08,1.13,4.69],[.97,2.22,.07],lowerPaint);
  box([2.08,1.59,4.648],[.75,1.03,.015],standard(linear(.027,.035,.025),.94));
  box([2.08,.36,4.64],[.62,.28,.02],blackMetal);
  for(let i=0;i<5;i++)box([2.08,.26+i*.05,4.625],[.60,.012,.015],metal);
  sphere([1.71,1.11,4.596],[.035,.035,.035],brass);
  box([2.97,.94,3.12],[.67,.60,.62],metal);
  box([2.96,1.44,3.11],[.44,.34,.18],blackMetal);
  box([2.96,1.45,3.008],[.36,.255,.012],standard(linear(.007,.009,.009),.34));
  box([2.96,1.225,3.11],[.055,.14,.07],metal);box([2.96,1.165,3.11],[.28,.02,.22],metal);
  box([-2.78,.67,3.78],[.95,1.34,.57],lowerPaint);
  for(let i=0;i<3;i++)box([-2.78,.95-i*.28,3.487],[.82,.19,.01],metal);
  box([1.75,3.44,-1.74],[1,.10,.63],metal);
  for(let i=0;i<12;i++)box([1.31+i*.08,3.38,-1.74],[.032,.012,.56],blackMetal);

  // Phosphor light comes from the television itself. A short-range bounce
  // lights the case, nearby floor and tabletop; there is no frustum or beam.
  const tvLight=new THREE.PointLight(0xcbded1,2.9,4.6,2);
  tvLight.position.set(0,1.61,-.19);room.add(tvLight);
  const floorSpill=new THREE.SpotLight(0xcbd9cc,4.4,3.9,.87,.98,2);
  floorSpill.position.set(0,1.25,-.17);floorSpill.target.position.set(0,.015,-1.36);
  room.add(floorSpill,floorSpill.target);
  const deskFill=new THREE.SpotLight(0xffedc8,2.8,2.75,1.0,.92,2);
  deskFill.position.set(0,1.67,1.14);deskFill.target.position.set(0,.85,.53);
  deskFill.castShadow=true;deskFill.shadow.mapSize.set(1024,1024);deskFill.shadow.bias=-.00012;
  deskFill.shadow.normalBias=.005;deskFill.shadow.camera.near=.1;deskFill.shadow.camera.far=3;
  room.add(deskFill,deskFill.target);
  const practicalLight=new THREE.PointLight(0xe5ab66,8.4,4.1,2);
  practicalLight.position.set(-3.24,2.31,-2.18);room.add(practicalLight);
  // A restricted warm leak grazes the cabinet's upper left and controls. Its
  // axis points past the glass toward the plastic rim, leaving white phosphor
  // and the answer desk at their existing exposure.
  const caseFill=new THREE.SpotLight(0xd5bb8e,3.2,2.55,.57,.91,2);
  caseFill.position.set(-1.05,2.36,.07);caseFill.target.position.set(-.46,1.86,-.71);
  room.add(caseFill,caseFill.target);
  room.add(new THREE.HemisphereLight(0xb5b8ad,0x21261e,.13));
  const rearFill=new THREE.PointLight(0xb3b6ad,1.7,4.2,2);rearFill.position.set(-.9,2.6,3.9);room.add(rearFill);
  const wallFill=new THREE.PointLight(0xa5ada5,5.2,5.4,2);wallFill.position.set(0,2.90,-4.4);room.add(wallFill);

  const threat=new THREE.Group();threat.name='Observer';threat.position.set(-2.75,1,-2.35);room.add(threat);
  const silhouette=standard(linear(.002,.003,.0025),.99);
  sphere([0,.06,0],[.145,.30,.11],silhouette,threat);
  sphere([0,.30,0],[.21,.11,.115],silhouette,threat);
  sphere([0,.53,0],[.125,.175,.105],silhouette,threat);
  cylinder([0,.37,0],.10,.18,silhouette,threat);
  for(const side of [-1,1]) {
    pipe([side*.21,.32,0],[side*.30,-.42,0],.038,silhouette,threat);
    sphere([side*.31,-.43,.015],[.045,.08,.035],silhouette,threat);
    pipe([side*.10,-.19,0],[side*.10,-.96,0],.046,silhouette,threat);
    sphere([side*.10,-.95,.055],[.06,.05,.115],silhouette,threat);
  }
  sphere([0,.48,.107],[.0325,.02,.0125],new THREE.MeshStandardMaterial({color:linear(.64,.56,.29),
    emissive:linear(.25,.21,.09),emissiveIntensity:.8,roughness:.7}),threat);
  threat.visible=false;

  // Native hardware export is optional for booting; replacement preserves each
  // mesh's pose and userData, so in-flight ray intersections remain cap-only.
  const loadHardware=async()=>{
    try {
      const decode=(record)=>{
        if(!record?.positions)return null;
        const geometry=new THREE.BufferGeometry();
        geometry.setAttribute('position',new THREE.Float32BufferAttribute(record.positions,3));
        if(record.normals)geometry.setAttribute('normal',new THREE.Float32BufferAttribute(record.normals,3));
        if(record.uvs)geometry.setAttribute('uv',new THREE.Float32BufferAttribute(record.uvs,2));
        if(record.indices)geometry.setIndex(record.indices);
        if(!record.normals)geometry.computeVertexNormals();return geometry;
      };
      const records=await Promise.all(['SM_TheaterHousing','SM_TheaterCap'].map(async name=>{
        const response=await fetch(`./assets/hardware/${name}.json`);
        if(!response.ok)throw new Error(`${name}: HTTP ${response.status}`);
        return response.json();
      }));
      const h=decode(records[0]),c=decode(records[1]);
      if(h){for(const m of housingMeshes)m.geometry=h;housingGeometry.dispose();housingGeometry=h;}
      if(c){for(const b of buttons)b.geometry=c;capGeometry.dispose();capGeometry=c;}
    } catch(error) { console.warn('Theatre hardware export unavailable; authored profile retained.',error); }
  };
  const ready=Promise.all([projection.ready,loadHardware()]);
  function update(time,dt) {
    const seconds=Number.isFinite(time)?time:0,delta=Math.max(0,Math.min(Number.isFinite(dt)?dt:0,.1));
    projection.update(seconds,delta);
    const gain=projection.gain??1;
    tvLight.intensity=2.9*gain;floorSpill.intensity=4.4*gain;
    practicalLight.intensity=8.4*(1+(reducedMotion?0:Math.sin(seconds*.19)*.018));
    glowUniforms.uGain.value=gain;
    powerMaterial.emissiveIntensity=.58;
    for(const button of buttons) {
      const down=button.userData.pressedUntil&&seconds<button.userData.pressedUntil;
      const target=button.userData.restY-(down?.011:0);
      button.position.y=THREE.MathUtils.damp(button.position.y,target,down?55:20,delta);
    }
    threat.rotation.y=Math.atan2(-threat.position.x,2.5-threat.position.z);
  }
  return {buttons,screen,threat,practicalLight,tvSource,tvLight,television,update,ready,projection,setClock,
    drawSlide:(slide,options)=>projection.drawSlide(slide,options),
    setReducedMotion(value){reducedMotion=Boolean(value);projection.setReducedMotion(reducedMotion);},
    get transitionActive(){return projection.transitionActive;},
    get atmosphere(){return {type:'crt-tv',tvSource:tvSource.toArray().map(v=>Number(v.toFixed(4))),
      television:{cabinet:{width:tvWidth,height:tvHeight,depth:tvDepth},
        activeScreen:{width:tubeWidth,height:tubeHeight},curvature:tubeBulge,curvedGeometry:true,
        glow:{gain:glowUniforms.uGain.value,strength:.065},power:{on:true,led:powerMaterial.emissiveIntensity},
        roundedBezel:true,sideVents:true,speakerGrille:true,controls:2,screenLight:tvLight.intensity},
      environment:{screenBounce:tvLight.intensity,floorSpill:floorSpill.intensity,
        wallPractical:practicalLight.intensity,ambient:.13,rearFill:rearFill.intensity,wallFill:wallFill.intensity,caseFill:caseFill.intensity,
        weatheredPlaster:true,frontChairs:3,fogDensity:scene.fog?.density??null},
      answerPlates:{red:'A',yellow:'B'},clock:{...clockState,secondHandAngle:secondPivot.rotation.y}};},
  };
}
